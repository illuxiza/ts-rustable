import { iter } from '../src';
import '../src/advanced';

describe('Fuse', () => {
  test('should fuse iterator', () => {
    let count = 0;
    const iterator = iter([1, 2, 3])
      .map((x) => {
        count++;
        return count <= 2 ? x : undefined;
      })
      .fuse();

    const result = iterator.collect();
    expect(result).toEqual([1, 2]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).fuse().collect();
    expect(result).toEqual([]);
  });

  test('should stop at first undefined', () => {
    const result = iter([1, undefined, 2, 3]).fuse().collect();
    expect(result).toEqual([1]);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .fuse();

    expect(sideEffects).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([1, 2]);
    expect(sideEffects).toEqual([1, 2]);
  });
});
