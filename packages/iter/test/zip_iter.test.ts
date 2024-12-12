import { iter } from '../src';

describe('ZipIter', () => {
  test('should zip two iterators', () => {
    const iter1 = iter([1, 2, 3]);
    const iter2 = iter(['a', 'b', 'c']);
    const zipped = iter1.zip(iter2).collect();
    expect(zipped).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });

  test('should zip iterators of different lengths', () => {
    const iter1 = iter([1, 2, 3, 4]);
    const iter2 = iter(['a', 'b']);
    const zipped = iter1.zip(iter2).collect();
    expect(zipped).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
  });
});

describe('UnzipIter', () => {
  test('should unzip an iterator of pairs', () => {
    const pairs = iter<[number, string]>([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
    const [numbers, letters] = pairs.unzip();
    expect(numbers).toEqual([1, 2, 3]);
    expect(letters).toEqual(['a', 'b', 'c']);
  });

  test('should handle empty iterator', () => {
    const emptyPairs = iter<[number, string]>([]);
    const [first, second] = emptyPairs.unzip();
    expect(first).toEqual([]);
    expect(second).toEqual([]);
  });
});
