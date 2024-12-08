import { HashSet } from '../src/set';

describe('HashSet', () => {
  let set: HashSet<string>;

  beforeEach(() => {
    set = new HashSet<string>();
  });

  test('should create an empty set', () => {
    expect(set.size).toBe(0);
  });

  test('should add elements', () => {
    expect(set.add('one')).toBe(true);
    expect(set.size).toBe(1);
    expect(set.has('one')).toBe(true);
  });

  test('should not add duplicate elements', () => {
    set.add('one');
    expect(set.add('one')).toBe(false);
    expect(set.size).toBe(1);
  });

  test('should delete elements', () => {
    set.add('one');
    expect(set.delete('one')).toBe(true);
    expect(set.size).toBe(0);
    expect(set.has('one')).toBe(false);
  });

  test('should return false when deleting non-existent element', () => {
    expect(set.delete('nonexistent')).toBe(false);
  });

  test('should clear all elements', () => {
    set.add('one');
    set.add('two');
    set.clear();
    expect(set.size).toBe(0);
    expect(set.has('one')).toBe(false);
    expect(set.has('two')).toBe(false);
  });

  test('should iterate over elements', () => {
    const elements = ['one', 'two', 'three'];
    elements.forEach((el) => set.add(el));

    const result = Array.from(set);
    expect(result.length).toBe(elements.length);
    elements.forEach((el) => {
      expect(result).toContain(el);
    });
  });

  test('should work with values() iterator', () => {
    const elements = ['one', 'two', 'three'];
    elements.forEach((el) => set.add(el));

    const result = Array.from(set.values());
    expect(result.length).toBe(elements.length);
    elements.forEach((el) => {
      expect(result).toContain(el);
    });
  });

  test('should work with complex objects', () => {
    const set = new HashSet<{ id: number; name: string }>();
    const obj1 = { id: 1, name: 'one' };
    const obj2 = { id: 2, name: 'two' };

    set.add(obj1);
    set.add(obj2);

    expect(set.size).toBe(2);
    expect(set.has(obj1)).toBe(true);
    expect(set.has(obj2)).toBe(true);
  });

  test('should work with constructor parameters', () => {
    const elements = ['one', 'two', 'three'];
    const set = new HashSet(elements);
    expect(set.size).toBe(elements.length);
    elements.forEach((el) => {
      expect(set.has(el)).toBe(true);
    });
  });
});
