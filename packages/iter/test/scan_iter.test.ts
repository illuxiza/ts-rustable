import { iter } from '../src';
import '../src/advanced';

describe('ScanIter', () => {
  test('should accumulate running sum', () => {
    const result = iter([1, 2, 3, 4])
      .scan(0, (acc, x) => acc + x)
      .collect();
    expect(result).toEqual([1, 3, 6, 10]);
  });

  test('should handle empty iterator', () => {
    const result = iter([])
      .scan(0, (acc, x) => acc + x)
      .collect();
    expect(result).toEqual([]);
  });

  test('should work with different types', () => {
    const result = iter(['a', 'b', 'c'])
      .scan('', (acc, x) => acc + x)
      .collect();
    expect(result).toEqual(['a', 'ab', 'abc']);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    const iterator = iter([1, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .scan(0, (acc, x) => acc + x);

    expect(sideEffects).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([1, 3]);
    expect(sideEffects).toEqual([1, 2]);
  });

  test('should work with complex state', () => {
    const result = iter([1, 2, 3])
      .scan({ sum: 0, count: 0 }, (state, x) => ({
        sum: state.sum + x,
        count: state.count + 1,
      }))
      .map((state) => state.sum / state.count)
      .collect();
    expect(result).toEqual([1, 1.5, 2]);
  });

  test('should handle state mutations', () => {
    const result = iter([1, 2, 3])
      .scan([0], (arr, x) => {
        arr.push(x);
        return [...arr];
      })
      .collect();
    expect(result).toEqual([
      [0, 1],
      [0, 1, 2],
      [0, 1, 2, 3],
    ]);
  });
});
