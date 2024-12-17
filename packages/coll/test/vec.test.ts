import { None, Some } from '@rustable/enum';
import { Vec, vec } from '../src/vec';

describe('Vec', () => {
  let array: Vec<number>;

  beforeEach(() => {
    array = Vec.new<number>();
  });

  test('creation and basic operations', () => {
    expect(array.len()).toBe(0);
    expect(array.isEmpty()).toBe(true);

    array.push(1);
    array.push(2);
    expect(array.len()).toBe(2);
    expect(array.get(0)).toEqual(Some(1));
    expect(array.get(1)).toEqual(Some(2));

    const last = array.pop();
    expect(last).toEqual(Some(2));
    expect(array.len()).toBe(1);
  });

  test('element access and manipulation', () => {
    expect(array.get(0)).toEqual(None);

    array.push(1);
    array.push(3);
    array.insert(1, 2);
    expect(array.get(1)).toEqual(Some(2));
    expect(array.len()).toBe(3);

    const removed = array.remove(1);
    expect(removed).toEqual(2);
    expect(array.len()).toBe(2);
    expect(array.get(1)).toEqual(Some(3));
  });

  test('performance with large number of elements', () => {
    for (let i = 0; i < 1000; i++) {
      array.push(i);
    }
    expect(array.len()).toBe(1000);
    expect(array.get(999)).toEqual(Some(999));
  });

  test('clearing and shrinking', () => {
    array.push(1);
    array.push(2);
    array.clear();
    expect(array.len()).toBe(0);
    expect(array.isEmpty()).toBe(true);

    array.push(1);
    array.push(2);
    array.resize(1, 0);
    expect(array.len()).toBe(1);
    expect(array.get(0)).toEqual(Some(1));
  });

  test('iteration', () => {
    array.push(1);
    array.push(2);
    array.push(3);
    const result = [...array];
    expect(result).toEqual([1, 2, 3]);
  });

  test('extend', () => {
    array.push(1);
    array.extend([2, 3, 4]);
    expect(array.len()).toBe(4);
    expect(array.get(3)).toEqual(Some(4));
  });

  test('slice', () => {
    array.extend([1, 2, 3, 4, 5]);
    const slice = array.slice(1, 4);
    expect(slice).toEqual([2, 3, 4]);
  });

  test('popIf functionality', () => {
    array.extend([1, 2, 3, 4, 5]);

    const popped = array.popIf((x) => x === 5);
    expect(popped).toEqual(Some(5));
    expect(array.len()).toBe(4);

    const notPopped = array.popIf((x) => x === 10);
    expect(notPopped).toEqual(None);
    expect(array.len()).toBe(4);

    array.clear();
    const emptyPopped = array.popIf((x) => x === 1);
    expect(emptyPopped).toEqual(None);
  });

  test('error handling and edge cases', () => {
    expect(array.getUnchecked(0)).toBeUndefined();
    expect(() => array.insert(-1, 1)).toThrow();

    array.extend([1, 2, 3]);
    array.truncate(5);
    expect(array.len()).toBe(3);

    array.truncate(2);
    expect(array.len()).toBe(2);
    expect(array.get(2)).toEqual(None);

    array.extend([3, 4, 5]);
    const swapped = array.swapRemove(1);
    expect(swapped).toEqual(2);
    expect(array.len()).toBe(4);

    expect(() => array.swapRemove(10)).toThrow();
  });

  test('index access', () => {
    array.extend([1, 2, 3, 4, 5]);

    expect(array[0]).toBe(1);
    expect(array[2]).toBe(3);
    expect(array[4]).toBe(5);

    array[1] = 10;
    expect(array[1]).toBe(10);

    expect(() => array[10]).toThrow();
    expect(() => array[-1]).toThrow();
  });

  test('boundary cases', () => {
    expect(array.get(-1)).toEqual(None);
    expect(() => array.remove(-1)).toThrow();

    array.push(1);
    expect(() => array.insert(2, 2)).toThrow();

    expect(() => array.resize(-1, 0)).toThrow();

    array.clear();
    expect(array.pop()).toEqual(None);

    expect(array.slice(-1, 1)).toEqual([]);
    expect(array.slice(0, -1)).toEqual([]);

    array.extend([1, 2, 3]);
    expect(array.slice(3, 2)).toEqual([]);

    expect(() => array.swapRemove(array.len())).toThrow();
  });

  test('getMut functionality', () => {
    array.extend([1, 2, 3]);

    const mutRef = array.getMut(1);
    expect(mutRef.isSome()).toBe(true);

    mutRef.unwrap().value = 10;
    expect(array.get(1)).toEqual(Some(10));

    const outOfBounds = array.getMut(5);
    expect(outOfBounds.isNone()).toBe(true);

    const negativeIndex = array.getMut(-1);
    expect(negativeIndex.isNone()).toBe(true);
  });

  test('creation using vec() global method', () => {
    const array = [1, 2, 3, 4, 5];
    const vector = vec(array);

    expect(vector.len()).toBe(5);
    expect(vector[0]).toBe(1);
    expect(vector[4]).toBe(5);

    const emptyVector = vec([]);
    expect(emptyVector.isEmpty()).toBe(true);

    const stringVector = vec('hello');
    expect(stringVector.len()).toBe(5);
    expect(stringVector[0]).toBe('h');

    const setVector = vec(new Set([1, 2, 3]));
    expect(setVector.len()).toBe(3);
    expect(setVector.contains(2)).toBe(true);
  });

  describe('retain methods', () => {
    test('retain', () => {
      const vec = Vec.from([1, 2, 3, 4, 5, 6]);
      vec.retain((x) => x % 2 === 0);
      expect([...vec]).toEqual([2, 4, 6]);
    });
  });

  describe('drain methods', () => {
    test('drain all elements', () => {
      const vec = Vec.from([1, 2, 3]);
      const drained = [...vec.drain()];
      expect(vec.isEmpty()).toBe(true);
      expect(drained).toEqual([1, 2, 3]);
    });

    test('drain with predicate', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      const evens = [...vec.drainBy((x) => x % 2 === 0)];
      expect([...vec]).toEqual([1, 3, 5]);
      expect(evens).toEqual([2, 4]);
    });

    test('drainRange', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      const middle = [...vec.drain({ start: 1, end: 4 })];
      expect([...vec]).toEqual([1, 5]);
      expect(middle).toEqual([2, 3, 4]);
    });
  });

  describe('dedup methods', () => {
    test('dedup with default equality', () => {
      const vec = Vec.from([1, 2, 2, 3, 2, 1, 1]);
      vec.dedup();
      expect([...vec]).toEqual([1, 2, 3, 2, 1]);
    });

    test('dedup with custom equality', () => {
      const vec = Vec.from([1.0, 1.1, 1.2, 2.0, 2.1]);
      vec.dedup((a, b) => Math.floor(a) === Math.floor(b));
      expect([...vec]).toEqual([1.0, 2.0]);
    });

    test('dedupBy', () => {
      let vec = Vec.from(['foo', 'bar', 'Bar', 'baz', 'bar']);

      vec.dedupBy((a, b) => a.toLowerCase() === b.toLowerCase());

      expect([...vec]).toEqual(['foo', 'bar', 'baz', 'bar']);
    });

    test('dedupByKey', () => {
      const vec = Vec.from([10, 20, 21, 30, 20]);
      vec.dedupByKey((i) => Math.floor(i / 10));
      expect([...vec]).toEqual([10, 20, 30, 20]);

      const vec2 = Vec.from(['apple', 'banana', 'cherry', 'date', 'elderberry']);
      vec2.dedupByKey((s) => s.length);
      expect([...vec2]).toEqual(['apple', 'banana', 'date', 'elderberry']);

      const vec3 = Vec.from([1.1, 1.2, 2.1, 2.2, 3.1]);
      vec3.dedupByKey(Math.floor);
      expect([...vec3]).toEqual([1.1, 2.1, 3.1]);
    });
  });

  describe('split methods', () => {
    test('splitOff', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      const right = vec.splitOff(3);
      expect([...vec]).toEqual([1, 2, 3]);
      expect([...right]).toEqual([4, 5]);
    });

    test('splitOffReserving', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      const right = vec.splitOffReserving(3);
      expect([...vec]).toEqual([1, 2, 3]);
      expect([...right]).toEqual([4, 5]);
    });

    test('splitBy', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      const evens = vec.splitBy((x) => x % 2 === 0);
      expect([...vec]).toEqual([1, 3, 5]);
      expect([...evens]).toEqual([2, 4]);
    });

    test('splitByKey', () => {
      const vec = Vec.from([1, 2, 3, 4, 5, 6]);
      const groups = vec.splitByKey((x) => x % 3);
      expect([...groups.get(0).unwrapOr([])]).toEqual([3, 6]);
      expect([...groups.get(1).unwrapOr([])]).toEqual([1, 4]);
      expect([...groups.get(2).unwrapOr([])]).toEqual([2, 5]);
    });

    test('splitIntoChunks', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      const chunks = vec.splitIntoChunks(2);
      expect([...chunks[0]]).toEqual([1, 2]);
      expect([...chunks[1]]).toEqual([3, 4]);
      expect([...chunks[2]]).toEqual([5]);
      expect(vec.isEmpty()).toBe(true);
    });
  });

  describe('sort methods', () => {
    test('sort with default comparison', () => {
      const vec = Vec.from([3, 1, 4, 1, 5]);
      vec.sort();
      expect([...vec]).toEqual([1, 1, 3, 4, 5]);
    });

    test('sort with custom comparison', () => {
      const vec = Vec.from([3, 1, 4, 1, 5]);
      vec.sort((a, b) => b - a);
      expect([...vec]).toEqual([5, 4, 3, 1, 1]);
    });

    test('sortBy', () => {
      const vec = Vec.from(['hello', 'a', 'world']);
      vec.sortBy((s) => s.length);
      expect([...vec]).toEqual(['a', 'hello', 'world']);
    });

    test('unstableSort', () => {
      const vec = Vec.from([3, 1, 4, 1, 5]);
      vec.unstableSort();
      expect([...vec]).toEqual([1, 1, 3, 4, 5]);
    });

    test('isSorted', () => {
      const vec = Vec.from([1, 2, 3, 4, 5]);
      expect(vec.isSorted()).toBe(true);
      expect(vec.isSorted((a, b) => b - a)).toBe(false);
    });

    test('isSortedBy', () => {
      const vec = Vec.from(['a', 'hello', 'world']);
      expect(vec.isSortedBy((s) => s.length)).toBe(true);
    });
  });

  describe('fill methods', () => {
    test('fill', () => {
      const vec = Vec.from([1, 2, 3]);
      vec.fill(0);
      expect([...vec]).toEqual([0, 0, 0]);
    });

    test('fillWith', () => {
      const vec = Vec.from([1, 2, 3]);
      vec.fillWith((i) => i * 2);
      expect([...vec]).toEqual([0, 2, 4]);
    });
  });

  describe('additional error cases', () => {
    test('invalid chunk size in splitIntoChunks', () => {
      const vec = Vec.from([1, 2, 3]);
      expect(() => vec.splitIntoChunks(0)).toThrow('Chunk size must be positive');
      expect(() => vec.splitIntoChunks(-1)).toThrow('Chunk size must be positive');
    });
  });
});
