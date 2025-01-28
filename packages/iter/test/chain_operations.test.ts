import { None, Some } from '@rustable/enum';
import { iter } from '../src';
import '../src/advanced';

describe('Chain Operations', () => {
  describe('basic chains', () => {
    test('should chain iterators', () => {
      const result = iter([1, 2])
        .chain(iter([3, 4]))
        .chain(iter([5, 6]))
        .collect();
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should chain empty iterators', () => {
      const result = iter([1, 2])
        .chain(iter([] as number[]))
        .chain(iter([3, 4]))
        .collect();
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('transform chains', () => {
    test('should chain map operations', () => {
      const result = iter([1, 2, 3])
        .map((x) => x * 2)
        .map((x) => x + 1)
        .collect();
      expect(result).toEqual([3, 5, 7]);
    });

    test('should chain filter operations', () => {
      const result = iter([1, 2, 3, 4, 5])
        .filter((x) => x % 2 === 0)
        .filter((x) => x > 2)
        .collect();
      expect(result).toEqual([4]);
    });

    test('should chain skip and take operations', () => {
      const result = iter([1, 2, 3, 4, 5]).skip(2).take(2).collect();
      expect(result).toEqual([3, 4]);
    });

    test('should chain skipWhile and takeWhile', () => {
      const result = iter([1, 2, 3, 4, 2, 1])
        .skipWhile((x) => x < 3)
        .takeWhile((x) => x > 2)
        .collect();
      expect(result).toEqual([3, 4]);
    });
  });

  describe('advanced chains', () => {
    test('should combine filter, map and take', () => {
      const result = iter([1, 2, 3, 4, 5])
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .take(1)
        .collect();
      expect(result).toEqual([4]);
    });

    test('should combine peekable and filter', () => {
      const peekable = iter([1, 2, 3]).peekable();
      const firstPeek = peekable.peek();
      const result = peekable.filter((x) => firstPeek.isSome() && x > firstPeek.unwrap()).collect();
      expect(result).toEqual([2, 3]);
    });

    test('should combine intersperse and take', () => {
      const result = iter([1, 2, 3]).intersperse(0).take(4).collect();
      expect(result).toEqual([1, 0, 2, 0]);
    });

    test('should combine multiple transformations', () => {
      const result = iter([1, 2, 3, 4, 5, 6, 7, 8])
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .chunks(2)
        .map((chunk) => chunk.reduce((a, b) => a + b))
        .collect();
      expect(result).toEqual([12, 28]);
    });

    test('should handle nested operations', () => {
      const result = iter([1, 2, 3])
        .map((x) => iter([x, x * 2]).collect())
        .map((arr) => arr.join('-'))
        .intersperse(',')
        .collect()
        .join('');
      expect(result).toEqual('1-2,2-4,3-6');
    });
  });

  describe('error handling', () => {
    test('should handle empty iterators in chains', () => {
      const result = iter([] as number[])
        .filter((x) => x > 0)
        .map((x) => x * 2)
        .collect();
      expect(result).toEqual([]);
    });

    test('should handle None values in chains', () => {
      const result = iter([1, 2, 3, 4])
        .filterMap((x) => (x % 2 === 0 ? Some(x) : None))
        .map((x) => x * 2)
        .collect();
      expect(result).toEqual([4, 8]);
    });

    test('should handle invalid operations', () => {
      expect(() => {
        iter([1, 2, 3]).chunks(0).collect();
      }).toThrow();

      expect(() => {
        iter([]).cycle().collect();
      }).toThrow();
    });

    test('should handle nested empty iterators', () => {
      const result = iter([1, 2, 3])
        .map(() => iter([] as number[]).collect())
        .filter((arr) => arr.length > 0)
        .collect();
      expect(result).toEqual([]);
    });

    test('should handle multiple empty operations', () => {
      const result = iter([] as number[])
        .filter((x) => x > 0)
        .map((x) => x * 2)
        .take(5)
        .skip(2)
        .collect();
      expect(result).toEqual([]);
    });

    test('should handle type conversions', () => {
      const result = iter(['1', '2', '3', 'a', '4'])
        .filterMap((x) => {
          const num = parseInt(x);
          return isNaN(num) ? None : Some(num);
        })
        .map((x) => x * 2)
        .collect();
      expect(result).toEqual([2, 4, 6, 8]);
    });
  });

  describe('performance considerations', () => {
    test('should handle large chains efficiently', () => {
      const result = iter(Array.from({ length: 1000 }, (_, i) => i))
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .take(5)
        .collect();
      expect(result).toEqual([0, 4, 8, 12, 16]);
    });

    test('should be lazy evaluated', () => {
      let count = 0;
      const iterator = iter([1, 2, 3, 4, 5])
        .map((x) => {
          count++;
          return x * 2;
        })
        .filter((x) => x > 5);

      // Iteration hasn't started yet, count should be 0
      expect(count).toBe(0);

      const result = iterator.take(1).collect();
      expect(count).toBeLessThan(5);
      expect(result).toEqual([6]);
    });
  });

  describe('edge cases', () => {
    test('should handle zero-length chunks', () => {
      expect(() => iter([1, 2, 3]).chunks(0)).toThrow();
      expect(() => iter([1, 2, 3]).chunks(-1)).toThrow();
    });

    test('should handle cycling empty iterator', () => {
      expect(() => iter([]).cycle()).toThrow();
      expect(() => iter([]).cycle().collect()).toThrow();
    });

    test('should handle max safe integer', () => {
      const result = iter([Number.MAX_SAFE_INTEGER])
        .map((x) => x + 1)
        .collect();
      expect(result[0]).toBe(Number.MAX_SAFE_INTEGER + 1);
    });

    test('should handle undefined and null', () => {
      const result = iter<number | undefined | null>([undefined, null, 1, undefined, 2, null])
        .filter((x): x is number => x !== null && x !== undefined)
        .collect();
      expect(result).toEqual([1, 2]);
    });
  });

  describe('complex combinations', () => {
    test('should combine multiple iterators with transformations', () => {
      const result = iter([1, 2])
        .chain(iter([3, 4]))
        .filter((x) => x % 2 === 0)
        .chain(iter([5, 6]))
        .take(3)
        .collect();
      expect(result).toEqual([2, 4, 5]);
    });

    test('should handle nested filtering and mapping', () => {
      const result = iter([1, 2, 3, 4])
        .map((x) => iter([x, x * 2]).collect())
        .filter((arr) => arr[0] % 2 === 0)
        .map((arr) => arr.map((x) => x * 2))
        .collect();
      expect(result).toEqual([
        [4, 8],
        [8, 16],
      ]);
    });

    test('should handle complex data transformations', () => {
      const result = iter(['1,2', '3,4', '5,6'])
        .map((str) => str.split(','))
        .map((arr) => arr.map(Number))
        .map((arr) => arr.reduce((a, b) => a + b))
        .filter((sum) => sum > 5)
        .collect();
      expect(result).toEqual([7, 11]);
    });
  });

  describe('performance and memory', () => {
    test('should handle very large sequences efficiently', () => {
      const largeArray = Array.from({ length: 1000000 }, (_, i) => i);
      const start = performance.now();

      const result = iter(largeArray)
        .filter((x) => x % 2 === 0)
        .map((x) => x * 2)
        .take(5)
        .collect();

      const end = performance.now();
      expect(end - start).toBeLessThan(100);
      expect(result).toEqual([0, 4, 8, 12, 16]);
    });

    test('should demonstrate lazy evaluation with side effects', () => {
      const sideEffects: number[] = [];
      const iterator = iter([1, 2, 3, 4, 5])
        .map((x) => {
          sideEffects.push(x);
          return x * 2;
        })
        .filter((x) => x > 5);

      expect(sideEffects).toEqual([]); // No operations have been performed yet

      const firstResult = iterator.next();
      expect(sideEffects).toEqual([1, 2, 3]); // Only processed until the first element that meets the condition is found
      expect(firstResult.unwrap()).toBe(6);
    });
  });

  describe('type safety', () => {
    test('should maintain type safety through transformations', () => {
      const result = iter(['1', '2', '3'])
        .map((x) => parseInt(x))
        .filter((x): x is number => !isNaN(x))
        .map((x) => x.toFixed(2))
        .collect();
      expect(result).toEqual(['1.00', '2.00', '3.00']);
    });

    test('should handle union types', () => {
      const mixed = [1, '2', 3, '4'];
      const result = iter(mixed)
        .filter((x): x is number => typeof x === 'number')
        .map((x) => (x as number) * 2)
        .collect();
      expect(result).toEqual([2, 6]);
    });
  });
});
