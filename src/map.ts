import { hash } from "./hash";
import { Option, Some, None } from "./option";

/**
 * A generic hash map implementation that supports arbitrary key and value types
 * Internally uses a single Map with hashed keys for efficient storage and retrieval
 * Implements the standard Map interface with additional type safety and Option return types
 * @template K The type of keys stored in the map
 * @template V The type of values stored in the map
 */
export class HashMap<K, V> implements Iterable<[K, V]> {
    // Internal storage using a single Map with hashed keys and entry objects
    #entries = new Map<number, { key: K; value: V }>();

    /**
     * Creates a new HashMap instance
     * @param entries - Optional array of key-value pairs for initialization
     */
    constructor(entries?: readonly [K, V][]) {
        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    /**
     * Implements the Iterator protocol for use with for...of loops
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
            }
        };
    }

    /**
     * Returns an iterator over the entries in the map
     * @returns An iterator that yields [key, value] pairs
     */
    entries(): IterableIterator<[K, V]> {
        return this[Symbol.iterator]();
    }

    /**
     * Retrieves a value from the map by its key
     * @param key - The key to look up
     * @returns Option<V> containing the value if found, None if not present
     */
    get(key: K): Option<V> {
        const entry = this.#entries.get(hash(key));
        return entry ? Some(entry.value) : None;
    }

    /**
     * Associates a key with a value in the map
     * @param key - The key to set
     * @param value - The value to associate with the key
     * @returns The HashMap instance for method chaining
     */
    set(key: K, value: V): this {
        this.#entries.set(hash(key), { key, value });
        return this;
    }

    /**
     * Checks if a key exists in the map
     * @param key - The key to check for
     * @returns true if the key exists, false otherwise
     */
    has(key: K): boolean {
        return this.#entries.has(hash(key));
    }

    /**
     * Removes an entry from the map
     * @param key - The key to remove
     * @returns true if an entry was removed, false if the key wasn't found
     */
    delete(key: K): boolean {
        return this.#entries.delete(hash(key));
    }

    /**
     * Removes all entries from the map
     * Resets the map to its initial empty state
     */
    clear(): void {
        this.#entries.clear();
    }

    /**
     * Returns an iterator over the map's keys
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
            }
        };
    }

    /**
     * Returns an iterator over the map's values
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
            }
        };
    }

    /**
     * Executes a provided function once for each key-value pair in the map
     * @param callbackfn - Function to execute for each entry
     * @param thisArg - Value to use as 'this' when executing the callback
     */
    forEach(callbackfn: (value: V, key: K, map: HashMap<K, V>) => void, thisArg?: any): void {
        for (const { key, value } of this.#entries.values()) {
            callbackfn.call(thisArg, value, key, this);
        }
    }

    /**
     * Gets the number of key-value pairs in the map
     * @returns The current size of the map
     */
    get size(): number {
        return this.#entries.size;
    }
}
