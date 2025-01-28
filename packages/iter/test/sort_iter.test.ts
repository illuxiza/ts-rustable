import { iter } from '../src';

describe('Sort Operations', () => {
  test('should sort numbers', () => {
    const result = iter([3, 1, 4, 1, 5]).sort().collect();
    expect(result).toEqual([1, 1, 3, 4, 5]);
  });

  test('should sort with custom comparator', () => {
    const result = iter([3, 1, 4, 1, 5])
      .sort((a, b) => b - a)
      .collect();
    expect(result).toEqual([5, 4, 3, 1, 1]);
  });

  test('should sort by key', () => {
    const items = [
      { id: 3, name: 'c' },
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ];
    const result = iter(items)
      .sortBy((x) => x.id)
      .collect();
    expect(result).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ]);
  });

  test('should check if sorted', () => {
    expect(iter([1, 2, 3, 4]).isSorted()).toBe(true);
    expect(iter([1, 3, 2, 4]).isSorted()).toBe(false);
  });

  test('should check if sorted by custom comparator', () => {
    expect(iter([4, 3, 2, 1]).isSorted((a, b) => b - a)).toBe(true);
    expect(iter([4, 2, 3, 1]).isSorted((a, b) => b - a)).toBe(false);
  });

  test('should check if sorted by key', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ];
    expect(iter(items).isSortedBy((x) => x.id)).toBe(true);
    expect(iter(items).isSortedBy((x) => x.name)).toBe(true);

    const unsorted = [
      { id: 2, name: 'b' },
      { id: 1, name: 'a' },
      { id: 3, name: 'c' },
    ];
    expect(iter(unsorted).isSortedBy((x) => x.id)).toBe(false);
    expect(iter(unsorted).isSortedBy((x) => x.name)).toBe(false);
  });
});
