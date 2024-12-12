import { iter } from '../src';
import { Collector } from '../src/collector';

describe('CollectInto', () => {
  test('should collect into array', () => {
    const result = iter([1, 2, 3]).collectInto(Collector.toArray());
    expect(result).toEqual([1, 2, 3]);
  });

  test('should collect into set', () => {
    const result = iter([1, 2, 2, 3]).collectInto(Collector.toSet());
    expect([...result]).toEqual([1, 2, 3]);
  });

  test('should handle empty iterator', () => {
    const result = iter([]).collectInto(Collector.toArray());
    expect(result).toEqual([]);
  });

  test('should work with transformations', () => {
    const result = iter([1, 2, 3])
      .map((x) => x * 2)
      .collectInto(Collector.toArray());
    expect(result).toEqual([2, 4, 6]);
  });

  test('should collect into map', () => {
    const result = iter([1, 2, 3]).collectInto(
      Collector.toMap(
        (x) => x,
        (x) => x.toString(),
      ),
    );
    expect(result).toEqual(
      new Map([
        [1, '1'],
        [2, '2'],
        [3, '3'],
      ]),
    );
  });
});
