import { iter } from '../src';
import '../src/advanced';

describe('Uniq', () => {
  test('should remove consecutive duplicates', () => {
    const result = iter([1, 1, 2, 2, 1]).uniq().collect();
    expect(result).toEqual([1, 2, 1]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).uniq().collect();
    expect(result).toEqual([]);
  });

  test('should handle no duplicates', () => {
    const result = iter([1, 2, 3]).uniq().collect();
    expect(result).toEqual([1, 2, 3]);
  });

  test('should handle all duplicates', () => {
    const result = iter([1, 1, 1]).uniq().collect();
    expect(result).toEqual([1]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 1, 2, 2, 3])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .uniq();

    expect(sideEffects).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([1, 2]);
    expect(sideEffects).toEqual([1, 1, 2]);
  });
});

describe('UniqBy', () => {
  test('should remove duplicates by key', () => {
    const result = iter([
      { id: 1, name: 'a' },
      { id: 1, name: 'b' },
      { id: 2, name: 'c' },
    ])
      .uniqBy((x) => x.id)
      .collect();
    expect(result).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'c' },
    ]);
  });

  test('should handle complex keys', () => {
    const result = iter(['hello', 'hi', 'world'])
      .uniqBy((x) => x.length)
      .collect();
    expect(result).toEqual(['hello', 'hi']);
  });

  test('should maintain object references', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 1 };
    const obj3 = { id: 2 };
    const result = iter([obj1, obj2, obj3])
      .uniqBy((x) => x.id)
      .collect();
    expect(result[0]).toBe(obj1);
    expect(result[1]).toBe(obj3);
  });
});
