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
  private readonly __map: HashMap<T, void>;

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
  constructor(values?: Iterable<T>) {
    this.__map = new HashMap();
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
    return this.__map.len();
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
    this.__map.clear();
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
    return this.__map.containsKey(value);
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
    return this.__map.insert(value, void 0).isNone();
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
    return this.__map.remove(value).isSome();
  }

  /**
   * Returns an iterator over the set's values.
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this.__map.keys();
  }

  /**
   * Returns an iterator over the set's values.
   */
  values(): IterableIterator<T> {
    return this[Symbol.iterator]();
  }

  /**
   * Extends the set with the contents of an iterator.
   *
   * # Examples
   * ```ts
   * let set = new HashSet<string>();
   * set.extend(["a", "b", "c"]);
   * assert(set.has("a"));
   * assert(set.has("b"));
   * assert(set.has("c"));
   * ```
   */
  extend(iter: Iterable<T>): void {
    for (const value of iter) {
      this.insert(value);
    }
  }

  /**
   * Returns true if the set contains no elements.
   * 
   * # Examples
   * ```ts
   * let set = new HashSet<string>();
   * assert(set.isEmpty());
   * set.insert("a");
   * assert(!set.isEmpty());
   * ```
   */
  isEmpty(): boolean {
    return this.len() === 0;
  }

  /**
   * Returns a new set containing all elements that are in both this set and the other set.
   * 
   * # Examples
   * ```ts
   * let set1 = new HashSet(["a", "b", "c"]);
   * let set2 = new HashSet(["b", "c", "d"]);
   * let intersection = set1.intersection(set2);
   * assert.deepEqual([...intersection].sort(), ["b", "c"]);
   * ```
   */
  intersection(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>();
    for (const value of this) {
      if (other.contains(value)) {
        result.insert(value);
      }
    }
    return result;
  }

  /**
   * Returns a new set containing all elements that are in either this set or the other set.
   * 
   * # Examples
   * ```ts
   * let set1 = new HashSet(["a", "b"]);
   * let set2 = new HashSet(["b", "c"]);
   * let union = set1.union(set2);
   * assert.deepEqual([...union].sort(), ["a", "b", "c"]);
   * ```
   */
  union(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>(this);
    result.extend(other);
    return result;
  }

  /**
   * Returns a new set containing all elements that are in this set but not in the other set.
   * 
   * # Examples
   * ```ts
   * let set1 = new HashSet(["a", "b", "c"]);
   * let set2 = new HashSet(["b", "c", "d"]);
   * let difference = set1.difference(set2);
   * assert.deepEqual([...difference], ["a"]);
   * ```
   */
  difference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>();
    for (const value of this) {
      if (!other.contains(value)) {
        result.insert(value);
      }
    }
    return result;
  }

  /**
   * Returns true if this set is a subset of the other set.
   * 
   * # Examples
   * ```ts
   * let set1 = new HashSet(["a", "b"]);
   * let set2 = new HashSet(["a", "b", "c"]);
   * assert(set1.isSubset(set2));
   * assert(!set2.isSubset(set1));
   * ```
   */
  isSubset(other: HashSet<T>): boolean {
    for (const value of this) {
      if (!other.contains(value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns true if this set is a superset of the other set.
   * 
   * # Examples
   * ```ts
   * let set1 = new HashSet(["a", "b", "c"]);
   * let set2 = new HashSet(["a", "b"]);
   * assert(set1.isSuperset(set2));
   * assert(!set2.isSuperset(set1));
   * ```
   */
  isSuperset(other: HashSet<T>): boolean {
    return other.isSubset(this);
  }

}
