/**
 * Collector Module
 * Provides utility functions to collect iterator elements into different collection types
 */

export const Collector = {
  /**
   * Creates a collector function that collects elements into a Set
   * @returns Function that converts an iterator into a Set
   *
   * @example
   * ```ts
   * iter([1, 2, 2, 3, 3, 3])
   *   .collectInto(Collector.toSet()) // Set(1, 2, 3)
   * ```
   */
  toSet<T>(): (iter: Iterable<T>) => Set<T> {
    return (iter: Iterable<T>) => new Set(iter);
  },

  /**
   * Creates a collector function that collects elements into an Array
   * @returns Function that converts an iterator into an Array
   *
   * @example
   * ```ts
   * iter([1, 2, 3])
   *   .collectInto(Collector.toArray()) // [1, 2, 3]
   * ```
   */
  toArray<T>(): (iter: Iterable<T>) => T[] {
    return (iter: Iterable<T>) => Array.from(iter);
  },

  /**
   * Creates a collector function that collects elements into a Map
   * @param kf Function to generate keys
   * @param vf Function to generate values
   * @returns Function that converts an iterator into a Map
   *
   * @example
   * ```ts
   * iter(['a', 'bb', 'ccc'])
   *   .collectInto(Collector.toMap(
   *     s => s[0],      // key is first char
   *     s => s.length   // value is length
   *   )) // Map { 'a' => 1, 'b' => 2, 'c' => 3 }
   * ```
   */
  toMap<T, K, V>(kf: (value: T) => K, vf: (value: T) => V): (iter: Iterable<T>) => Map<K, V> {
    return (iter: Iterable<T>) => {
      const map = new Map<K, V>();
      for (const item of iter) {
        map.set(kf(item), vf(item));
      }
      return map;
    };
  },
};
