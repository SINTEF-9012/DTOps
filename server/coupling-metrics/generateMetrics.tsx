import jsonGraph from '../dependency_graphs/1.7.8.json';
import gini from 'gini';

const dependencyGraph = jsonGraph;

function calculateGini(graph: any): number {
  const count: number[] = [];
  for (const node of graph.elements.nodes) {
    count.push(graph.elements.edges.filter((x) => x.data.source === node.data.id).length);
  }

  var result = gini.unordered(count).toFixed(3);

  return result;
}

export function GenerateMetricsNoArgs() {
  GenerateMetrics(dependencyGraph);
}

export function GenerateMetrics(json) {
  //const edges = json.elements.edges.filter(x => x["data"]["source"] !== undefined && x["data"]["source"] !== getRootId(json.elements)).length;
  const edges = json.elements.edges.filter((x) => x['data']['source'] !== undefined).length;

  const services = json.elements.nodes.filter((x) => x['data']['service'] !== undefined).length;
  const SCF = (edges / (services * services - services)).toFixed(2);
  const ADSA = (edges / services).toFixed(2);
  const gini = calculateGini(json);

  console.log('Metrics: ');
  console.log('SCF: ' + SCF);
  console.log('ADSA: ' + ADSA);
  console.log('gini: ' + gini);

  return {
    edges: edges,
    services: services,
    SCF: SCF,
    ADSA: ADSA,
    gini: gini,
    version: json.version,
    timestamp: json.timestamp,
  };
}
