/**
 * Base class for all trait-related errors
 */
export class TraitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TraitError';
  }
}

/**
 * Error thrown when a trait has multiple implementations
 */
export class MultipleImplementationError extends TraitError {
  constructor(targetName: string, methodName: string) {
    super(
      `Multiple implementations of method ${methodName} for ${targetName}, please use useTrait`,
    );
    this.name = 'MultipleImplementationError';
  }
}

/**
 * Error thrown when a trait is not implemented
 */
export class TraitNotImplementedError extends TraitError {
  constructor(targetName: string, traitName: string) {
    super(`Trait ${traitName} not implemented for ${targetName}`);
    this.name = 'TraitNotImplementedError';
  }
}

/**
 * Error thrown when a trait method is not implemented
 */
export class MethodNotImplementedError extends TraitError {
  constructor(traitName: string, methodName: string) {
    super(`Method ${methodName} not defined in trait ${traitName}`);
    this.name = 'MethodNotImplementedError';
  }
}
