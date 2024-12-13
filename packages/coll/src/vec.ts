import { None, Option, Some } from '@rustable/enum';
import { Mut } from '@rustable/utils';

/**
 * A growable array implementation similar to Rust's Vec<T>.
 * Provides efficient array operations with dynamic size management.
 * @template T The type of elements stored in the Vec
 */
export class Vec<T> implements Iterable<T> {
  #buffer: T[];
  #length: number;

  /**
   * Creates a new Vec with the specified initial capacity.
   * @param capacity Initial capacity of the Vec (default: 0)
   */
  constructor(iterable?: Iterable<T>) {
    this.#buffer = [];
    let length = 0;
    if (iterable) {
      for (const item of iterable) {
        this.push(item);
        length++;
      }
    }
    this.#length = length;
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
   * Gets the current number of elements in the Vec.
   * @returns The number of elements
   */
  len(): number {
    return this.#length;
  }

  /**
   * Checks if the Vec is empty.
   * @returns true if the Vec contains no elements, false otherwise
   */
  isEmpty(): boolean {
    return this.#length === 0;
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
    if (index >= this.#length) {
      return None;
    }
    return Some(this.#buffer[index]);
  }

  /**
   * Gets a mutable reference to the element at the specified index.
   * @param index Zero-based index of element to retrieve
   * @returns Some(element) if index is valid, None if out of bounds
   * @example
   * const vec = Vec.from([1, 2, 3]);
   * const element = vec.getMut(1).unwrap().value; // Some(2)
   */
  getMut(index: number): Option<Mut<T>> {
    if (index >= this.#length) {
      return None;
    }
    return Some(
      new Mut(
        () => this.#buffer[index],
        (value: T) => (this.#buffer[index] = value),
      ),
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
    if (index >= this.#length) {
      throw new Error(`Index (is ${index}) should be < len (is ${this.#length})`);
    }
    this.#buffer[index] = value;
  }

  /**
   * Gets the element at the specified index without bounds checking.
   * @param index Zero-based index of element to retrieve
   * @returns The element at the specified index
   * @warning This method does not perform bounds checking
   */
  getUnchecked(index: number): T {
    return this.#buffer[index];
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
    this.#buffer[this.#length] = value;
    this.#length++;
  }

  /**
   * Removes and returns the last element.
   * @returns Some(element) if Vec was not empty, None if empty
   * @example
   * const vec = Vec.from([1, 2]);
   * const last = vec.pop(); // Some(2), vec is now [1]
   */
  pop(): Option<T> {
    if (this.#length === 0) {
      return None;
    }
    this.#length--;
    return Some(this.#buffer[this.#length]);
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
    if (this.#length === 0) {
      return None;
    }
    return Some(this.#buffer[this.#length - 1]);
  }

  /**
   * Removes all elements from the Vec.
   * Does not affect capacity.
   */
  clear() {
    this.#length = 0;
  }

  /**
   * Shortens the Vec to the specified length.
   * If new length is greater than current length, does nothing.
   * @param length New length to truncate to
   */
  truncate(length: number) {
    if (length < this.#length) {
      this.#length = length;
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
    if (index > this.#length || index < 0) {
      throw new Error('Index out of bounds');
    }
    for (let i = this.#length; i > index; i--) {
      this.#buffer[i] = this.#buffer[i - 1];
    }
    this.#buffer[index] = value;
    this.#length++;
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
    if (index >= this.#length) {
      throw new Error(`Removal index (is ${index}) should be < len (is ${this.#length})`);
    }
    const value = this.#buffer[index];
    for (let i = index; i < this.#length - 1; i++) {
      this.#buffer[i] = this.#buffer[i + 1];
    }
    this.#length--;
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
    if (index >= this.#length) {
      throw new Error(`swap_remove index (is ${index}) should be < len (is ${this.#length})`);
    }
    const value = this.#buffer[index];
    this.#length--;
    if (index < this.#length) {
      this.#buffer[index] = this.#buffer[this.#length];
    }
    return value;
  }

  /**
   * Converts the Vec to a standard array.
   * @returns A new array containing all elements
   */
  asSlice(): T[] {
    return this.#buffer.slice(0, this.#length);
  }

  /**
   * Implements the Iterator protocol for the Vec.
   * @yields Each element in the Vec in order
   */
  [Symbol.iterator](): IterableIterator<T> {
    return this.#buffer.slice(0, this.#length)[Symbol.iterator]();
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
   * Returns a portion of the Vec as an array.
   * @param start Start index (default: 0)
   * @param end End index (default: length)
   * @returns Array containing elements from start to end
   */
  slice(start: number = 0, end: number = this.#length): T[] {
    return this.#buffer.slice(start, Math.min(end, this.#length));
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
    if (newLength > this.#length) {
      for (let i = this.#length; i < newLength; i++) {
        this.#buffer[i] = value;
      }
    }
    this.#length = newLength;
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
    if (newLength > this.#length) {
      for (let i = this.#length; i < newLength; i++) {
        this.#buffer[i] = callback(i);
      }
    }
    this.#length = newLength;
  }
}
