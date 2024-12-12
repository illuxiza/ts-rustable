import { iter } from '../src';

describe('InspectIter', () => {
  test('should inspect values without modifying them', () => {
    const inspected: number[] = [];
    const result = iter([1, 2, 3])
      .inspect((x) => inspected.push(x))
      .collect();

    expect(result).toEqual([1, 2, 3]);
    expect(inspected).toEqual([1, 2, 3]);
  });

  test('should be lazy', () => {
    const inspected: number[] = [];
    const iterator = iter([1, 2, 3, 4]).inspect((x) => inspected.push(x));

    expect(inspected).toEqual([]);
    const result = iterator.take(2).collect();
    expect(result).toEqual([1, 2]);
    expect(inspected).toEqual([1, 2]);
  });

  test('should work with transformations', () => {
    const inspected: number[] = [];
    const result = iter([1, 2, 3])
      .map((x) => x * 2)
      .inspect((x) => inspected.push(x))
      .filter((x) => x > 4)
      .collect();

    expect(result).toEqual([6]);
    expect(inspected).toEqual([2, 4, 6]);
  });

  test('should handle empty iterator', () => {
    const inspected: number[] = [];
    const result = iter([])
      .inspect((x) => inspected.push(x))
      .collect();

    expect(result).toEqual([]);
    expect(inspected).toEqual([]);
  });

  test('should work with complex objects', () => {
    const inspected: any[] = [];
    const objects = [{ id: 1 }, { id: 2 }];
    const result = iter(objects)
      .inspect((x) => inspected.push({ ...x }))
      .map((x) => x.id)
      .collect();

    expect(result).toEqual([1, 2]);
    expect(inspected).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
