import { iter } from '../src';

describe('Compare Operations', () => {
  test('should compare iterators', () => {
    expect(iter([1, 2, 3]).cmp(iter([1, 2, 3]))).toBe(0);
    expect(iter([1, 2, 3]).cmp(iter([1, 2, 4]))).toBe(-1);
    expect(iter([1, 2, 4]).cmp(iter([1, 2, 3]))).toBe(1);
  });

  test('should handle different lengths', () => {
    expect(iter([1, 2]).cmp(iter([1, 2, 3]))).toBe(-1);
    expect(iter([1, 2, 3]).cmp(iter([1, 2]))).toBe(1);
  });

  test('should compare by key', () => {
    const a = [{ val: 1 }, { val: 2 }];
    const b = [{ val: 1 }, { val: 3 }];
    expect(iter(a).cmpBy(iter(b), (x) => x.val)).toBe(-1);
  });

  test('should handle empty iterators', () => {
    expect(iter([]).cmp(iter([]))).toBe(0);
    expect(iter([] as any[]).cmp(iter([1]))).toBe(-1);
    expect(iter([1]).cmp(iter([]) as any)).toBe(1);
  });
});
