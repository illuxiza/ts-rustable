import { Constructor } from '@rustable/utils';

declare global {
  interface Object {
    into<T>(targetType: Constructor<T>): T;
    clone(): this;
    equals(other: any): boolean;
  }
}

export * from './clone';
export * from './eq';
export * from './from';
export * from './iter';
