import { getArchitectureFromDockerCompose } from './DockerComposeParsing/dockerComposeParsing';
import { Microservice, ArchitectureSource } from './Common';

/**
 * Architecture represents a class that requires initialization before any operation.
 * Ensure you await the initialization using `initialize` method before using any other methods.
 */
export class Architecture {
  microservices: Microservice[];
  isInitialized: Boolean = false;
  private initializationPromise: Promise<void> | null = null;

  public constructor(architectureSource: ArchitectureSource) {
    this.initializationPromise = this.initialize(architectureSource);
  }

  async initialize(architectureSource: ArchitectureSource) {
    switch (architectureSource) {
      case ArchitectureSource.DockerCompose: {
        this.microservices = await getArchitectureFromDockerCompose();
        break;
      }
      case ArchitectureSource.Misar: {
        // this.microservices = ...
        break;
      }
    }
    this.isInitialized = true;
  }

  public async getMicroservices() {
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
    return this.microservices;
  }
}
