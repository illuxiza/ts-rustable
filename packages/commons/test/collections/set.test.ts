import { HashSet } from '../../src/collections/set';

describe('HashSet', () => {
  let set: HashSet<string>;

  beforeEach(() => {
    set = new HashSet<string>();
  });

  test('should create an empty HashSet', () => {
    expect(set.len()).toBe(0);
  });

  test('should insert values', () => {
    expect(set.insert('a')).toBe(true);
    expect(set.len()).toBe(1);
    expect(set.contains('a')).toBe(true);
  });

  test('should not insert duplicate values', () => {
    set.insert('a');
    expect(set.insert('a')).toBe(false);
    expect(set.len()).toBe(1);
  });

  test('should remove values', () => {
    set.insert('a');
    expect(set.remove('a')).toBe(true);
    expect(set.len()).toBe(0);
    expect(set.contains('a')).toBe(false);
  });

  test('should return false when removing non-existing values', () => {
    expect(set.remove('b')).toBe(false);
  });

  test('should return false for non-existing values', () => {
    expect(set.contains('b')).toBe(false);
  });

  test('should clear the set', () => {
    set.insert('a');
    set.clear();
    expect(set.len()).toBe(0);
  });

  test('should iterate over values', () => {
    set.insert('a');
    set.insert('b');
    const values = [...set];
    expect(values).toEqual(expect.arrayContaining(['a', 'b']));
  });

  test('should handle complex objects', () => {
    const set = new HashSet<{ id: number }>();
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    set.insert(obj1);
    set.insert(obj2);
    expect(set.len()).toBe(2);
    expect(set.contains(obj1)).toBe(true);
    expect(set.contains(obj2)).toBe(true);
  });

  test('should work with constructor parameters', () => {
    const elements = ['one', 'two', 'three'];
    const set = new HashSet(elements);
    expect(set.len()).toBe(elements.length);
    elements.forEach((el) => {
      expect(set.contains(el)).toBe(true);
    });
  });

  test('should handle large number of entries', () => {
    for (let i = 0; i < 1000; i++) {
      set.insert(`value${i}`);
    }
    expect(set.len()).toBe(1000);
  });

  test('values() method should return an iterator', () => {
    set.insert('a');
    set.insert('b');
    const iterator = set.values();
    expect(typeof iterator.next).toBe('function');
    const values = [...iterator];
    expect(values).toEqual(expect.arrayContaining(['a', 'b']));
  });
});
