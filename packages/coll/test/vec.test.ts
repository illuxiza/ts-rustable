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
});
