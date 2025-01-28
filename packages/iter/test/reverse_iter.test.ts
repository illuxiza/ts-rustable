import { iter } from '../src';
import '../src/advanced';

describe('ReverseIter', () => {
  test('should reverse array elements', () => {
    const result = iter([1, 2, 3, 4]).reverse().collect();
    expect(result).toEqual([4, 3, 2, 1]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).reverse().collect();
    expect(result).toEqual([]);
  });

  test('should handle single element', () => {
    const result = iter([1]).reverse().collect();
    expect(result).toEqual([1]);
  });

  test('should work with transformations', () => {
    const result = iter([1, 2, 3, 4])
      .map((x) => x * 2)
      .reverse()
      .filter((x) => x > 4)
      .collect();
    expect(result).toEqual([8, 6]);
  });

  test('should handle strings', () => {
    const result = iter('hello').reverse().collect().join('');
    expect(result).toBe('olleh');
  });

  test('should be lazy in evaluation', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3])
      .map((x) => {
        sideEffects.push(x);
        return x * 2;
      })
      .reverse();

    expect(sideEffects).toEqual([1, 2, 3]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([6, 4]);
  });

  test('should maintain object references', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const result = iter([obj1, obj2]).reverse().collect();
    expect(result[0]).toBe(obj2);
    expect(result[1]).toBe(obj1);
  });
});
