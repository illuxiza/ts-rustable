import { Enum, None, Option, Some, variant } from '@rustable/enum';
import type { HashMap } from '../collections/map';

/**
 * Represents an occupied entry in the map, providing methods to access and modify the value.
 */
export class OccupiedEntry<K, V> {
  constructor(
    private readonly key: K,
    private value: V,
    private readonly map: HashMap<K, V>,
  ) {}

  /**
   * Gets a reference to the value in the entry.
   */
  get(): V {
    return this.value;
  }

  /**
   * Sets the value of the entry and returns the old value.
   */
  insert(value: V): V {
    const oldValue = this.value;
    this.value = value;
    this.map.insert(this.key, value);
    return oldValue;
  }

  /**
   * Removes the entry from the map and returns the value.
   */
  remove(): V {
    return this.map.remove(this.key).unwrap();
  }

  /**
   * Provides in-place mutable access to the value.
   */
  modify(f: (value: V) => V): this {
    this.value = f(this.value);
    this.map.insert(this.key, this.value);
    return this;
  }

  /**
   * Replaces the value in the entry with a new value, returning the old value.
   */
  replaceWith(f: () => V): V {
    const oldValue = this.value;
    this.value = f();
    this.map.insert(this.key, this.value);
    return oldValue;
  }

  /**
   * Gets the key associated with this entry.
   */
  getKey(): K {
    return this.key;
  }
}

/**
 * Represents a vacant entry in the map, providing methods to insert values.
 */
export class VacantEntry<K, V> {
  constructor(
    private readonly key: K,
    private readonly map: HashMap<K, V>,
  ) {}

  /**
   * Sets the value of the entry with the key that was previously not present.
   */
  insert(value: V): V {
    this.map.insert(this.key, value);
    return value;
  }

  /**
   * Gets the key associated with this entry.
   */
  getKey(): K {
    return this.key;
  }
}

/**
 * Represents a view into a single entry in the map.
 * This enum can be either Occupied or Vacant.
 *
 * # Examples
 * ```ts
 * let map = new HashMap<string, number>();
 *
 * map.entry("key").match({
 *   Occupied: (_, _, value) => console.log(value),
 *   Vacant: (map, key) => map.insert(key, 1)
 * });
 * ```
 */
export class Entry<K, V> extends Enum {
  /**
   * Creates an Entry that represents an occupied entry.
   */
  @variant
  static Occupied<K, V>(_entry: OccupiedEntry<K, V>): Entry<K, V> {
    throw new Error('Not implemented');
  }

  /**
   * Creates an Entry that represents a vacant entry.
   */
  @variant
  static Vacant<K, V>(_entry: VacantEntry<K, V>): Entry<K, V> {
    throw new Error('Not implemented');
  }

  /**
   * Converts this Entry into an OccupiedEntry if it is occupied.
   */
  occupied(): Option<OccupiedEntry<K, V>> {
    return this.match({
      Occupied: (entry) => Some(entry),
      Vacant: () => None,
    });
  }

  /**
   * Converts this Entry into a VacantEntry if it is vacant.
   */
  vacant(): Option<VacantEntry<K, V>> {
    return this.match({
      Occupied: () => None,
      Vacant: (entry) => Some(entry),
    });
  }

  /**
   * Gets the key associated with this entry.
   */
  getKey(): K {
    return this.match({
      Occupied: (entry) => entry.getKey(),
      Vacant: (entry) => entry.getKey(),
    });
  }

  /**
   * Ensures a value is in the entry by inserting the default if empty.
   */
  orInsert(default_: V): V {
    return this.match({
      Occupied: (entry) => entry.get(),
      Vacant: (entry) => entry.insert(default_),
    });
  }

  /**
   * Ensures a value is in the entry by inserting the result of the default function if empty.
   *
   * # Examples
   * ```ts
   * let map = new HashMap<string, number>();
   *
   * // Insert random number if vacant
   * map.entry("key").orInsertWith(() => Math.random());
   * ```
   */
  orInsertWith(default_: () => V): V {
    return this.match({
      Occupied: (entry) => entry.get(),
      Vacant: (entry) => entry.insert(default_()),
    });
  }

  /**
   * Ensures a value is in the entry by inserting the result of the default function if empty.
   * The default function receives the key as its argument.
   *
   * # Examples
   * ```ts
   * let map = new HashMap<string, number>();
   *
   * // Insert length of the key if vacant
   * map.entry("hello").orInsertWithKey(key => key.length); // 5
   * ```
   */
  orInsertWithKey(default_: (key: K) => V): V {
    return this.match({
      Occupied: (entry) => entry.get(),
      Vacant: (entry) => entry.insert(default_(entry.getKey())),
    });
  }

  /**
   * Returns true if this entry is occupied.
   */
  isOccupied(): boolean {
    return this.is('Occupied');
  }

  /**
   * Returns true if this entry is vacant.
   */
  isVacant(): boolean {
    return this.is('Vacant');
  }

  /**
   * Removes the entry from the map and returns the value.
   * @throws If the entry is vacant
   */
  remove(): V {
    return this.match({
      Occupied: (entry) => entry.remove(),
      Vacant: () => {
        throw new Error('Called remove on vacant entry');
      },
    });
  }

  /**
   * Provides in-place mutable access to an occupied entry before any potential inserts.
   *
   * # Examples
   * ```ts
   * let map = new HashMap<string, number>();
   *
   * map.entry("key")
   *    .orInsert(1)
   *    .andModify(v => v * 2);
   *
   * assert(map.get("key").unwrap() === 2);
   * ```
   */
  andModify(f: (value: V) => V): this {
    return this.match({
      Occupied: (entry) => {
        entry.modify(f);
        return this;
      },
      Vacant: () => this,
    });
  }

  /**
   * Replaces the entry with a new value if it exists, returning the old value if present.
   *
   * # Examples
   * ```ts
   * let map = new HashMap<string, number>();
   *
   * // No previous value
   * let old = map.entry("key")
   *    .andReplaceEntryWith(() => 5);
   * assert(old.isNone());
   *
   * // Replace existing value
   * let old = map.entry("key")
   *    .andReplaceEntryWith(() => 10);
   * assert(old.unwrap() === 5);
   * ```
   */
  andReplaceEntryWith(f: () => V): Option<V> {
    return this.match({
      Occupied: (entry) => Some(entry.replaceWith(f)),
      Vacant: () => None,
    });
  }
}
