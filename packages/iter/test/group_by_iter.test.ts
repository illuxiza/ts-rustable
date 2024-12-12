import { iter } from '../src';

describe('GroupBy', () => {
  test('should group by key', () => {
    const result = iter([1, 1, 2, 3, 2, 3])
      .groupBy((x) => x)
      .collect();
    expect(result).toEqual([
      [1, [1, 1]],
      [2, [2, 2]],
      [3, [3, 3]],
    ]);
  });

  test('should handle empty iterator', () => {
    const result = iter([])
      .groupBy((x) => x)
      .collect();
    expect(result).toEqual([]);
  });

  test('should group by complex key', () => {
    const items = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ];
    const result = iter(items)
      .groupBy((x) => x.type)
      .collect();
    expect(result).toEqual([
      [
        'a',
        [
          { type: 'a', value: 1 },
          { type: 'a', value: 3 },
        ],
      ],
      ['b', [{ type: 'b', value: 2 }]],
    ]);
  });

  test('should maintain object references', () => {
    const obj1 = { id: 1, group: 'a' };
    const obj2 = { id: 2, group: 'a' };
    const result = iter([obj1, obj2])
      .groupBy((x) => x.group)
      .collect();
    expect(result[0][1][0]).toBe(obj1);
    expect(result[0][1][1]).toBe(obj2);
  });
});
