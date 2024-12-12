import { HashMap } from './map';

/**
 * A hash set implementation similar to Rust's HashSet.
 *
 * The HashSet class provides an unordered set of unique values,
 * backed by a HashMap where all values are mapped to void.
 *
 * # Examples
 * ```ts
 * let set = new HashSet<string>();
 *
 * // Insert some values
 * set.insert("a");
 * set.insert("b");
 *
 * // Check for values
 * assert(set.contains("a"));
 * assert(!set.contains("c"));
 *
 * // Remove values
 * set.remove("a");
 * ```
 */
export class HashSet<T> implements Iterable<T> {
  /** Internal storage using HashMap */
  #map: HashMap<T, void>;

  /**
   * Creates an empty HashSet or one populated with the given values.
   *
   * # Examples
   * ```ts
   * // Empty set
   * let set1 = new HashSet<string>();
   *
   * // Set with initial values
   * let set2 = new HashSet(["a", "b", "c"]);
   * ```
   */
  constructor(values?: readonly T[]) {
    this.#map = new HashMap();
    if (values) {
      for (const value of values) {
        this.insert(value);
      }
    }
  }

  /**
   * Returns the number of elements in the set.
   *
   * # Examples
   * ```ts
   * let set = new HashSet(["a", "b"]);
   * assert(set.len === 2);
   * ```
   */
  len(): number {
    return this.#map.len();
  }

  /**
   * Removes all elements from the set.
   *
   * # Examples
   * ```ts
   * let set = new HashSet(["a", "b"]);
   * set.clear();
   * assert(set.len === 0);
   * ```
   */
  clear(): void {
    this.#map.clear();
  }

  /**
   * Returns true if the set contains the specified value.
   *
   * # Examples
   * ```ts
   * let set = new HashSet(["a"]);
   * assert(set.contains("a"));
   * assert(!set.contains("b"));
   * ```
   */
  contains(value: T): boolean {
    return this.#map.containsKey(value);
  }

  /**
   * Adds a value to the set.
   *
   * Returns true if the value was not present in the set,
   * false if it was already present.
   *
   * # Examples
   * ```ts
   * let set = new HashSet<string>();
   * assert(set.insert("a")); // true - value was inserted
   * assert(!set.insert("a")); // false - value was already present
   * ```
   */
  insert(value: T): boolean {
    return this.#map.insert(value, void 0).isNone();
  }

  /**
   * Removes a value from the set.
   *
   * Returns true if the value was present in the set,
   * false if it was not present.
   *
   * # Examples
   * ```ts
   * let set = new HashSet(["a"]);
   * assert(set.remove("a")); // true - value was present
   * assert(!set.remove("a")); // false - value was not present
   * ```
   */
  remove(value: T): boolean {
    return this.#map.remove(value).isSome();
  }

  /**
   * Returns an iterator over the set's values.
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this.#map.keys();
  }

  /**
   * Returns an iterator over the set's values.
   */
  values(): IterableIterator<T> {
    return this[Symbol.iterator]();
  }
}
