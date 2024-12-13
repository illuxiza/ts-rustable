/**
 * Represents a mutable reference with getter and setter functions.
 * @template T The type of the value being accessed.
 * @template S The type of the value being set, defaults to T.
 */
export class Mut<T, S = T> {
  /**
   * Creates a new Mut instance.
   * @param get Function to retrieve the current value.
   * @param set Function to set a new value.
   */
  constructor(
    private get: () => T,
    private set: (value: S) => void,
  ) {}

  /**
   * Creates a new Mut instance.
   * @param get Function to retrieve the current value.
   * @param set Function to set a new value.
   * @returns A new Mut instance.
   */
  static of<T, S = T>(get: () => T, set: (value: S) => void) {
    return new Mut(get, set);
  }

  /**
   * Gets the current value.
   * @returns The current value of type T.
   */
  get value(): T {
    return this.get();
  }

  /**
   * Sets a new value.
   * @param newValue The new value to set, of type S.
   */
  set value(newValue: S) {
    this.set(newValue);
  }
}
