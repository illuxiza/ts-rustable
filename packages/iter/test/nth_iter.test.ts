import { iter } from '../src';

describe('Nth', () => {
  test('should get nth element', () => {
    expect(iter([1, 2, 3]).nth(1).unwrap()).toBe(2);
    expect(iter([1]).nth(0).unwrap()).toBe(1);
    expect(iter([]).nth(0).isNone()).toBe(true);
  });

  test('should handle out of bounds', () => {
    expect(iter([1, 2, 3]).nth(5).isNone()).toBe(true);
    expect(iter([1, 2, 3]).nth(-1).isNone()).toBe(true);
  });

  test('should be lazy', () => {
    const sideEffects: number[] = [];
    iter([1, 2, 3, 4])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .nth(1);
    expect(sideEffects).toEqual([1, 2]);
  });
});

describe('First/Last', () => {
  test('should get first element', () => {
    expect(iter([1, 2, 3]).next().unwrap()).toBe(1);
    expect(iter([]).next().isNone()).toBe(true);
  });

  test('should get last element', () => {
    expect(iter([1, 2, 3]).last().unwrap()).toBe(3);
    expect(iter([]).last().isNone()).toBe(true);
  });

  test('should be lazy for first', () => {
    const sideEffects: number[] = [];
    iter([1, 2, 3])
      .map((x) => {
        sideEffects.push(x);
        return x;
      })
      .next();
    expect(sideEffects).toEqual([1]);
  });
});
