import { deepClone } from '../src/clone';

describe('deepClone', () => {
  it('should clone primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBeNull();
    expect(deepClone(undefined)).toBeUndefined();
  });

  it('should clone Date objects', () => {
    const date = new Date('2023-01-01');
    const cloned = deepClone(date);
    expect(cloned).toBeInstanceOf(Date);
    expect(cloned.getTime()).toBe(date.getTime());
    expect(cloned).not.toBe(date); // Different reference
  });

  it('should clone Arrays', () => {
    const array = [1, 'two', { three: 3 }];
    const cloned = deepClone(array);
    expect(cloned).toEqual(array);
    expect(cloned).not.toBe(array);
    expect(cloned[2]).not.toBe(array[2]); // Deep clone of nested objects
  });

  it('should clone Objects', () => {
    const obj = {
      a: 1,
      b: 'two',
      c: { nested: true },
    };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.c).not.toBe(obj.c); // Deep clone of nested objects
  });

  it('should clone Set objects', () => {
    const set: Set<any> = new Set([1, 2, { three: 3 }]);
    const cloned: Set<any> = deepClone(set);
    expect(cloned).toBeInstanceOf(Set);
    expect([...cloned]).toEqual([...set]);
    expect(cloned).not.toBe(set);
    // Check deep cloning of objects inside Set
    const originalObj = [...set][2];
    const clonedObj = [...cloned][2];
    expect(clonedObj).not.toBe(originalObj);
  });

  it('should clone Map objects', () => {
    const map = new Map<string, any>([
      ['a', 1],
      ['b', { value: 2 }],
    ]);
    const cloned = deepClone(map);
    expect(cloned).toBeInstanceOf(Map);
    expect([...cloned.entries()]).toEqual([...map.entries()]);
    expect(cloned).not.toBe(map);
    // Check deep cloning of objects inside Map
    expect(cloned.get('b')).not.toBe(map.get('b'));
  });

  it('should handle circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const cloned = deepClone(obj);
    expect(cloned.a).toBe(1);
    expect(cloned.self).toBe(cloned); // Circular reference preserved
    expect(cloned.self).not.toBe(obj); // Different reference
  });

  it('should handle complex nested structures', () => {
    const complex = {
      array: [1, 2, { nested: true }],
      set: new Set<any>([1, { inSet: true }]),
      map: new Map<string, any>([['key', { inMap: true }]]),
      date: new Date(),
      nested: {
        deeper: {
          deepest: { value: 42 },
        },
      },
    };
    const cloned = deepClone(complex);

    // Test structure equality
    expect(cloned).toEqual(complex);
    // Test references are different
    expect(cloned).not.toBe(complex);
    expect(cloned.array).not.toBe(complex.array);
    expect(cloned.array[2]).not.toBe(complex.array[2]);
    expect(cloned.set).not.toBe(complex.set);
    expect(cloned.map).not.toBe(complex.map);
    expect(cloned.date).not.toBe(complex.date);
    expect(cloned.nested.deeper.deepest).not.toBe(complex.nested.deeper.deepest);
  });

  it('should handle property descriptors', () => {
    const obj = {};
    Object.defineProperty(obj, 'readOnly', {
      value: 42,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    Object.defineProperty(obj, 'computed', {
      get() {
        return this._value;
      },
      set(v) {
        this._value = v;
      },
      enumerable: true,
      configurable: true,
    });

    const cloned = deepClone(obj);
    const readOnlyDesc = Object.getOwnPropertyDescriptor(cloned, 'readOnly');
    const computedDesc = Object.getOwnPropertyDescriptor(cloned, 'computed');

    expect(readOnlyDesc?.value).toBe(42);
    expect(readOnlyDesc?.writable).toBe(false);
    expect(readOnlyDesc?.enumerable).toBe(true);
    expect(readOnlyDesc?.configurable).toBe(false);

    expect(computedDesc?.get).toBeDefined();
    expect(computedDesc?.set).toBeDefined();
    expect(computedDesc?.enumerable).toBe(true);
    expect(computedDesc?.configurable).toBe(true);
  });

  it('should clone RegExp objects', () => {
    const regex = /test/gi;
    const cloned = deepClone(regex);
    expect(cloned).toBeInstanceOf(RegExp);
    expect(cloned.source).toBe(regex.source);
    expect(cloned.flags).toBe(regex.flags);
    expect(cloned).not.toBe(regex);
  });

  it('should clone Error objects', () => {
    const error = new Error('test error');
    error.stack = 'test stack';
    const cloned = deepClone(error);
    expect(cloned).toBeInstanceOf(Error);
    expect(cloned.message).toBe(error.message);
    expect(cloned.stack).toBe(error.stack);
    expect(cloned).not.toBe(error);
  });

  it('should clone TypedArray objects', () => {
    const typedArrays = [
      new Int8Array([1, 2, 3]),
      new Uint8Array([1, 2, 3]),
      new Uint8ClampedArray([1, 2, 3]),
      new Int16Array([1, 2, 3]),
      new Uint16Array([1, 2, 3]),
      new Int32Array([1, 2, 3]),
      new Uint32Array([1, 2, 3]),
      new Float32Array([1.1, 2.2, 3.3]),
      new Float64Array([1.1, 2.2, 3.3]),
    ];

    typedArrays.forEach((arr) => {
      const cloned = deepClone(arr);
      expect(cloned).toBeInstanceOf(arr.constructor);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned.buffer).not.toBe(arr.buffer);
    });
  });

  it('should handle DataView and ArrayBuffer objects', () => {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setInt32(0, 42);
    view.setFloat64(4, 3.14);

    const cloned = deepClone(view);
    expect(cloned).toBeInstanceOf(DataView);
    expect(cloned.getInt32(0)).toBe(42);
    expect(cloned.getFloat64(4)).toBe(3.14);
    expect(cloned.buffer).not.toBe(buffer);
    expect(cloned.byteLength).toBe(view.byteLength);
    expect(cloned.byteOffset).toBe(view.byteOffset);

    // Test ArrayBuffer cloning
    const bufferClone = deepClone(buffer);
    expect(bufferClone).toBeInstanceOf(ArrayBuffer);
    expect(bufferClone).not.toBe(buffer);
    expect(bufferClone.byteLength).toBe(buffer.byteLength);

    // Verify data independence
    const originalView = new DataView(buffer);
    const clonedView = new DataView(bufferClone);
    originalView.setInt32(0, 100);
    expect(clonedView.getInt32(0)).toBe(42); // Original value
  });
});
