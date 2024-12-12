import { range } from '../src';

describe('RangeIter', () => {
  test('should generate range with default step', () => {
    const result = range(0, 5).collect();
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  test('should generate range with custom step', () => {
    const result = range(0, 6, 2).collect();
    expect(result).toEqual([0, 2, 4]);
  });
});
