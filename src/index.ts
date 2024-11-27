/**
 * Rustable - A TypeScript Library for Rust-Inspired Programming
 *
 * Rustable brings Rust's powerful features and programming patterns to TypeScript,
 * enabling more robust and maintainable code through:
 *
 * - Type-safe null handling with Option<T>
 * - Explicit error handling with Result<T, E>
 * - Trait-based polymorphism
 * - Powerful iterator utilities
 * - Pattern matching
 * - Efficient data structures
 */

/**
 * Trait System
 *
 * Implements Rust-like traits for TypeScript, enabling interface-based polymorphism
 * with compile-time checks.
 */
export { trait, implTrait, useTrait, hasTrait } from './trait';

/**
 * Type Conversion Traits
 *
 * Provides From and Into traits for type-safe conversions between types.
 */
export { From, from, implFrom } from './from';

/**
 * Iterator Utilities
 *
 * Rich set of iterator operations inspired by Rust's Iterator trait.
 * Provides functions for working with iterables in a functional style:
 * 
 * Access all iterator functions through the `iter` namespace.
 * 
 * Available functions:
 * - takeWhile/skipWhile: Conditional iteration
 * - chunks/windows: Sequence grouping
 * - pairwise: Adjacent element pairs
 * - enumerate: Indexed iteration
 * - groupBy: Element grouping
 * - product: Cartesian products
 * - permutations/combinations: Sequence arrangements
 * - zip: Combine multiple iterables
 */
export { iter } from './iter';

/**
 * HashMap Implementation
 *
 * Type-safe hash map with efficient key-value storage.
 * Provides a Map-like interface with Option-based value retrieval.
 */
export { HashMap } from './map';

/**
 * Option Type
 *
 * Type-safe alternative to null/undefined for optional values.
 * Provides methods for safe value manipulation and error handling.
 */
export { Option, Some, None } from './option';

/**
 * Result Type
 *
 * Explicit error handling with Ok and Err variants.
 * Enables type-safe error handling and value transformation.
 */
export { Result, Ok, Err } from './result';

/**
 * Type System Utilities
 *
 * Runtime type identification and operations.
 * Provides consistent type IDs across instances.
 */
export { typeId, TypeId } from './type_id';

/**
 * Pattern Matching
 *
 * Rust-style enums and pattern matching system.
 * Enables type-safe variant handling and exhaustive matching.
 */
export { Enum, variant } from './match';

/**
 * Hashing Utilities
 *
 * Consistent hash generation for any value.
 * Provides deterministic hash codes for objects and primitives.
 */
export { hash } from './hash';

/**
 * String Formatting
 *
 * Consistent string representation for any value.
 * Handles circular references and complex object structures.
 */
export { stringify } from './stringfy';
