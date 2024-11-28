/**
 * Generic constructor type.
 */
export interface Constructor<T> {
  new (...args: any[]): T;
  prototype?: any;
}

declare global {
  interface Object {
    into<T>(targetType: Constructor<T>): T;
    clone(): this;
    equals(other: any): boolean;
  }
}
