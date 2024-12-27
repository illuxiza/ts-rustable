import { None, Option, Some } from '@rustable/enum';
import { equals, hash } from '@rustable/utils';
import { Entry, OccupiedEntry, VacantEntry } from './entry';

/**
 * A hash map implementation similar to Rust's HashMap.
 *
 * The HashMap class provides a way to store key-value pairs where
 * keys are hashed for efficient lookup. It handles hash collisions
 * using chaining.
 *
 * # Examples
 * ```ts
 * let map = new HashMap<string, number>();
 *
 * // Insert some values
 * map.insert("a", 1);
 * map.insert("b", 2);
 *
 * // Get values
 * let a = map.get("a").unwrapOr(0); // 1
 * let c = map.get("c").unwrapOr(0); // 0
 *
 * // Remove values
 * map.remove("a");
 * ```
 */
export class HashMap<K, V> implements Iterable<[K, V]> {
  /**
   * Internal storage using a Map with hashed keys.
   * Each bucket stores an array of entries to handle hash collisions.
   */
  private readonly __entries = new Map<number, Array<{ key: K; value: V }>>();

  /**
   * Creates an empty HashMap or one populated with the given entries.
   *
   * # Examples
   * ```ts
   * // Empty map
   * let map1 = new HashMap<string, number>();
   *
   * // Map with initial entries
   * let map2 = new HashMap([
   *   ["a", 1],
   *   ["b", 2]
   * ]);
   * ```
   */
  constructor(entries?: Iterable<[K, V]>) {
    if (entries) {
      for (const [key, value] of entries) {
        this.insert(key, value);
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
    const entriesIterator = this.__entries.values();
    let bucketsIterator = entriesIterator.next();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<[K, V]> {
        if (bucketsIterator.done) {
          return { done: true, value: undefined };
        }
        const bucket = bucketsIterator.value;
        const entry = bucket.shift();
        if (entry) {
          return { done: false, value: [entry.key, entry.value] };
        }
        bucketsIterator = entriesIterator.next();
        return this.next();
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
   * Returns the number of elements in the map.
   *
   * # Examples
   * ```ts
   * let map = new HashMap([["a", 1], ["b", 2]]);
   * assert(map.len === 2);
   * ```
   */
  len(): number {
    let size = 0;
    for (const bucket of this.__entries.values()) {
      size += bucket.length;
    }
    return size;
  }

  /**
   * Removes all key-value pairs from the map.
   *
   * # Examples
   * ```ts
   * let map = new HashMap([["a", 1], ["b", 2]]);
   * map.clear();
   * assert(map.len === 0);
   * ```
   */
  clear(): void {
    this.__entries.clear();
  }

  /**
   * Removes and returns the value associated with the given key.
   *
   * # Examples
   * ```ts
   * let map = new HashMap([["a", 1]]);
   * let value = map.remove("a").unwrapOr(0); // 1
   * assert(!map.containsKey("a"));
   * ```
   */
  remove(key: K): Option<V> {
    return this.removeEntry(key).map(([_, value]) => value);
  }

  /**
   * Removes an entry from the map and returns the removed key-value pair.
   *
   * @example
   * const map = new HashMap([['a', 1], ['b', 2]]);
   * const entry = map.removeEntry('a')
   *   .map(([k, v]) => [k, v * 2])
   *   .unwrapOr([0, 0]); // ['a', 2]
   *
   * @param key The key to remove
   * @returns Option containing the removed key-value pair if found, None otherwise
   */
  removeEntry(key: K): Option<[K, V]> {
    const hashKey = hash(key);
    const bucket = this.__entries.get(hashKey);
    if (!bucket) return None;

    const index = bucket.findIndex((entry) => this.#keysEqual(entry.key, key));
    if (index === -1) return None;

    const [entry] = bucket.splice(index, 1);
    if (bucket.length === 0) {
      this.__entries.delete(hashKey);
    }

    return Some([entry.key, entry.value]);
  }

  /**
   * Returns a reference to the value associated with the given key.
   *
   * # Examples
   * ```ts
   * let map = new HashMap([["a", 1]]);
   * let value = map.get("a").unwrapOr(0); // 1
   * let none = map.get("b").unwrapOr(0); // 0
   * ```
   */
  get(key: K): Option<V> {
    const hashKey = hash(key);
    const bucket = this.__entries.get(hashKey);
    if (!bucket) return None;

    const entry = bucket.find((entry) => this.#keysEqual(entry.key, key));
    return entry ? Some(entry.value) : None;
  }

  getUnchecked(key: K): V {
    const hashKey = hash(key);
    const bucket = this.__entries.get(hashKey);
    if (!bucket) throw new Error('Key not found');
    return bucket.find((entry) => this.#keysEqual(entry.key, key))!.value;
  }

  /**
   * Returns true if the map contains the specified key.
   *
   * # Examples
   * ```ts
   * let map = new HashMap([["a", 1]]);
   * assert(map.containsKey("a"));
   * assert(!map.containsKey("b"));
   * ```
   */
  containsKey(key: K): boolean {
    const hashKey = hash(key);
    const bucket = this.__entries.get(hashKey);
    if (!bucket) return false;

    return bucket.some((entry) => this.#keysEqual(entry.key, key));
  }

  /**
   * Inserts a key-value pair into the map.
   *
   * If the map already had this key present, the old value is returned.
   * If the key was not present, None is returned.
   *
   * # Examples
   * ```ts
   * let map = new HashMap<string, number>();
   *
   * assert(map.insert("a", 1).isNone()); // Key not present
   * assert(map.insert("a", 2).unwrap() === 1); // Returns old value
   * ```
   */
  insert(key: K, value: V): Option<V> {
    const hashKey = hash(key);
    let bucket = this.__entries.get(hashKey);

    if (!bucket) {
      bucket = [];
      this.__entries.set(hashKey, bucket);
    }

    const index = bucket.findIndex((entry) => this.#keysEqual(entry.key, key));
    if (index !== -1) {
      // Update existing entry
      const oldValue = bucket[index].value;
      bucket[index].value = value;
      return Some(oldValue);
    } else {
      // Add new entry
      bucket.push({ key, value });
      return None;
    }
  }

  /**
   * Compare two keys for equality.
   * This is a private helper method used to handle key comparison.
   */
  #keysEqual(a: K, b: K): boolean {
    if (a === b) return true;
    return equals(a, b);
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
    const entriesIterator = this.__entries.values();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<K> {
        const result = entriesIterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        // Return the first entry in the bucket
        const { key } = result.value[0];
        return { done: false, value: key };
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
    const entriesIterator = this.__entries.values();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<V> {
        const result = entriesIterator.next();
        if (result.done) {
          return { done: true, value: undefined };
        }
        // Return the first entry in the bucket
        const { value } = result.value[0];
        return { done: false, value };
      },
    };
  }

  /**
   * Retains only the elements specified by the predicate.
   * The predicate function receives both key and value.
   *
   * # Examples
   * ```ts
   * let map = new HashMap([
   *   ["a", 1],
   *   ["b", 2],
   *   ["c", 3]
   * ]);
   *
   * // Keep only entries where value is even
   * map.retain((_, v) => v % 2 === 0);
   * assert(map.len() === 1);
   * assert(map.get("b").unwrap() === 2);
   *
   * // Keep only entries where key length equals value
   * let map = new HashMap([["a", 1], ["bb", 2], ["ccc", 3]]);
   * map.retain((k, v) => k.length === v);
   * assert(map.get("bb").unwrap() === 2);
   * ```
   */
  retain(predicate: (key: K, value: V) => boolean): void {
    for (const bucket of this.__entries.values()) {
      let i = 0;
      while (i < bucket.length) {
        const { key, value } = bucket[i];
        if (!predicate(key, value)) {
          bucket.splice(i, 1);
        } else {
          i++;
        }
      }
    }
  }

  /**
   * Removes all entries and returns an iterator over the removed entries.
   *
   * # Examples
   * ```ts
   * let map = new HashMap([["a", 1], ["b", 2]]);
   * let entries = [...map.drain()];
   * assert(map.len() === 0);
   * assert.deepEqual(entries, [["a", 1], ["b", 2]]);
   *
   * ```
   */
  drain(): IterableIterator<[K, V]> {
    const entries = [...this.entries()];
    this.clear();
    return entries[Symbol.iterator]();
  }

  /**
   * Gets the entry for the given key for in-place manipulation.
   */
  entry(key: K): Entry<K, V> {
    if (this.containsKey(key)) {
      const occupied = new OccupiedEntry(key, this.getUnchecked(key), this);
      return Entry.Occupied(occupied);
    }
    const vacant = new VacantEntry(key, this);
    return Entry.Vacant(vacant);
  }

  /**
   * Tries to insert a value if the key is not present, otherwise applies the function to the existing value.
   */
  insertWith(key: K, value: V, f: (currentValue: V) => V): Option<V> {
    return this.entry(key).match({
      Occupied: (map, key, oldValue) => {
        map.insert(key, f(oldValue));
        return Some(oldValue);
      },
      Vacant: (map, key) => {
        map.insert(key, value);
        return None;
      },
    });
  }

  /**
   * Creates a HashMap with the specified key using the given function.
   *
   * # Examples
   * ```ts
   * let map = HashMap.fromKey("key", (k) => k.length);
   * assert(map.get("key").unwrap() === 3);
   * ```
   */
  static fromKey<K, V>(key: K, f: (key: K) => V): HashMap<K, V> {
    const map = new HashMap<K, V>();
    map.insert(key, f(key));
    return map;
  }

  /**
   * Returns true if the map contains no elements.
   *
   * # Examples
   * ```ts
   * let map = new HashMap<string, number>();
   * assert(map.isEmpty());
   *
   * map.insert("a", 1);
   * assert(!map.isEmpty());
   * ```
   */
  isEmpty(): boolean {
    return this.len() === 0;
  }

  /**
   * Extends the map with the contents of another map.
   *
   * # Examples
   * ```ts
   * let map1 = new HashMap([["a", 1], ["b", 2]]);
   * let map2 = new HashMap([["b", 3], ["c", 4]]);
   * map1.extend(map2);
   * assert(map1.get("b").unwrap() === 3);
   * assert(map1.get("c").unwrap() === 4);
   * ```
   */
  extend(other: HashMap<K, V>): void {
    for (const [key, value] of other) {
      this.insert(key, value);
    }
  }
}