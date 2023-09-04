# -*- coding: utf-8 -*-
"""
Created on Fri Aug 25 13:34:29 2023

@author: Andrea
"""
from neo4j import GraphDatabase
import yaml
import sys

uri = "bolt://localhost:7687"
user = "neo4j"
password = "sindit-neo4j"


def generate_dependency_graph():
    try:
        # Create a Neo4j session
        #with driver.session() as session:
            #session.write_transaction(create_database, "version1")

        n = len(sys.argv)
        if (n < 2):
            print("Error: path of the docker-compose file to analyse shoud be passed as command line argument")
            return
        project_path = sys.argv[1]
            
        with open(project_path, 'r') as compose_file:
            compose_data = yaml.load(compose_file, Loader=yaml.FullLoader)
            
        driver = GraphDatabase.driver(uri, auth=(user, password), encrypted=False)
        with driver.session() as session:
            
            # Create a System node to maitain all the system level metrics
            session.run("CREATE (S:System {N: $N, SC: $SC, SCF: $SCF, ADSA: $ADSA})", N=0, SC=0, SCF=0, ADSA=0)
            # Iterate through services and extract depends_on dependencies
            for service_name, service_info in compose_data['services'].items():
                #print("Service name: ", service_name, ", Service info: ", service_info, "\n")
                
                # Create a node for the service
                session.run("MERGE (s:Service {name: $name, ADS: $ADS})", name=service_name, ADS=0)
                # Update system metrics
                session.run("MATCH (S:System) SET S.N = S.N+1")
                
                if 'depends_on' in service_info:
                    dependencies = service_info['depends_on']

                    # Create relationships for dependencies
                    for dependency in dependencies:
                        session.run("MATCH (s1:Service {name: $name1}), (s2:Service {name: $name2}) "
                                    "MERGE (s1)-[:DEPENDS_ON {value: 1}]->(s2) SET s1.ADS = s1.ADS+1",
                                    name1=service_name, name2=dependency)
                        # Update system metrics
                        session.run("MATCH (S:System) SET S.SC = S.SC+1")
                    
            # Update system metrics
            SC = session.run("MATCH (S:System) RETURN S.SC").single().value()
            N = session.run("MATCH (S:System) RETURN S.N").single().value()
            SCF = SC / (pow(N,2) - N)/2
            print("Number of services: ", N, ", SC: ", SC, ", SCF: ", SCF)
            ADSA = SC/N
            session.run("MATCH (S:System) SET S.SCF = $scf, S.ADSA = $adsa", scf=SCF, adsa=ADSA)
            print("ADS sum: ", ADSA)

            # Create fake system nodes to simulate project evolution
            session.run("CREATE (S:System {N: $N, SC: $SC, SCF: $SCF, ADSA: $ADSA})", N=19, SC=38, SCF=0.064, ADSA=1.99)
            session.run("CREATE (S:System {N: $N, SC: $SC, SCF: $SCF, ADSA: $ADSA})", N=20, SC=44, SCF=0.08, ADSA=2.4)
            session.run("CREATE (S:System {N: $N, SC: $SC, SCF: $SCF, ADSA: $ADSA})", N=20, SC=33, SCF=0.07, ADSA=1.9)
            session.run("CREATE (S:System {N: $N, SC: $SC, SCF: $SCF, ADSA: $ADSA})", N=20, SC=30, SCF=0.04, ADSA=1.78)
                        
    except Exception as e:
        print('Error:', e)
    finally:
        driver.close()

generate_dependency_graph()