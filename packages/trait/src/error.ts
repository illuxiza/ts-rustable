/**
 * Base class for all trait-related errors
 */
export class TraitError extends Error {
  constructor(message: string) {
    super(message);
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
  }
}

export class NotImplementedError extends TraitError {
  constructor() {
    super('Not implemented.');
  }
}

/**
 * Error thrown when a trait is not implemented
 */
export class TraitNotImplementedError extends TraitError {
  constructor(targetName: string, traitName: string) {
    super(`Trait ${traitName} not implemented for ${targetName}`);
  }
}

/**
 * Error thrown when a trait method is not implemented
 */
export class MethodNotImplementedError extends TraitError {
  constructor(traitName: string, methodName: string) {
    super(`Method ${methodName} not defined in trait ${traitName}`);
  }
}
