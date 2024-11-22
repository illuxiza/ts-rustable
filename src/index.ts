// Core trait system
export { trait, useTrait, doesImplement } from './trait';

// Built-in traits
export { Into, into } from './into';

// Utility types
export { Option, Some, None, isNone, isSome } from './option';
export { Result, Ok, Err, isErr, isOk } from './result';

// Type system utilities
export { typeId, TypeId, TypeIdMap } from './type_id';
