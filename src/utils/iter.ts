/**
 * Iterator utilities inspired by Rust's Iterator trait.
 * Provides a rich set of functions for working with iterables in a functional style.
 */

/**
 * Type representing a predicate function that tests values
 * @template T The type of values being tested
 */
type Predicate<T> = (value: T) => boolean;

/**
 * Creates an iterator that yields elements while the predicate returns true.
 * Stops yielding as soon as the predicate returns false.
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const lessThanFour = [...iter.takeWhile(numbers, n => n < 4)]; // [1, 2, 3]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 * @param predicate Function that tests each element
 */
function* takeWhile<T>(iter: Iterable<T>, predicate: Predicate<T>): Generator<T> {
  for (const item of iter) {
    if (!predicate(item)) {
      break;
    }
    yield item;
  }
}

/**
 * Creates an iterator that skips elements while the predicate returns true,
 * then yields all remaining elements.
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const skipLessThanThree = [...iter.skipWhile(numbers, n => n < 3)]; // [3, 4, 5]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 * @param predicate Function that tests each element
 */
function* skipWhile<T>(iter: Iterable<T>, predicate: Predicate<T>): Generator<T> {
  let skipping = true;
  for (const item of iter) {
    if (skipping && !predicate(item)) {
      skipping = false;
    }
    if (!skipping) {
      yield item;
    }
  }
}

/**
 * Creates an iterator that yields fixed-size chunks of the source iterator.
 * The last chunk may contain fewer elements if the source length is not divisible by the chunk size.
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const pairs = [...iter.chunks(numbers, 2)]; // [[1, 2], [3, 4], [5]]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 * @param size Size of each chunk
 * @throws {Error} If size is less than 1
 */
function* chunks<T>(iter: Iterable<T>, size: number): Generator<T[]> {
  if (size < 1) {
    throw new Error('Chunk size must be at least 1');
  }
  let chunk: T[] = [];
  for (const item of iter) {
    chunk.push(item);
    if (chunk.length === size) {
      yield chunk;
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    yield chunk;
  }
}

/**
 * Creates an iterator that yields sliding windows of the source iterator.
 * Each window contains the specified number of consecutive elements.
 *
 * @example
 * const numbers = [1, 2, 3, 4];
 * const windows3 = [...iter.windows(numbers, 3)]; // [[1, 2, 3], [2, 3, 4]]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 * @param size Window size
 * @throws {Error} If size is less than 1
 */
function* windows<T>(iter: Iterable<T>, size: number): Generator<T[]> {
  if (size < 1) {
    throw new Error('Window size must be at least 1');
  }
  const window: T[] = [];
  for (const item of iter) {
    window.push(item);
    if (window.length === size) {
      yield [...window];
      window.shift();
    }
  }
}

/**
 * Creates an iterator that yields pairs of consecutive elements.
 *
 * @example
 * const numbers = [1, 2, 3, 4];
 * const pairs = [...iter.pairwise(numbers)]; // [[1, 2], [2, 3], [3, 4]]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 */
function* pairwise<T>(iter: Iterable<T>): Generator<[T, T]> {
  let prev: T;
  let first = true;
  for (const item of iter) {
    if (first) {
      prev = item;
      first = false;
      continue;
    }
    yield [prev!, item];
    prev = item;
  }
}

/**
 * Creates an iterator that yields elements and their indices.
 *
 * @example
 * const numbers = [1, 2, 3, 4];
 * const indexed = [...iter.enumerate(numbers)]; // [[0, 1], [1, 2], [2, 3], [3, 4]]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 */
function* enumerate<T>(iter: Iterable<T>): Generator<[number, T]> {
  let index = 0;
  for (const item of iter) {
    yield [index++, item];
  }
}

/**
 * Groups elements by a key function.
 *
 * @example
 * const numbers = [1, 2, 3, 4];
 * const groups = [...iter.groupBy(numbers, n => n % 2)]; // [[0, [2, 4]], [1, [1, 3]]]
 *
 * @template T The type of elements in the iterator
 * @template K The type of keys
 * @param iter Source iterator
 * @param keyFn Function that computes the key for each element
 */
function* groupBy<T, K>(iter: Iterable<T>, keyFn: (item: T) => K): Generator<[K, T[]]> {
  const groups = new Map<K, T[]>();

  for (const item of iter) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  for (const [key, group] of [...groups.entries()].sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  })) {
    yield [key, group];
  }
}

/**
 * Generates all permutations of elements.
 *
 * @example
 * const numbers = [1, 2, 3];
 * const permutations = [...iter.permutations(numbers)]; // [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 * @param r Length of each permutation (default: all elements)
 */
function* permutations<T>(iter: Iterable<T>, r?: number): Generator<T[]> {
  const arr = Array.from(iter);
  const n = arr.length;
  r = r === undefined ? n : r;

  if (n === 0) {
    return;
  }

  const indices = Array.from({ length: n }, (_, i) => i);
  const cycles = Array.from({ length: r }, (_, i) => n - i);

  yield indices.slice(0, r).map((i) => arr[i]);

  while (n > 0) {
    let found = false;
    for (let i = r - 1; i >= 0; i--) {
      cycles[i]--;
      if (cycles[i] === 0) {
        indices.push(indices.splice(i, 1)[0]);
        cycles[i] = n - i;
      } else {
        const j = cycles[i];
        [indices[i], indices[n - j]] = [indices[n - j], indices[i]];
        yield indices.slice(0, r).map((i) => arr[i]);
        found = true;
        break;
      }
    }
    if (!found) {
      break;
    }
  }
}

/**
 * Creates an iterator that yields combinations of elements.
 *
 * @example
 * const numbers = [1, 2, 3];
 * const combinations = [...iter.combinations(numbers, 2)]; // [[1, 2], [1, 3], [2, 3]]
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 * @param r Length of each combination
 */
function* combinations<T>(iter: Iterable<T>, r: number): Generator<T[]> {
  const pool = Array.from(iter);
  const n = pool.length;

  if (r > n) return;

  const indices = Array.from({ length: r }, (_, i) => i);
  yield indices.map((i) => pool[i]);

  while (true) {
    let i = r - 1;
    while (i >= 0 && indices[i] === i + n - r) {
      i--;
    }

    if (i < 0) return;

    indices[i]++;
    for (let j = i + 1; j < r; j++) {
      indices[j] = indices[j - 1] + 1;
    }

    yield indices.map((i) => pool[i]);
  }
}

/**
 * Creates an iterator that yields tuples of elements from multiple iterables.
 * The iterator stops when any of the input iterables is exhausted.
 *
 * @example
 * const numbers = [1, 2, 3];
 * const letters = ['a', 'b', 'c'];
 * const zipped = [...iter.zip(numbers, letters)]; // [[1, 'a'], [2, 'b'], [3, 'c']]
 *
 * @template T Tuple type containing element types of each iterable
 * @param iters Iterables to zip together
 */
function* zip<T extends any[]>(...iters: { [K in keyof T]: Iterable<T[K]> }): Generator<T> {
  const iterators = iters.map((iter) => iter[Symbol.iterator]());

  while (true) {
    const results = iterators.map((iter) => iter.next());
    if (results.some((result) => result.done)) {
      break;
    }
    yield results.map((result) => result.value) as T;
  }
}

/**
 * Computes the product of all numeric elements in the iterator.
 *
 * @example
 * const numbers = [1, 2, 3, 4];
 * const prod = iter.product(numbers); // 24 (1 * 2 * 3 * 4)
 *
 * @template T The type of elements in the iterator
 * @param iter Source iterator
 * @throws {Error} If iterator is empty or contains non-numeric values
 */
function product<T>(iter: Iterable<T>): number {
  let result = 1;
  let empty = true;
  for (const item of iter) {
    if (typeof item !== 'number') {
      throw new Error('Product can only be computed for numeric values');
    }
    result *= item;
    empty = false;
  }
  if (empty) {
    throw new Error('Cannot compute product of empty iterator');
  }
  return result;
}

/**
 * Collection of iterator utility functions inspired by Rust's Iterator trait.
 * Provides methods for working with iterables in a functional style.
 */
export const iter = {
  takeWhile,
  skipWhile,
  chunks,
  windows,
  pairwise,
  enumerate,
  groupBy,
  permutations,
  combinations,
  zip,
  product,
} as const;
