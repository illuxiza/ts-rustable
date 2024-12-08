/**
 * Generic constructor type.
 */
export interface Constructor<T> {
  new (...args: any[]): T;
  prototype?: any;
}
