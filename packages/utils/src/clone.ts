/**
 * Deep copy function that handles various data types and circular references
 * @param data The data to be cloned
 * @param inClone Flag to indicate if the function is being called recursively
 * @param hash WeakMap to track circular references
 * @returns Deep copy of the input data
 */
export function deepClone<T>(data: T, hash: WeakMap<object, any> = new WeakMap()): T {
  // Handle null and non-object types
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Handle circular references
  if (hash.has(data)) {
    return hash.get(data);
  }

  // Handle objects with a clone method
  if (!hash.has(data) && typeof (data as any).clone === 'function') {
    // Handle plain objects and class instances
    const copy = Object.create(Object.getPrototypeOf(data));
    // Add object to hash map to handle circular references
    hash.set(data, copy);
    const result = (data as any).clone(hash);
    if (result !== copy) {
      return result;
    }
    cloneProperties(data, copy, hash);
    return copy;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return new Date(data.getTime()) as unknown as T;
  }

  // Handle RegExp objects
  if (data instanceof RegExp) {
    return new RegExp(data.source, data.flags) as unknown as T;
  }

  // Handle Set objects
  if (data instanceof Set) {
    const copy = new Set();
    hash.set(data, copy);
    data.forEach((value) => copy.add(deepClone(value, hash)));
    return copy as unknown as T;
  }

  // Handle Map objects
  if (data instanceof Map) {
    const copy = new Map();
    hash.set(data, copy);
    data.forEach((value, key) => copy.set(key, deepClone(value, hash)));
    return copy as unknown as T;
  }

  // Handle Error objects
  if (data instanceof Error) {
    const error = new Error(data.message);
    error.stack = data.stack;
    return error as unknown as T;
  }

  // Handle TypedArray objects
  if (ArrayBuffer.isView(data)) {
    if (data instanceof DataView) {
      const buffer = deepClone(data.buffer);
      return new DataView(buffer, data.byteOffset, data.byteLength) as unknown as T;
    }
    // Handle other TypedArrays
    return new (data.constructor as any)(data) as unknown as T;
  }

  // Handle ArrayBuffer
  if (data instanceof ArrayBuffer) {
    return data.slice(0) as unknown as T;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    const copy: any[] = [];
    hash.set(data, copy);
    copy.push(...data.map((item) => deepClone(item, hash)));
    return copy as any;
  }

  // Handle plain objects and class instances
  const copy = Object.create(Object.getPrototypeOf(data));

  // Add object to hash map to handle circular references
  hash.set(data, copy);

  cloneProperties(data, copy, hash);

  return copy;
}

// Copy all enumerable properties, including symbols
function cloneProperties(source: any, target: any, hash: WeakMap<object, any>) {
  // Copy all enumerable properties, including symbols
  for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor) {
      if (descriptor.get || descriptor.set) {
        // For getters/setters, copy the descriptor as is
        Object.defineProperty(target, key, descriptor);
      } else {
        // For regular properties, deep copy the value and preserve the descriptor
        Object.defineProperty(target, key, {
          ...descriptor,
          value: deepClone(descriptor.value, hash),
        });
      }
    }
  }
}
