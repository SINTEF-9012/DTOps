export interface Microservice {
  name: String;
  dependencies: String[];
  isResource: Boolean;
}

export enum ArchitectureSource {
  DockerCompose,
  Misar,
}
