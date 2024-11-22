import { hash } from './hash';
import { None, Option, Some } from './option';

/**
 * A type-safe hash map implementation similar to Rust's HashMap.
 * Provides efficient key-value storage with support for any hashable key type.
 *
 * Key features:
 * - Type-safe key and value types
 * - Option-based value retrieval
 * - Efficient hash-based storage
 * - Standard Map interface compatibility
 *
 * @example
 * const map = new HashMap<string, number>();
 * map.set('one', 1);
 * map.set('two', 2);
 *
 * const value = map.get('one')
 *   .map(n => n * 2)
 *   .unwrapOr(0); // 2
 *
 * @template K The type of keys stored in the map
 * @template V The type of values stored in the map
 */
export class HashMap<K, V> implements Iterable<[K, V]> {
  /**
   * Internal storage using a Map with hashed keys.
   * Each entry stores both the original key and value to handle hash collisions.
   */
  #entries = new Map<number, { key: K; value: V }>();

  /**
   * Creates a new HashMap instance.
   *
   * @example
   * // Empty map
   * const map1 = new HashMap<string, number>();
   *
   * // Initialize with entries
   * const map2 = new HashMap([
   *   ['a', 1],
   *   ['b', 2]
   * ]);
   *
   * @param entries Optional array of key-value pairs for initialization
   */
  constructor(entries?: readonly [K, V][]) {
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  /**
   * Implements the Iterator protocol for use with for...of loops.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * for (const [key, value] of map) {
   *   console.log(`${key}: ${value}`);
   * }
   *
   * @returns An iterator that yields key-value pairs
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    const entriesIterator = this.#entries.values();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<[K, V]> {
        const result = entriesIterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        const { key, value } = result.value;
        return { done: false, value: [key, value] };
      },
    };
  }

  /**
   * Returns an iterator over the entries in the map.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * const entries = [...map.entries()];
   * // [['a', 1], ['b', 2]]
   *
   * @returns An iterator that yields [key, value] pairs
   */
  entries(): IterableIterator<[K, V]> {
    return this[Symbol.iterator]();
  }

  /**
   * Returns the number of key-value pairs in the map.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * console.log(map.size); // 2
   */
  get size(): number {
    return this.#entries.size;
  }

  /**
   * Removes all entries from the map.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * map.clear();
   * console.log(map.size); // 0
   */
  clear(): void {
    this.#entries.clear();
  }

  /**
   * Removes an entry from the map.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * map.delete('a');
   * console.log(map.has('a')); // false
   *
   * @param key The key to remove
   * @returns true if an element was removed, false if the key wasn't found
   */
  delete(key: K): boolean {
    return this.#entries.delete(hash(key));
  }

  /**
   * Retrieves a value from the map.
   * Returns Some(value) if the key exists, None if it doesn't.
   *
   * @example
   * const map = new HashMap([['a', 1]]);
   * const value = map.get('a')
   *   .map(n => n * 2)
   *   .unwrapOr(0); // 2
   *
   * @param key The key to look up
   * @returns Option containing the value if found
   */
  get(key: K): Option<V> {
    const entry = this.#entries.get(hash(key));
    return entry ? Some(entry.value) : None;
  }

  /**
   * Checks if a key exists in the map.
   *
   * @example
   * const map = new HashMap([['a', 1]]);
   * console.log(map.has('a')); // true
   * console.log(map.has('b')); // false
   *
   * @param key The key to check
   * @returns true if the key exists, false otherwise
   */
  has(key: K): boolean {
    return this.#entries.has(hash(key));
  }

  /**
   * Adds or updates a key-value pair in the map.
   *
   * @example
   * const map = new HashMap<string, number>();
   * map.set('a', 1);
   * map.set('a', 2); // Updates existing value
   *
   * @param key The key to set
   * @param value The value to associate with the key
   * @returns The map instance for method chaining
   */
  set(key: K, value: V): this {
    this.#entries.set(hash(key), { key, value });
    return this;
  }

  /**
   * Returns an iterator over the map's keys.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * const keys = [...map.keys()];
   * // ['a', 'b']
   *
   * @returns An iterator that yields only the keys
   */
  keys(): IterableIterator<K> {
    const entriesIterator = this.#entries.values();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<K> {
        const result = entriesIterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        return { done: false, value: result.value.key };
      },
    };
  }

  /**
   * Returns an iterator over the map's values.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * const values = [...map.values()];
   * // [1, 2]
   *
   * @returns An iterator that yields only the values
   */
  values(): IterableIterator<V> {
    const entriesIterator = this.#entries.values();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<V> {
        const result = entriesIterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        return { done: false, value: result.value.value };
      },
    };
  }

  /**
   * Executes a provided function once for each key-value pair in the map.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * map.forEach((value, key) => {
   *   console.log(`${key}: ${value}`);
   * });
   *
   * @param callback Function to execute for each entry
   * @param thisArg Value to use as 'this' when executing the callback
   */
  forEach(callback: (value: V, key: K, map: HashMap<K, V>) => void, thisArg?: any): void {
    for (const { key, value } of this.#entries.values()) {
      callback.call(thisArg, value, key, this);
    }
  }
}
