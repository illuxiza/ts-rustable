import { HashMap } from './map';

/**
 * A type-safe hash set implementation similar to Rust's HashSet.
 * Provides efficient storage and lookup of unique values.
 *
 * Key features:
 * - Type-safe value type
 * - Efficient hash-based storage
 * - Standard Set interface compatibility
 * - Built on top of HashMap implementation
 *
 * @example
 * const set = new HashSet<string>();
 * set.add('one');
 * set.add('two');
 *
 * console.log(set.has('one')); // true
 * console.log(set.size); // 2
 *
 * @template T The type of values stored in the set
 */
export class HashSet<T> implements Iterable<T> {
  /**
   * Internal storage using HashMap with dummy value
   */
  #map: HashMap<T, boolean>;

  /**
   * Creates a new HashSet
   * @param values The values to add to the set
   */
  constructor(values?: Iterable<T>) {
    this.#map = new HashMap<T, boolean>();
    if (values) {
      for (const value of values) {
        this.add(value);
      }
    }
  }

  /**
   * Adds a value to the set
   * @param value The value to add
   * @returns true if the value was newly added, false if it was already present
   */
  add(value: T): boolean {
    const wasPresent = this.#map.get(value).isSome();
    this.#map.set(value, true);
    return !wasPresent;
  }

  /**
   * Checks if a value exists in the set
   * @param value The value to check
   * @returns true if the value exists, false otherwise
   */
  has(value: T): boolean {
    return this.#map.get(value).isSome();
  }

  /**
   * Removes a value from the set
   * @param value The value to remove
   * @returns true if the value was present and removed, false if it wasn't present
   */
  delete(value: T): boolean {
    return this.#map.delete(value);
  }

  /**
   * Removes all values from the set
   */
  clear(): void {
    this.#map.clear();
  }

  /**
   * Returns the number of values in the set
   */
  get size(): number {
    return this.#map.size;
  }

  /**
   * Returns an iterator over the values in the set
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  /**
   * Returns an iterator over the values in the set
   */
  values(): IterableIterator<T> {
    const mapIterator = this.#map[Symbol.iterator]();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<T> {
        const result = mapIterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        return { done: false, value: result.value[0] };
      },
    };
  }
}
