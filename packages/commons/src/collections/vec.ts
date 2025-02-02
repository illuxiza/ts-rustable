import { None, Option, Some } from '@rustable/enum';
import { named } from '@rustable/type';
import { deepClone, Ptr } from '@rustable/utils';
import { Iter } from '../traits';
import { keysEqual } from './func';

const defaultCmp = <T>(a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0);

const OUT_OF_BOUNDS = 'Index out of bounds';

/**
 * A growable array implementation similar to Rust's Vec<T>.
 * Provides efficient array operations with dynamic size management.
 * @template T The type of elements stored in the Vec
 */
@named('Vec')
export class Vec<T> implements Iterable<T> {
  private readonly _buffer: T[];
  private _len: number;

  /**
   * Creates a new Vec with the specified initial capacity.
   * @param iterable
   */
  constructor(iterable?: Iterable<T>) {
    this._buffer = [];
    let length = 0;
    if (iterable) {
      for (const item of iterable) {
        this._buffer.push(item);
        length++;
      }
    }
    this._len = length;
  }

  /**
   * Creates a new empty Vec.
   * @template T The type of elements to store
   * @returns A new empty Vec<T>
   * @example
   * const vec = Vec.new<number>();
   */
  static new<T>(): Vec<T> {
    return new Vec<T>();
  }

  /**
   * Creates a new Vec from an iterable.
   * @template T The type of elements to store
   * @param iterable The iterable to convert to a Vec
   * @returns A new Vec<T> populated with elements from the iterable
   * @example
   * const vec = Vec.from([1, 2, 3]);
   */
  static from<T>(iterable: Iterable<T>): Vec<T> {
    return new Vec<T>(iterable);
  }

  /**
   * Creates a deep copy of the Vec.
   * @returns A new Vec containing deep copies of all elements
   */
  clone(hash = new WeakMap<object, any>()): Vec<T> {
    return new Vec(this.asSlice().map((item) => deepClone(item, hash)));
  }

  /**
   * Gets the current number of elements in the Vec.
   * @returns The number of elements
   */
  len(): number {
    return this._len;
  }

  /**
   * Checks if the Vec is empty.
   * @returns true if the Vec contains no elements, false otherwise
   */
  isEmpty(): boolean {
    return this._len === 0;
  }

  /**
   * Gets the element at the specified index.
   * @param index Zero-based index of element to retrieve
   * @returns Some(element) if index is valid, None if out of bounds
   * @example
   * const vec = Vec.from([1, 2, 3]);
   * const element = vec.get(1); // Some(2)
   */
  get(index: number): Option<T> {
    if (index >= this._len || index < 0) {
      return None;
    }
    return Some(this._buffer[index]);
  }

  /**
   * Gets a mutable reference to the element at the specified index.
   * @param index Zero-based index of element to retrieve
   * @returns Some(element) if index is valid, None if out of bounds
   * @example
   * const vec = Vec.from([1, 2, 3]);
   * const element = vec.getMut(1).unwrap().value; // Some(2)
   */
  getMut(index: number): Option<Ptr<T>> {
    if (index >= this._len || index < 0) {
      return None;
    }
    return Some(
      Ptr({
        get: () => this._buffer[index],
        set: (value: T) => {
          this._buffer[index] = value;
        },
      }),
    );
  }

  /**
   * Sets the element at the specified index.
   * @param index Zero-based index of element to set
   * @param value Element to set
   * @throws Error if index is out of bounds
   * @example
   * const vec = Vec.from([1, 2, 3]);
   * vec.set(1, 4); // vec is now [1, 4, 3]
   */
  set(index: number, value: T) {
    if (index >= this._len || index < 0) {
      throw new Error(OUT_OF_BOUNDS);
    }
    this._buffer[index] = value;
  }

  /**
   * Gets the element at the specified index without bounds checking.
   * @param index Zero-based index of element to retrieve
   * @returns The element at the specified index
   * @warning This method does not perform bounds checking
   */
  getUnchecked(index: number): T {
    return this._buffer[index];
  }

  /**
   * Checks if the Vec contains a given element.
   * @param value The value to search for
   * @returns true if the Vec contains the value, false otherwise
   * @example
   * const vec = Vec.from([1, 2, 3]);
   * vec.contains(2); // true
   * vec.contains(4); // false
   */
  contains(value: T): boolean {
    for (let i = 0; i < this._len; i++) {
      if (keysEqual(this._buffer[i], value)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Adds an element to the end of the Vec.
   * Automatically grows capacity if needed.
   * @param value Element to add
   * @example
   * const vec = Vec.new<number>();
   * vec.push(1); // vec is now [1]
   */
  push(value: T) {
    this._buffer[this._len] = value;
    this._len++;
  }

  /**
   * Removes and returns the last element.
   * @returns Some(element) if Vec was not empty, None if empty
   * @example
   * const vec = Vec.from([1, 2]);
   * const last = vec.pop(); // Some(2), vec is now [1]
   */
  pop(): Option<T> {
    if (this._len === 0) {
      return None;
    }
    this._len--;
    return Some(this._buffer[this._len]);
  }

  /**
   * Removes and returns the last element if it satisfies the predicate.
   * @param predicate The predicate to check the last element
   * @returns Some(element) if the last element satisfies the predicate, None otherwise
   */
  popIf(predicate: (value: T) => boolean): Option<T> {
    const value = this.last();
    if (value.isSome() && predicate(value.unwrap())) {
      return this.pop();
    }
    return None;
  }

  /**
   * Returns the last element of the Vec.
   * @returns Some(element) if Vec is not empty, None if empty
   */
  last(): Option<T> {
    if (this._len === 0) {
      return None;
    }
    return Some(this._buffer[this._len - 1]);
  }

  /**
   * Removes all elements from the Vec.
   * Does not affect capacity.
   */
  clear() {
    this._len = 0;
  }

  /**
   * Shortens the Vec to the specified length.
   * If new length is greater than current length, does nothing.
   * @param length New length to truncate to
   */
  truncate(length: number) {
    if (length < 0) {
      throw new Error(OUT_OF_BOUNDS);
    }
    if (length < this._len) {
      this._len = length;
    }
  }

  /**
   * Inserts an element at the specified index, shifting all elements after it to the right.
   * @param index Index where the element should be inserted
   * @param value Element to insert
   * @throws Error if index is out of bounds
   * @example
   * const vec = Vec.from([1, 3]);
   * vec.insert(1, 2); // vec is now [1, 2, 3]
   */
  insert(index: number, value: T) {
    if (index > this._len || index < 0) {
      throw new Error(OUT_OF_BOUNDS);
    }
    for (let i = this._len; i > index; i--) {
      this._buffer[i] = this._buffer[i - 1];
    }
    this._buffer[index] = value;
    this._len++;
  }

  /**
   * Removes and returns the element at the specified index.
   * Shifts all elements after it to the left.
   * @param index Index of element to remove
   * @returns Some(element) if index was valid, None if out of bounds
   * @example
   * const vec = Vec.from([1, 2, 3]);
   * vec.remove(1); // Some(2), vec is now [1, 3]
   */
  remove(index: number): T {
    if (index >= this._len || index < 0) {
      throw new Error(OUT_OF_BOUNDS);
    }
    const value = this._buffer[index];
    for (let i = index; i < this._len - 1; i++) {
      this._buffer[i] = this._buffer[i + 1];
    }
    this._len--;
    return value;
  }

  /**
   * Removes an element from the specified index efficiently by swapping it with the last element.
   * Does not preserve element order.
   * @param index Index of element to remove
   * @returns Some(element) if index was valid, None if out of bounds
   * @example
   * const vec = Vec.from([1, 2, 3, 4]);
   * vec.swapRemove(1); // Some(2), vec is now [1, 4, 3]
   */
  swapRemove(index: number): T {
    if (index >= this._len || index < 0) {
      throw new Error(OUT_OF_BOUNDS);
    }
    const value = this._buffer[index];
    this._len--;
    if (index < this._len) {
      this._buffer[index] = this._buffer[this._len];
    }
    return value;
  }

  /**
   * Converts the Vec to a standard array.
   * @returns A new array containing all elements
   */
  asSlice(): T[] {
    return this._buffer.slice(0, this._len);
  }

  /**
   * Implements the Iterator protocol for the Vec.
   * @yields Each element in the Vec in order
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this._buffer.slice(0, this._len)[Symbol.iterator]();
  }

  /**
   * Adds all elements from an iterable to the end of this Vec.
   * @param other Iterable containing elements to add
   * @example
   * const vec = Vec.from([1, 2]);
   * vec.extend([3, 4]); // vec is now [1, 2, 3, 4]
   */
  extend(other: Iterable<T>) {
    for (const item of other) {
      this.push(item);
    }
  }

  /**
   * Moves all the elements of `other` into `self`, leaving `other` empty.
   *
   * # Examples
   *
   * ```typescript
   * const vec = Vec.from([1, 2, 3]);
   * const vec2 = Vec.from([4, 5, 6]);
   * vec.append(vec2);
   * assert.deepEqual([...vec], [1, 2, 3, 4, 5, 6]);
   * assert.deepEqual([...vec2], []);
   * ```
   */
  append(other: Vec<T>): void {
    const otherSlice = other.asSlice();
    const len = this.len();
    for (let i = 0; i < otherSlice.length; i++) {
      this._buffer[len + i] = otherSlice[i];
    }
    this._len += otherSlice.length;
    other.clear();
  }

  /**
   * Reverses the order of the elements in the Vec in-place.
   */
  reverse(): void {
    const halfLen = Math.floor(this._len / 2);
    for (let i = 0; i < halfLen; i++) {
      const temp = this._buffer[i];
      this._buffer[i] = this._buffer[this._len - 1 - i];
      this._buffer[this._len - 1 - i] = temp;
    }
  }

  /**
   * Returns a portion of the Vec as an array.
   * @param start Start index (default: 0)
   * @param end End index (default: length)
   * @returns Array containing elements from start to end
   */
  slice(start: number = 0, end: number = this._len): T[] {
    return this._buffer.slice(start, Math.min(end, this._len));
  }

  /**
   * Changes the contents of the Vec by removing or replacing existing elements and/or adding new elements in place.
   * @param start The index at which to begin changing the Vec
   * @param deleteCount An integer indicating the number of elements to remove
   * @param items The elements to add to the Vec, beginning from start
   * @returns An array containing the deleted elements
   * @example
   * const vec = Vec.from([1, 2, 3, 4]);
   * vec.splice(1, 2, 5, 6); // Returns [2, 3], vec is now [1, 5, 6, 4]
   */
  splice(start: number, deleteCount: number, items?: Iterable<T>): T[] {
    const s = start < 0 ? Math.max(0, this._len + start) : Math.min(start, this._len);
    const d = Math.min(Math.max(0, deleteCount), this._len - s);
    const itemsArr = items ? [...items] : [];
    const deleted = this._buffer.splice(s, d, ...itemsArr);
    this._len -= d - itemsArr.length;
    return deleted;
  }

  /**
   * Resizes the Vec to the specified length.
   * If growing, fills new elements with the provided value.
   * @param newLength New length for the Vec
   * @param value Value to use for new elements when growing
   * @example
   * const vec = Vec.from([1, 2]);
   * vec.resize(4, 0); // vec is now [1, 2, 0, 0]
   */
  resize(newLength: number, value: T) {
    if (newLength < 0) {
      throw new Error(OUT_OF_BOUNDS);
    }
    if (newLength > this._len) {
      for (let i = this._len; i < newLength; i++) {
        this._buffer[i] = value;
      }
    }
    this._len = newLength;
  }

  /**
   * Resizes the Vec to the specified length.
   * If growing, calls the provided callback to generate new elements.
   * @param newLength New length for the Vec
   * @param callback Callback to generate new elements
   * @example
   * const vec = Vec.from([1, 2]);
   * vec.resizeWith(4, () => 0); // vec is now [1, 2, 0, 0]
   */
  resizeWith(newLength: number, callback: (index?: number) => T) {
    if (newLength < 0) {
      throw new Error(OUT_OF_BOUNDS);
    }
    if (newLength > this._len) {
      for (let i = this._len; i < newLength; i++) {
        this._buffer[i] = callback(i);
      }
    }
    this._len = newLength;
  }

  /**
   * Retains only the elements specified by the predicate.
   * Keeps elements for which the predicate returns true and removes those that return false.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3, 4, 5, 6]);
   *
   * // Keep only even numbers
   * vec.retain(x => x % 2 === 0);
   * assert.deepEqual([...vec], [2, 4, 6]);
   *
   * // Keep only elements less than 5
   * let vec = Vec.from([1, 2, 3, 4, 5, 6]);
   * vec.retain(x => x < 5);
   * assert.deepEqual([...vec], [1, 2, 3, 4]);
   * ```
   *
   * @param predicate Function that returns true for elements to keep
   */
  retain(predicate: (value: T, index: number) => boolean): void {
    let writeIndex = 0;

    for (let readIndex = 0; readIndex < this._len; readIndex++) {
      if (predicate(this._buffer[readIndex], readIndex)) {
        if (writeIndex !== readIndex) {
          this._buffer[writeIndex] = this._buffer[readIndex];
        }
        writeIndex++;
      }
    }

    this._len = writeIndex;
  }

  /**
   * Removes a range of elements from the Vec and returns an iterator over the removed elements.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3, 4, 5]);
   *
   * // Drain elements from index 1 to 3
   * let drained = [...vec.drain({ start: 1, end: 4 })];
   * assert.deepEqual(drained, [2, 3, 4]);
   * assert.deepEqual([...vec], [1, 5]);
   *
   * // Drain elements from start to index 2
   * let vec = Vec.from([1, 2, 3, 4, 5]);
   * let drained = [...vec.drain({ end: 2 })];
   * assert.deepEqual(drained, [1, 2]);
   * assert.deepEqual([...vec], [3, 4, 5]);
   *
   * // Drain elements from index 3 to end
   * let vec = Vec.from([1, 2, 3, 4, 5]);
   * let drained = [...vec.drain({ start: 3 })];
   * assert.deepEqual(drained, [4, 5]);
   * assert.deepEqual([...vec], [1, 2, 3]);
   * ```
   */
  drain(range: { start?: number; end?: number } = {}): Vec<T> {
    const len = this._len;
    const start = range.start ?? 0;
    const end = range.end ?? len;
    if (start < 0 || end > len || start > end) {
      throw new Error('Invalid range');
    }
    const drainedElements = this._buffer.slice(start, end);
    const drainedVec = new Vec(drainedElements);
    // Remove drained elements from the original Vec
    this._buffer.splice(start, end - start);
    this._len -= drainedElements.length;
    return drainedVec;
  }

  /**
   * Removes all elements from the Vec and returns an iterator over the removed elements.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3]);
   *
   * // Drain all elements
   * let drained = [...vec.drain()];
   * assert(vec.isEmpty());
   * assert.deepEqual(drained, [1, 2, 3]);
   *
   * // Drain with filtering
   * let vec = Vec.from([1, 2, 3, 4, 5]);
   * let evens = [...vec.drain(x => x % 2 === 0)];
   * assert.deepEqual(evens, [2, 4]);
   * assert.deepEqual([...vec], [1, 3, 5]);
   * ```
   */
  drainBy(p: (value: T) => boolean): Vec<T> {
    const matching = Vec.new<T>();
    let wi = 0;
    for (let ri = 0; ri < this._len; ri++) {
      const value = this._buffer[ri];
      if (p(value)) {
        matching.push(value);
      } else {
        if (wi !== ri) {
          this._buffer[wi] = value;
        }
        wi++;
      }
    }
    this._len = wi;
    return matching;
  }

  /**
   * Removes consecutive repeated elements in the vector according to the given equality function.
   * If no equality function is provided, uses strict equality (===).
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 2, 3, 2, 1, 1]);
   * vec.dedup();
   * assert.deepEqual([...vec], [1, 2, 3, 2, 1]);
   *
   * // Using custom equality function
   * let vec = Vec.from([1.0, 1.1, 1.2, 2.0, 2.1]);
   * vec.dedup((a, b) => Math.floor(a) === Math.floor(b));
   * assert.deepEqual([...vec], [1.0, 2.0]);
   * ```
   */
  dedup(eq?: (a: T, b: T) => boolean): void {
    if (this._len <= 1) return;
    const isEqual = eq || keysEqual;
    let wi = 1;
    for (let ri = 1; ri < this._len; ri++) {
      if (!isEqual(this._buffer[wi - 1], this._buffer[ri])) {
        if (wi !== ri) {
          this._buffer[wi] = this._buffer[ri];
        }
        wi++;
      }
    }
    this._len = wi;
  }

  /**
   * Removes all but the first of consecutive elements in the vector that resolve to the same
   * key.
   *
   * If the vector is sorted, this removes all duplicates.
   *
   * # Examples
   *
   * ```ts
   * let vec = Vec.from([10, 20, 21, 30, 20]);
   *
   * vec.dedupByKey(i => Math.floor(i / 10));
   *
   * assert.deepEqual([...vec], [10, 20, 30, 20]);
   * ```
   */
  dedupBy<K>(key: (value: T) => K): void {
    this.dedup((a, b) => key(a) === key(b));
  }

  /**
   * Divides one slice into two at an index, without doing bounds checking.
   *
   * The first will contain all indices from `[0, mid)` (excluding
   * the index `mid` itself) and the second will contain all
   * indices from `[mid, len)` (excluding the index `len` itself).
   *
   * # Safety
   *
   * Calling this method with an out-of-bounds index is undefined behavior
   * even if the resulting reference is not used. The caller has to ensure that
   * `0 <= mid <= this.length`.
   *
   * # Examples
   *
   * ```ts
   * const vec = Vec.from([1, 2, 3, 4, 5, 6]);
   *
   * const [left, right] = vec.splitAtUnchecked(0);
   * assert.deepEqual([...left], []);
   * assert.deepEqual([...right], [1, 2, 3, 4, 5, 6]);
   *
   * const [left2, right2] = vec.splitAtUnchecked(2);
   * assert.deepEqual([...left2], [1, 2]);
   * assert.deepEqual([...right2], [3, 4, 5, 6]);
   *
   * const [left3, right3] = vec.splitAtUnchecked(6);
   * assert.deepEqual([...left3], [1, 2, 3, 4, 5, 6]);
   * assert.deepEqual([...right3], []);
   * ```
   */
  splitAtUnchecked(mid: number): [Vec<T>, Vec<T>] {
    if (mid > this._len) throw new Error(OUT_OF_BOUNDS);
    return [new Vec(this._buffer.slice(0, mid)), new Vec(this._buffer.slice(mid, this._len))];
  }

  /**
   * Divides one slice into two at an index, returning `None` if the slice is
   * too short.
   *
   * If `mid ≤ len` returns a pair of slices where the first will contain all
   * indices from `[0, mid)` (excluding the index `mid` itself) and the
   * second will contain all indices from `[mid, len)` (excluding the index
   * `len` itself).
   *
   * Otherwise, if `mid > len`, returns `None`.
   *
   * # Examples
   *
   * ```ts
   * let v = Vec.from([1, -2, 3, -4, 5, -6]);
   *
   * {
   *   let [left, right] = v.splitAt(0).unwrap();
   *   assert.deepEqual([...left], []);
   *   assert.deepEqual([...right], [1, -2, 3, -4, 5, -6]);
   * }
   *
   * {
   *   let [left, right] = v.splitAt(2).unwrap();
   *   assert.deepEqual([...left], [1, -2]);
   *   assert.deepEqual([...right], [3, -4, 5, -6]);
   * }
   *
   * {
   *   let [left, right] = v.splitAt(6).unwrap();
   *   assert.deepEqual([...left], [1, -2, 3, -4, 5, -6]);
   *   assert.deepEqual([...right], []);
   * }
   *
   * assert.deepEqual(v.splitAt(7), None);
   * ```
   */
  splitAt(mid: number): Option<[Vec<T>, Vec<T>]> {
    if (mid <= this._len) {
      return Some(this.splitAtUnchecked(mid));
    } else {
      return None;
    }
  }

  /**
   * Splits the vector into its first element and the rest of the elements.
   * Returns None if the vector is empty.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3]);
   * let [first, rest] = vec.splitFirst().unwrap();
   * assert.equal(first, 1);
   * assert.deepEqual([...rest], [2, 3]);
   *
   * let empty = Vec.new<number>();
   * assert.equal(empty.splitFirst(), None);
   * ```
   */
  splitFirst(): Option<[T, Vec<T>]> {
    return this._len ? Some([this._buffer[0], new Vec(this._buffer.slice(1))]) : None;
  }

  /**
   * Splits the vector into its last element and all other elements.
   * Returns None if the vector is empty.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3]);
   * let [last, rest] = vec.splitLast().unwrap();
   * assert.equal(last, 3);
   * assert.deepEqual([...rest], [1, 2]);
   *
   * let empty = Vec.new<number>();
   * assert.equal(empty.splitLast(), None);
   * ```
   */
  splitLast(): Option<[T, Vec<T>]> {
    return this._len
      ? Some([this._buffer[this._len - 1], new Vec(this._buffer.slice(0, -1))])
      : None;
  }

  /**
   * Splits the vector into two at the given index.
   * Returns a new vector containing the elements from index onwards.
   * The original vector will contain elements [0, index).
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3, 4, 5]);
   * let right = vec.splitOff(3);
   * assert.deepEqual([...vec], [1, 2, 3]);      // left part
   * assert.deepEqual([...right], [4, 5]);       // right part
   * ```
   *
   * @throws If index is out of bounds
   */
  splitOff(index: number): Vec<T> {
    if (index > this._len) {
      throw new Error(OUT_OF_BOUNDS);
    }
    const rightPart = Vec.new<T>();
    for (let i = index; i < this._len; i++) {
      rightPart.push(this._buffer[i]);
    }
    this._len = index;
    return rightPart;
  }

  /**
   * Sorts the vector in-place.
   * Uses the provided comparison function, or the default comparison if none is provided.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([3, 1, 4, 1, 5]);
   * vec.sort();
   * assert.deepEqual([...vec], [1, 1, 3, 4, 5]);
   *
   * // Custom comparison
   * vec.sort((a, b) => b - a);  // Sort in reverse
   * assert.deepEqual([...vec], [5, 4, 3, 1, 1]);
   * ```
   */
  sort(compare: (a: T, b: T) => number = defaultCmp): void {
    if (this._len <= 1) return;
    this._buffer
      .slice(0, this._len)
      .sort(compare)
      .forEach((value, i) => (this._buffer[i] = value));
  }

  /**
   * Sorts the vector in-place by the specified key function.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from(['hello', 'a', 'world']);
   * vec.sortBy(s => s.length);
   * assert.deepEqual([...vec], ['a', 'hello', 'world']);
   *
   * // Sort objects by property
   * let vec = Vec.from([
   *   { id: 3, name: 'c' },
   *   { id: 1, name: 'a' },
   *   { id: 2, name: 'b' }
   * ]);
   * vec.sortBy(x => x.id);
   * assert.deepEqual([...vec], [
   *   { id: 1, name: 'a' },
   *   { id: 2, name: 'b' },
   *   { id: 3, name: 'c' }
   * ]);
   * ```
   */
  sortBy<K>(keyFn: (value: T) => K): void {
    this.sort((a, b) => {
      const keyA = keyFn(a);
      const keyB = keyFn(b);
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
  }

  /**
   * Sorts the vector in-place, but may not preserve the order of equal elements.
   * Generally faster than stable sort.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([3, 1, 4, 1, 5]);
   * vec.sortUnstable();
   * assert.deepEqual([...vec], [1, 1, 3, 4, 5]);  // Order of equal elements (1, 1) may vary
   * ```
   */
  sortUnstable(compare: (a: T, b: T) => number = defaultCmp): void {
    if (this._len <= 1) return;
    const swap = (i: number, j: number) => {
      [this._buffer[i], this._buffer[j]] = [this._buffer[j], this._buffer[i]];
    };
    const sort = (l: number, h: number): void => {
      if (l >= h) return;
      const p = this._buffer[h];
      let i = l - 1;
      for (let j = l; j < h; j++) {
        if (compare(this._buffer[j], p) <= 0) swap(++i, j);
      }
      swap(i + 1, h);
      sort(l, i);
      sort(i + 2, h);
    };
    sort(0, this._len - 1);
  }

  /**
   * Returns true if the vector is sorted according to the given comparison function,
   * or the default ordering if none is provided.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3, 4, 5]);
   * assert(vec.isSorted());
   *
   * let vec = Vec.from([5, 4, 3, 2, 1]);
   * assert(vec.isSorted((a, b) => b - a));  // Sorted in reverse
   * ```
   */
  isSorted(compare: (a: T, b: T) => number = defaultCmp): boolean {
    if (this._len <= 1) return true;
    for (let i = 1; i < this._len; i++) {
      if (compare(this._buffer[i - 1], this._buffer[i]) > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns true if the vector is sorted according to the given key function.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from(['a', 'hello', 'world']);
   * assert(vec.isSortedBy(s => s.length));
   *
   * let vec = Vec.from([
   *   { id: 1, name: 'a' },
   *   { id: 2, name: 'b' },
   *   { id: 3, name: 'c' }
   * ]);
   * assert(vec.isSortedBy(x => x.id));
   * ```
   */
  isSortedBy<K>(key: (value: T) => K): boolean {
    return this.isSorted((a, b) => {
      const ka = key(a);
      const kb = key(b);
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
  }

  /**
   * Fills the vector with the given value.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3]);
   * vec.fill(0);
   * assert.deepEqual([...vec], [0, 0, 0]);
   * ```
   */
  fill(value: T): void {
    for (let i = 0; i < this._len; i++) {
      this._buffer[i] = value;
    }
  }

  /**
   * Fills the vector with values returned by the function.
   * The function receives the index as its argument.
   *
   * # Examples
   * ```ts
   * let vec = Vec.from([1, 2, 3]);
   * vec.fillWith(i => i * 2);
   * assert.deepEqual([...vec], [0, 2, 4]);
   *
   * // Fill with repeated sequence
   * let vec = Vec.withCapacity(5);
   * vec.resize(5, 0);
   * vec.fillWith(i => i % 2);
   * assert.deepEqual([...vec], [0, 1, 0, 1, 0]);
   * ```
   */
  fillWith(f: (index: number) => T): void {
    for (let i = 0; i < this._len; i++) {
      this._buffer[i] = f(i);
    }
  }

  toJSON() {
    return this.asSlice();
  }

  toString() {
    return this.asSlice();
  }

  valueOf() {
    return this.asSlice();
  }
}

Iter.implFor(Vec);

export interface Vec<T> extends Iter<T> {}
