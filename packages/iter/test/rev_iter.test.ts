import { iter } from '../src';
import '../src/advanced';

describe('Rev', () => {
  test('should reverse iterator', () => {
    const result = iter([1, 2, 3]).rev().collect();
    expect(result).toEqual([3, 2, 1]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).rev().collect();
    expect(result).toEqual([]);
  });

  test('should handle single element', () => {
    const result = iter([1]).rev().collect();
    expect(result).toEqual([1]);
  });

  test('should work with transformations', () => {
    const result = iter([1, 2, 3])
      .map((x) => x * 2)
      .rev()
      .collect();
    expect(result).toEqual([6, 4, 2]);
  });

  test('should maintain object references', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const result = iter([obj1, obj2]).rev().collect();
    expect(result[0]).toBe(obj2);
    expect(result[1]).toBe(obj1);
  });

  test('should work with strings', () => {
    const result = iter('hello').rev().collect().join('');
    expect(result).toBe('olleh');
  });
});
