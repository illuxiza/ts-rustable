import { hash } from '../../src/utils/hash';

describe('hash', () => {
  test('should handle primitive types', () => {
    // Numbers
    expect(hash(123)).toBe(123);
    expect(hash(0)).toBe(0);
    expect(hash(-123)).toBe(-123);

    // Strings
    expect(hash('test')).toBe(hash('test')); // Same string should have same hash
    expect(hash('test')).not.toBe(hash('test2')); // Different strings should have different hashes

    // Booleans
    expect(hash(true)).toBe(1);
    expect(hash(false)).toBe(0);

    // Null/Undefined
    expect(hash(null)).toBe(-1);
    expect(hash(undefined)).toBe(-1);
  });

  test('should handle objects consistently', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 }; // Same content, different order
    const obj3 = { a: 1, b: 3 }; // Different content

    // Same content should have same hash
    expect(hash(obj1)).toBe(hash(obj2));

    // Different content should have different hash
    expect(hash(obj1)).not.toBe(hash(obj3));

    // Nested objects should work
    const nested1 = { a: { b: 1 } };
    const nested2 = { a: { b: 1 } };
    expect(hash(nested1)).toBe(hash(nested2));
  });

  test('should handle arrays consistently', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];
    const arr3 = [3, 2, 1];

    // Same content should have same hash
    expect(hash(arr1)).toBe(hash(arr2));

    // Different order should have different hash
    expect(hash(arr1)).not.toBe(hash(arr3));

    // Nested arrays should work
    const nested1 = [[1], [2]];
    const nested2 = [[1], [2]];
    expect(hash(nested1)).toBe(hash(nested2));
  });

  test('should handle functions', () => {
    const func1 = () => 123;
    const func2 = () => 123;
    const func3 = () => 456;

    // Functions with same code should have same hash
    expect(hash(func1)).toBe(hash(func2));

    // Functions with different code should have different hash
    expect(hash(func1)).not.toBe(hash(func3));
  });

  test('should handle symbols', () => {
    const sym1 = Symbol('test');
    const sym2 = Symbol('test');
    const sym3 = Symbol('different');

    // Symbols with same description should have same hash
    expect(hash(sym1)).toBe(hash(sym2));

    // Different symbols should have different hashes
    expect(hash(sym1)).not.toBe(hash(sym3));
  });

  test('should handle complex mixed types', () => {
    const complex1 = {
      num: 123,
      str: 'test',
      bool: true,
      arr: [1, { nested: true }],
      obj: { a: 1, b: [2, 3] },
    };
    const complex2 = {
      num: 123,
      str: 'test',
      bool: true,
      arr: [1, { nested: true }],
      obj: { a: 1, b: [2, 3] },
    };

    // Same complex structure should have same hash
    expect(hash(complex1)).toBe(hash(complex2));

    // Modifying any part should change the hash
    const complex3 = { ...complex1, num: 456 };
    expect(hash(complex1)).not.toBe(hash(complex3));
  });

  describe('hash special types', () => {
    test('should hash symbol values', () => {
      const sym = Symbol('test');
      const sym2 = Symbol('test');
      expect(hash(sym)).toBe(hash(sym2));
    });

    test('should hash bigint values', () => {
      const big = BigInt('9007199254740991');
      const big2 = BigInt('9007199254740991');
      expect(hash(big)).toBe(hash(big2));
    });

    test('should hash undefined value', () => {
      expect(hash(undefined)).toBe(-1);
    });
  });
});
