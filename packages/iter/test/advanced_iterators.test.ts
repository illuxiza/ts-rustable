import { iter } from '../src';

describe('Advanced Iterator Operations', () => {
  describe('cycle', () => {
    test('cycle operations', () => {
      const result = iter([1, 2, 3]).cycle().take(8).collect();
      expect(result).toEqual([1, 2, 3, 1, 2, 3, 1, 2]);
      expect(() => iter([]).cycle()).toThrow();
    });
  });

  describe('intersperse', () => {
    test('intersperse operations', () => {
      expect(iter([1, 2, 3]).intersperse(0).collect()).toEqual([1, 0, 2, 0, 3]);
      expect(
        iter([] as number[])
          .intersperse(0)
          .collect(),
      ).toEqual([]);
      expect(iter([1]).intersperse(0).collect()).toEqual([1]);
      expect(iter([1, 2]).intersperse(0).collect()).toEqual([1, 0, 2]);
    });
  });

  describe('chunks', () => {
    test('chunk operations', () => {
      expect(iter([1, 2, 3, 4, 5]).chunks(2).collect()).toEqual([[1, 2], [3, 4], [5]]);
      expect(iter([]).chunks(2).collect()).toEqual([]);
      expect(() => iter([1, 2, 3]).chunks(0)).toThrow();
    });
  });

  describe('peekable', () => {
    test('peek operations', () => {
      const peekable = iter([1, 2, 3]).peekable();
      expect(peekable.peek().unwrap()).toBe(1);
      expect(peekable.peek().unwrap()).toBe(1); // Still 1
      expect(peekable.next().unwrap()).toBe(1);
      expect(peekable.peek().unwrap()).toBe(2);
    });

    test('peek with empty iterator', () => {
      const peekable = iter([]).peekable();
      expect(peekable.peek().isNone()).toBe(true);
      expect(peekable.next().isNone()).toBe(true);
    });
  });
});
