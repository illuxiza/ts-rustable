import { typeId, TypeId } from "./type_id";
import { TypeIdMap } from "./type_id";
import { Option } from "./option";

// Store trait implementations
const traitRegistry = new TypeIdMap<Map<TypeId, any>>();

type TraitImplementation<Class, Trait> = {
    [K in keyof Trait]?: (this: Class, ...args: any[]) => any;
};

/**
 * Implement a trait for a class
 * @param target The target class to implement the trait for
 * @param trait The trait to implement
 * @param implementation Optional custom implementation of the trait
 */
export function trait<Class extends object, Trait extends object>(
    target: { new (...args: any[]): Class; prototype: any }, 
    trait: { new (...args: any[]): Trait; prototype: any },
    implementation?: TraitImplementation<Class, Trait>
): void {
    const traitInstance = new trait();
    const traitId = typeId(trait);
    const targetId = typeId(target);

    // Get or create implementation map for target
    let implMap = traitRegistry.get(targetId).unwrapOr(new Map());
    
    // Create implementation that binds 'this' correctly
    const boundImpl: Record<string, any> = {};
    
    // Add trait methods from prototype
    Object.getOwnPropertyNames(Object.getPrototypeOf(traitInstance))
        .filter(name => name !== 'constructor')
        .forEach(name => {
            const method = traitInstance[name as keyof Trait];
            if (typeof method === 'function') {
                boundImpl[name] = method;
            }
        });

    // Add custom implementation methods
    if (implementation) {
        Object.entries(implementation).forEach(([key, method]) => {
            if (typeof method === 'function') {
                boundImpl[key] = method;
            }
        });
    }
    
    implMap.set(traitId, boundImpl);
    traitRegistry.set(targetId, implMap);

    // Add trait methods to target prototype
    const proto = target.prototype;
    Object.keys(boundImpl).forEach(name => {
        if (!(name in proto)) {
            Object.defineProperty(proto, name, {
                value: function(this: Class, ...args: any[]) {
                    const impl = traitRegistry.get(targetId)
                        .unwrap()
                        .get(traitId);
                    if (!impl || typeof impl[name] !== 'function') {
                        throw new Error(`Method ${name} not implemented for trait`);
                    }
                    
                    // Call the method with the correct this binding
                    return impl[name].call(this, ...args);
                },
                enumerable: false,
                configurable: true,
                writable: true
            });
        }
    });
}

/**
 * Check if a type implements a trait
 * @param target The target to check
 * @param trait The trait to check for
 * @returns true if the target implements the trait
 */
export function doesImplement<Class extends object, Trait extends object>(
    target: Class, 
    trait: new (...args: any[]) => Trait
): boolean {
    const targetId = typeId(target.constructor);
    const traitId = typeId(trait);

    return traitRegistry.get(targetId)
        .map(implMap => implMap.has(traitId))
        .unwrapOr(false);
}

/**
 * Get trait implementation for a target
 * @param target The target to get the trait implementation for
 * @param trait The trait to get
 * @returns The trait implementation or undefined if not found
 */
export function useTrait<Class extends object, Trait extends object>(
    target: Class, 
    trait: new (...args: any[]) => Trait
): Trait | undefined {
    const targetId = typeId(target.constructor);
    const traitId = typeId(trait);

    const impl = traitRegistry.get(targetId)
        .map(implMap => implMap.get(traitId))
        .unwrapOr(undefined);

    if (!impl) {
        return undefined;
    }

    // Create a proxy to bind methods to target
    return new Proxy({}, {
        get(_, prop: string) {
            const method = impl[prop];
            if (typeof method === 'function') {
                return function(this: any, ...args: any[]) {
                    return method.call(target, ...args);
                };
            }
            return method;
        }
    }) as Trait;
}
