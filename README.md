# DTOps: A Digital Twin dashboard for DevOps and TechDebt based on neodash

## Installation

node version v20.2.0
yarn version 1.22.19

## Preparation

Launch databases in docker:

```bash
docker compose up
```

Open Neo4j Browser at http://localhost:7474
user name: neo4j, password: sindit-neo4j

If the database is empty, copy the content in samples/sample-data.cypher and past it into the query box, then execute the query.

## Install dependencies

```
yarn install
```

## Start up

```
yarn run dev
```

Open the dashboard in browser: http://localhost:3000, choose "Existing Dashboard". In the opened dialog, choose neo4j database from localhost, 7687 (should be the default one). Same user name and password as above.

# Testing demo

Pick an existing project to analyse.

Run the Python script to generate a dependency graph from the project's docker-compose file:

```
cd python_dependency_graph_generator
python docker_dependency_graph_generator.py <absolute_path_of_the_docker-compose_file>
```

Note: the script generates some fake data to simulate project evolution.

From the dashboard add the following reports:

1.  Number of Services <br>
    Configuration:<br>

    - Title: Number of Services
    - Type: Single Value <br>
    - Cypher query:
      ```
      MATCH (Sm:System)
      RETURN Sm.N
      LIMIT 1
      ```

2.  Sum of Calls <br>
    Configuration:<br>

    - Title: Sum of Calls
    - Type: Single Value <br>
    - Cypher query:
      ```
      MATCH (Sm:System)
      RETURN Sm.SC
      LIMIT 1
      ```

3.  Service Coupling Factor <br>
    Configuration:<br>

    - Title: Service Coupling Factor
    - Type: Single Value <br>
    - Cypher query:
      ```
      MATCH (Sm:System)
      RETURN Sm.SCF
      LIMIT 1
      ```

4.  Absolute Dependence of the Service Avg <br>
    Configuration:<br>

    - Title: Absolute Dependence of the Service Avg
    - Type: Single Value <br>
    - Cypher query:
      ```
      MATCH (Sm:System)
      RETURN Sm.ADSA
      LIMIT 1
      ```

5.  Dependencies Sankey Chart <br>
    Configuration:<br>

    - Title: Dependencies Sankey Chart
    - Type: Sankey Chart <br>
      Note: if the Sankey Chart is not available, open the dashboard's sidebar, go to Extensions, and activate Advanced Visualizations.
    - Cypher query:
      ```
      MATCH (n:Service)
      OPTIONAL MATCH (n)-[r]-(m)
      RETURN n,r,m
      ```

6.  Evolution of SC <br>
    Configuration:<br>

    - Title: Evolution of SC
    - Type: Line Chart <br>
    - Cypher query:
      ```
      MATCH (n:System)
      WITH collect(n) as nodes
      WITH apoc.coll.zip(nodes, range(0, size(nodes))) as pairs
      UNWIND pairs as pair
      RETURN pair[0].SC as SC, pair[1] as ID
      ```

7.  Evolution of ADSA <br>
    Configuration:<br>
    - Title: Evolution of ADSA
    - Type: Line Chart <br>
    - Cypher query:
      ```
      MATCH (n:System)
      WITH collect(n) as nodes
      WITH apoc.coll.zip(nodes, range(0, size(nodes))) as pairs
      UNWIND pairs as pair
      RETURN pair[0].ADSA as ADSA, pair[1] as ID
      ```

# DTOps pending features

1. Architecture Debt: Microservices (Temporal) Coupling Metrics and Visualization

   1.1 (Temporal) Coupling Metrics

   1.2 Visualization(s)

2. DevOps metrics

   2.1 DORA metrics

   2.2 DevOps process metrics

Run MQTT-Kafka bridge:

```
yarn run mqtt-kafka-bridge
```

# Original README from NeoDash

## NeoDash - Neo4j Dashboard Builder

NeoDash is an open source tool for visualizing your Neo4j data. It lets you group visualizations together as dashboards, and allow for interactions between reports.

![screenshot](public/screenshot.png)

Neodash supports presenting your data as tables, graphs, bar charts, line charts, maps and more. It contains a Cypher editor to directly write the Cypher queries that populate the reports. You can save dashboards to your database, and share them with others.

## Try NeoDash

You can run NeoDash in one of three ways:

1. You can install NeoDash into Neo4j Desktop from the [graph app gallery](https://install.graphapp.io). NeoDash will automatically connect to your active database.
2. You can run NeoDash from a web browser by visiting http://neodash.graphapp.io.
3. For on-prem deployments, you can build the application yourself, or pull the latest Docker image from Docker Hub.

```
# Run the application on http://localhost:5005
docker pull neo4jlabs/neodash:latest
docker run -it --rm -p 5005:5005 neo4jlabs/neodash
```

> Windows users may need to prefix the `docker run` command with `winpty`.

## Build and Run

This project uses `yarn` to install, run, build prettify and apply linting to the code.

To install dependencies:

```
yarn install
```

To run the application in development mode:

```
yarn run dev
```

To build the app for deployment:

```
yarn run build
```

To manually prettify all the project `.ts` and `.tsx` files, run:

```
yarn run format
```

To manually run linting of all your .ts and .tsx files, run:

```
yarn run lint
```

To manually run linting of all your .ts and .tsx staged files, run:

```
yarn run lint-staged
```

See the [Developer Guide](https://neo4j.com/labs/neodash/2.2/developer-guide/) for more on installing, building, and running the application.

### Pre-Commit Hook

While commiting, a pre-commit hook will be executed in order to prettify and run the Linter on your staged files. Linter warnings are currently accepted. The commands executed by this hook can be found in /.lintstagedrc.json.

There is also a dedicated linting step in the Github project pipeline in order to catch each potential inconsistency.

> Don't hesitate to setup your IDE formatting feature to use the Prettier module and our defined rules (.prettierrc.json).

## User Guide

NeoDash comes with built-in examples of dashboards and reports. For more details on the types of reports and how to customize them, see the [User Guide](https://neo4j.com/labs/neodash/2.2/user-guide/).

## Publish Dashboards

After building a dashboard, you can chose to deploy a read-only, standalone instance for users. See [Publishing](https://neo4j.com/labs/neodash/2.2/user-guide/publishing/) for more on publishing dashboards.

## Questions / Suggestions

If you have any questions about NeoDash, please reach out to the maintainers:

- Create an [Issue](https://github.com/neo4j-labs/neodash/issues/new) on GitHub for feature requests/bugs.
- Connect with us on the [Neo4j Discord](https://neo4j.com/developer/discord/).
- Create a post on the Neo4j [Community Forum](https://community.neo4j.com/).

> NeoDash is a free and open-source tool developed by the Neo4j community - not an official Neo4j product. If you have a need for a commercial agreement around training, custom extensions or other services, please contact the [Neo4j Professional Services](https://neo4j.com/professional-services/) team.
