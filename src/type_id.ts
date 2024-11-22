import { Option } from "./option";
import { HashMap } from "./map";

// 使用Symbol作为唯一标识符
const TYPE_ID = Symbol('TYPE_ID');
const TYPE_NAME = Symbol('TYPE_NAME');

/**
 * TypeId is a unique identifier for a type
 * It's implemented as a branded string type for type safety
 */
export type TypeId = string & { readonly __type: unique symbol };

/**
 * Generate a new unique type ID using a timestamp-based approach
 */
function generateTypeId(): TypeId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}` as TypeId;
}

/**
 * Get or create a type ID for the given target
 * @param target The target to get or create a type ID for
 * @returns The type ID
 * @throws If target is null or undefined
 */
export function typeId(target: any): TypeId {
    if (target === null || target === undefined) {
        throw new Error('Cannot get typeId of null or undefined');
    }

    // If target is an object, get its constructor
    if (typeof target === "object") {
        target = target.__proto__.constructor;
    } else if (typeof target !== "function") {
        // If target is a primitive value, get its constructor
        target = target.constructor;
    }

    // If target already has a type ID, return it
    if (TYPE_ID in target) {
        return target[TYPE_ID];
    }

    // Create a new type ID
    const id = generateTypeId();
    Object.defineProperty(target, TYPE_ID, {
        value: id,
        enumerable: false,
        writable: false,
        configurable: false
    });

    // Store type name if available
    if (target.name) {
        Object.defineProperty(target, TYPE_NAME, {
            value: target.name,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    return id;
}

/**
 * A specialized map for storing values with type IDs as keys
 * Provides type safety and efficient lookup
 */
export class TypeIdMap<V> {
    private map = new HashMap<TypeId, V>();

    /**
     * Set a value for a type ID
     * @param key The type ID
     * @param value The value to store
     * @returns this for chaining
     */
    set(key: TypeId, value: V): this {
        this.map.set(key, value);
        return this;
    }

    /**
     * Get a value by type ID
     * @param key The type ID
     * @returns An Option containing the value if found
     */
    get(key: TypeId): Option<V> {
        return this.map.get(key);
    }

    /**
     * Check if a type ID exists in the map
     * @param key The type ID to check
     */
    has(key: TypeId): boolean {
        return this.map.has(key);
    }

    /**
     * Delete a value by type ID
     * @param key The type ID to delete
     * @returns true if an element was deleted
     */
    delete(key: TypeId): boolean {
        return this.map.delete(key);
    }

    /**
     * Remove all entries from the map
     */
    clear(): void {
        this.map.clear();
    }

    /**
     * Get the number of entries in the map
     */
    get size(): number {
        return this.map.size;
    }

    /**
     * Get an iterator over the entries in the map
     */
    [Symbol.iterator](): IterableIterator<[TypeId, V]> {
        return this.map[Symbol.iterator]();
    }

    /**
     * Get an iterator over the entries in the map
     */
    entries(): IterableIterator<[TypeId, V]> {
        return this.map.entries();
    }

    /**
     * Get an iterator over the keys in the map
     */
    keys(): IterableIterator<TypeId> {
        return this.map.keys();
    }

    /**
     * Get an iterator over the values in the map
     */
    values(): IterableIterator<V> {
        return this.map.values();
    }

    /**
     * Execute a callback for each entry in the map
     * @param callbackfn The function to execute for each entry
     * @param thisArg Value to use as 'this' when executing callback
     */
    forEach(callbackfn: (value: V, key: TypeId, map: TypeIdMap<V>) => void, thisArg?: any): void {
        this.map.forEach((value, key) => {
            callbackfn.call(thisArg, value, key, this);
        });
    }
}