import { useTrait } from './trait';

/**
 * Into trait for type conversion
 * Similar to Rust's Into trait
 */
export class Into<T> {
    into(this: any): T {
        throw new Error("Not implemented");
    }
}

/**
 * Helper function to convert a value using Into trait
 * @param value The value to convert
 * @param targetType The type to convert to
 * @returns The converted value
 */
export function into<T extends object, U>(value: T, targetType: new (...args: any[]) => U): U {
    const impl = useTrait(value, Into) as Into<U>;
    if (impl) {
        return impl.into.call(value);
    }
    throw new Error(`No implementation of Into found for conversion to ${targetType.name}`);
}
