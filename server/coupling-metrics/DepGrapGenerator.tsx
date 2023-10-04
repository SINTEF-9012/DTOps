import fs from 'fs';
import yaml from 'js-yaml';
import neo4j, { Integer } from 'neo4j-driver';
import { List } from 'reselect/es/types';
import jsonGraph from '../dependency_graphs/1.7.8.json';
import { parse } from 'url';
import gini from 'gini';

const dependencyGraph = jsonGraph;
const depFromDocker = true;

const dockerCompFileUrl =
  // 'https://raw.githubusercontent.com/dotnet-architecture/eShopOnContainers/dev/src/docker-compose.yml';
  'https://raw.githubusercontent.com/lelylan/lelylan/master/docker-compose.yml';
// 'https://raw.githubusercontent.com/microservices-patterns/ftgo-application/558dfc53b11d30a5f1d995c0c6d58d5106c28189/docker-compose.yml';
const uri = 'bolt://localhost:7687';
const user = 'neo4j';
const pw = 'sindit-neo4j';

const resourcesKeywords = ['mongo', 'sql', 'mysql', 'postgres', 'neo4j', 'redis', 'memcached'];

async function loadDockerComposeData() {
  try {
    const response = await fetch(dockerCompFileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch Docker Compose data');
    }
    const composeData = await response.text();
    return composeData;
  } catch (error) {
    console.error('Error loading Docker Compose data:', error);
    return null;
  }
}

interface DockerComposeConfig {
  version: string;
  services: Record<string, any>; // Define a generic Record type for services
  // Add other properties as needed
}

// Parse the Docker compose file to extract the services' dependencies
async function parseDockerComposeFile(): Promise<DockerComposeConfig | null> {
  const composeData = await loadDockerComposeData();
  let composeConfig: DockerComposeConfig | null = null;
  try {
    composeConfig = await yaml.load(composeData);
  } catch (error) {
    console.error('Error parsing Docker Compose data:', error);
    return null;
  }
  return composeConfig;
}

function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Input array is empty');
  }

  // Sorting values, preventing original array
  // from being mutated.
  values = [...values].sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2;
}

async function generateSystemLevelMetrics(session) {
  try {
    const resultSC = await session.run('MATCH (S:System) RETURN S.SC');
    const SC = resultSC.records[0].get('S.SC').toNumber();

    const resultN = await session.run('MATCH (S:System) RETURN S.N');
    const N = resultN.records[0].get('S.N').toNumber();
    resultN.records[0].values;

    let ADSs: number[] = [];
    let AISs: number[] = [];
    const resultADSs = await session
      .run('MATCH (s:Service) RETURN s.ADS as ADS, s.AIS as AIS ORDER BY ADS')
      .then((result) => {
        result.records.forEach((record, index: number) => {
          ADSs.push(record.get('ADS').toNumber());
          AISs.push(record.get('AIS').toNumber());
        });
      });

    const giniADSCoefficient: number = gini.unordered(ADSs);
    const SCF = SC / (Math.pow(N, 2) - N);
    const ADSA = SC / N;
    const adsMedian = median(ADSs);
    const aisMedian = median(AISs);

    // Update System node with SCF and ADSA values
    await session.run(
      'MATCH (S:System) SET S.SCF = $scf, S.ADSA = $adsa, S.giniADS = $giniADS, S.adsMedian = TOINTEGER($adsMedian), S.aisMedian = TOINTEGER($aisMedian)',
      {
        scf: SCF,
        adsa: ADSA,
        giniADS: giniADSCoefficient,
        adsMedian: adsMedian,
        aisMedian: aisMedian,
      }
    );
  } catch (error) {
    console.error('Error generating system level metrics:', error);
    return null;
  }
}

async function deletePreviousDatabase(session) {
  //Delete Database
  await session.run('match (s:Service) match (S:System) detach delete s,S');
}

export async function GenerateDepGraph() {
  if (depFromDocker) {
    GenerateDepGraphFromDockerCompose();
  } else {
    GenerateDepGraphFromSpinnakerJson();
  }
}

async function GenerateDepGraphFromDockerCompose() {
  // Neo4j config
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, pw));
  const session = driver.session();

  await deletePreviousDatabase(session);

  let parsedDockerCompose: DockerComposeConfig | null = await parseDockerComposeFile();

  // Create dependency graph
  if (parsedDockerCompose) {
    try {
      // Create a System node to maitain all the system level metrics
      const createSystemNodeQuery = `
      CREATE (S:System {N: TOINTEGER($n), SC: TOINTEGER($sc), SCF: $scf, ADSA: $adsa, adsMedian: TOINTEGER($adsMedian), aisMedian: TOINTEGER($aisMedian)})
    `;
      await session.run(createSystemNodeQuery, { n: 0, sc: 0, scf: 0, adsa: 0, adsMedian: 0, aisMedian: 0 });

      for (const serviceName in parsedDockerCompose.services) {
        const service = parsedDockerCompose.services[serviceName];

        // Check if the service is a resource
        let isResource = false;
        resourcesKeywords.map((dbKey) => {
          if (parsedDockerCompose && parsedDockerCompose.services[serviceName].image.includes(dbKey)) {
            isResource = true;
          }
        });

        // Create nodes for services
        const createServiceNodeQuery = `
        MATCH (S:System)
        CREATE (service:Service {name: $name, ADS: TOINTEGER($ads), AIS: TOINTEGER($ais), degree: TOINTEGER($degree), nodeSize: TOINTEGER($nodeSize), isResource: $isResource})
        SET S.N = S.N+1
      `;
        await session.run(createServiceNodeQuery, {
          name: serviceName,
          ads: 0,
          ais: 0,
          degree: 0,
          nodeSize: 1,
          isResource: isResource,
        });
      }

      for (const serviceName in parsedDockerCompose.services) {
        const service = parsedDockerCompose.services[serviceName];

        // Create relationships for dependencies
        if (service.depends_on) {
          for (const dependency of service.depends_on) {
            const createDependencyRelationshipQuery = `
            MATCH (s1:Service {name: $name1})
            MATCH (s2:Service {name: $name2})
            MATCH (S:System)
            SET s1.ADS = s1.ADS+1, s1.degree = s1.degree+1, s2.degree = s2.degree+1, s1.nodeSize=s1.nodeSize+1, s2.AIS = s2.AIS+1, S.SC = S.SC+1
            CREATE (s1)-[:DEPENDS_ON {value: 1}]->(s2) 
          `;
            await session.run(createDependencyRelationshipQuery, {
              name1: serviceName,
              name2: dependency,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error generating dependency graph: ' + error);
      return null;
    }

    await generateSystemLevelMetrics(session);

    // Close Neo4j session
    session.close();
    driver.close();

    console.log('Dependency graph generated');
  } else {
    console.error('Error: failed to retrieve services from docker compose file');
  }
}

export async function GenerateDepGraphFromSpinnakerJson() {
  // Neo4j config
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, pw));
  const session = driver.session();

  await deletePreviousDatabase(session);

  try {
    // Create a System node to maitain all the system level metrics
    const createSystemNodeQuery = `
      CREATE (S:System {N: TOINTEGER($n), SC: TOINTEGER($sc), SCF: $scf, ADSA: $adsa})
    `;
    await session.run(createSystemNodeQuery, { n: 0, sc: 0, scf: 0, adsa: 0 });

    // Create nodes for services
    for (const node of dependencyGraph.elements.nodes) {
      let name;
      if (node.data.service) name = node.data.service;
      else name = 'Root';

      //checking shared resource factor
      let srf;
      if ((node as { srf?: boolean })?.srf === true) {
        srf = true;
      } else {
        srf = false;
      }

      const createServiceNodeQuery = `
        MATCH (S:System)
        CREATE (service:Service {id: $id, name: $name, ADS: TOINTEGER($ads), nodeSize: TOINTEGER($nodeSize), SRF: $srf})
        SET S.N = S.N+1
      `;
      await session.run(createServiceNodeQuery, { name: name, ads: 0, nodeSize: 1, id: node.data.id, srf: srf });
    }

    // Create edges for dependencies
    for (const edge of dependencyGraph.elements.edges) {
      if (edge['data']['source'] !== undefined) {
        const source: string = edge.data.source;
        const target: string = edge.data.target;

        // Assuming if its http then the communication is sync, otherwise async
        let communication;
        if (edge.data.traffic.protocol === 'http') communication = 'sync';
        else communication = 'async';

        const createDependencyRelationshipQuery = `
        MATCH (s1:Service {id: $idSource})
        MATCH (s2:Service {id: $idTarget})
        MATCH (S:System)
        SET s1.ADS = s1.ADS+1, s1.nodeSize=s1.nodeSize+1
        SET S.SC = S.SC+1
        MERGE (s1)-[:DEPENDS_ON {value: 1, communication: $communication}]->(s2) 
      `;
        await session.run(createDependencyRelationshipQuery, {
          idSource: source,
          idTarget: target,
          communication: communication,
        });
      }
    }
  } catch (error) {
    console.error('Error generating dependency graph: ' + error);
    return null;
  }

  await generateSystemLevelMetrics(session);

  // Close Neo4j session
  session.close();
  driver.close();

  console.log('Dependency graph generated');
}
