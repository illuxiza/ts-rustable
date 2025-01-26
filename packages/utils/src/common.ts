/**
 * Generic constructor type.
 */
export interface Constructor<T = any> {
  new (...args: any[]): T;
  prototype?: any;
}

/**
 * Error indicating that a method is not implemented.
 */
export const NOT_IMPLEMENTED = new Error('Not implemented.');