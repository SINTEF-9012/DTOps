import yaml from 'js-yaml';
import { Microservice } from '../Common';

const dockerCompFileUrl =
  // 'https://raw.githubusercontent.com/microservices-patterns/ftgo-application/558dfc53b11d30a5f1d995c0c6d58d5106c28189/docker-compose.yml';
  // 'https://raw.githubusercontent.com/ewolff/microservice-consul/master/docker/docker-compose.yml';
  // 'https://raw.githubusercontent.com/dotnet-architecture/eShopOnContainers/dev/src/docker-compose.yml';
  'https://raw.githubusercontent.com/lelylan/lelylan/master/docker-compose.yml';

const resourcesKeywords = ['mongo', 'sql', 'mysql', 'postgres', 'neo4j', 'redis', 'memcached'];

interface DockerComposeConfig {
  version: string;
  services: Record<string, any>;
}

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

export async function getArchitectureFromDockerCompose() {
  let parsedDockerCompose: DockerComposeConfig | null = await parseDockerComposeFile();
  let microservices: Microservice[] = [];
  for (const serviceName in parsedDockerCompose?.services) {
    const service = parsedDockerCompose.services[serviceName];

    // Check if the service is a resource
    let isResource = false;
    resourcesKeywords.map((dbKey) => {
      if (
        parsedDockerCompose &&
        (parsedDockerCompose.services[serviceName]?.image?.includes(dbKey) || serviceName.includes(dbKey))
      ) {
        isResource = true;
      }
    });

    // Get dependencies
    let dependencies: String[] = [];
    if (service.depends_on || service?.links) {
      const deps = service.depends_on ? service.depends_on : service.links;
      dependencies = deps;
      console.log('Dependencies: ' + dependencies);
    }

    // Create the microservices list
    const microservice = {
      name: serviceName,
      isResource: isResource,
      dependencies: dependencies,
    };
    microservices.push(microservice);
  }
  return microservices;
}
