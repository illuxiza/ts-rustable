import { None, Some } from '@rustable/enum';
import { Vec } from '../src/vec';

describe('Vec', () => {
  let vec: Vec<number>;

  beforeEach(() => {
    vec = Vec.new<number>();
  });

  test('creation and basic operations', () => {
    expect(vec.len()).toBe(0);
    expect(vec.isEmpty()).toBe(true);

    vec.push(1);
    vec.push(2);
    expect(vec.len()).toBe(2);
    expect(vec.get(0)).toEqual(Some(1));
    expect(vec.get(1)).toEqual(Some(2));

    const last = vec.pop();
    expect(last).toEqual(Some(2));
    expect(vec.len()).toBe(1);
  });

  test('element access and manipulation', () => {
    expect(vec.get(0)).toEqual(None);

    vec.push(1);
    vec.push(3);
    vec.insert(1, 2);
    expect(vec.get(1)).toEqual(Some(2));
    expect(vec.len()).toBe(3);

    const removed = vec.remove(1);
    expect(removed).toEqual(2);
    expect(vec.len()).toBe(2);
    expect(vec.get(1)).toEqual(Some(3));
  });

  test('performance with large number of elements', () => {
    for (let i = 0; i < 1000; i++) {
      vec.push(i);
    }
    expect(vec.len()).toBe(1000);
    expect(vec.get(999)).toEqual(Some(999));
  });

  test('clearing and shrinking', () => {
    vec.push(1);
    vec.push(2);
    vec.clear();
    expect(vec.len()).toBe(0);
    expect(vec.isEmpty()).toBe(true);

    vec.push(1);
    vec.push(2);
    vec.resize(1, 0);
    expect(vec.len()).toBe(1);
    expect(vec.get(0)).toEqual(Some(1));
  });

  test('iteration', () => {
    vec.push(1);
    vec.push(2);
    vec.push(3);
    const result = [...vec];
    expect(result).toEqual([1, 2, 3]);
  });

  test('extend', () => {
    vec.push(1);
    vec.extend([2, 3, 4]);
    expect(vec.len()).toBe(4);
    expect(vec.get(3)).toEqual(Some(4));
  });

  test('slice', () => {
    vec.extend([1, 2, 3, 4, 5]);
    const slice = vec.slice(1, 4);
    expect(slice).toEqual([2, 3, 4]);
  });

  test('popIf functionality', () => {
    vec.extend([1, 2, 3, 4, 5]);

    // Test popIf with matching predicate
    const popped = vec.popIf((x) => x === 5);
    expect(popped).toEqual(Some(5));
    expect(vec.len()).toBe(4);

    // Test popIf with non-matching predicate
    const notPopped = vec.popIf((x) => x === 10);
    expect(notPopped).toEqual(None);
    expect(vec.len()).toBe(4);

    // Test popIf on empty vec
    vec.clear();
    const emptyPopped = vec.popIf((x) => x === 1);
    expect(emptyPopped).toEqual(None);
  });

  test('error handling and edge cases', () => {
    // Test invalid index access
    expect(vec.getUnchecked(0)).toBeUndefined();
    expect(() => vec.insert(-1, 1)).toThrow();

    // Test truncate with various values
    vec.extend([1, 2, 3]);
    vec.truncate(5); // Larger than length
    expect(vec.len()).toBe(3);

    vec.truncate(2); // Valid truncate
    expect(vec.len()).toBe(2);
    expect(vec.get(2)).toEqual(None);

    // Test swapRemove
    vec.extend([3, 4, 5]);
    const swapped = vec.swapRemove(1);
    expect(swapped).toEqual(2);
    expect(vec.len()).toBe(4);

    // Test invalid swapRemove
    expect(() => vec.swapRemove(10)).toThrow();
  });
});
