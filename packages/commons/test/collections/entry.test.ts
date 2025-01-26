import { HashMap } from '../../src/collections/map';

describe('Entry API', () => {
  describe('OccupiedEntry', () => {
    let map: HashMap<string, number>;

    beforeEach(() => {
      map = new HashMap();
      map.insert('key', 1);
    });

    test('modify method', () => {
      const entry = map.entry('key');
      entry.occupied().map((occupied) => {
        occupied.modify((v) => v * 2);
        expect(occupied.get()).toBe(2);
        expect(map.get('key').unwrap()).toBe(2);
      });
    });

    test('replaceWith method', () => {
      const entry = map.entry('key');
      entry.occupied().map((occupied) => {
        const oldValue = occupied.replaceWith(() => 5);
        expect(oldValue).toBe(1);
        expect(occupied.get()).toBe(5);
        expect(map.get('key').unwrap()).toBe(5);
      });
    });

    test('remove method', () => {
      const entry = map.entry('key');
      const value = entry.remove();
      expect(value).toBe(1);
      expect(map.containsKey('key')).toBe(false);
    });
  });

  describe('VacantEntry', () => {
    let map: HashMap<string, number>;

    beforeEach(() => {
      map = new HashMap();
    });

    test('insert method', () => {
      const entry = map.entry('key');
      entry.vacant().map((vacant) => {
        const value = vacant.insert(1);
        expect(value).toBe(1);
        expect(map.get('key').unwrap()).toBe(1);
      });
    });

    test('getKey method', () => {
      const entry = map.entry('key');
      entry.vacant().map((vacant) => {
        expect(vacant.getKey()).toBe('key');
      });
    });
  });

  describe('Entry methods', () => {
    let map: HashMap<string, number>;

    beforeEach(() => {
      map = new HashMap();
    });

    test('andModify with vacant entry', () => {
      const entry = map.entry('key');
      entry.andModify((v) => v * 2); // Should do nothing for vacant entry
      expect(map.containsKey('key')).toBe(false);
    });

    test('andReplaceEntryWith with vacant entry', () => {
      const entry = map.entry('key');
      const result = entry.andReplaceEntryWith(() => 5);
      expect(result.isNone()).toBe(true);
      expect(map.containsKey('key')).toBe(false);
    });

    test('remove on vacant entry', () => {
      const entry = map.entry('key');
      expect(() => entry.remove()).toThrow('Called remove on vacant entry');
    });

    test('orInsertWithKey', () => {
      const entry = map.entry('hello');
      const value = entry.orInsertWithKey((key) => key.length);
      expect(value).toBe(5);
      expect(map.get('hello').unwrap()).toBe(5);
    });

    test('match method with occupied entry', () => {
      const map = new HashMap<string, number>();
      map.insert('key', 1);

      const entry = map.entry('key');
      const result = entry.match({
        Occupied: (entry) => entry.get() * 2,
        Vacant: () => 0,
      });

      expect(result).toBe(2);
    });

    test('match method with vacant entry', () => {
      const map = new HashMap<string, number>();
      const entry = map.entry('key');

      const result = entry.match({
        Occupied: (entry) => entry.get() * 2,
        Vacant: () => 0,
      });

      expect(result).toBe(0);
    });

    test('match method with partial patterns', () => {
      const map = new HashMap<string, number>();
      map.insert('key', 1);

      const entry = map.entry('key');
      
      // Only Occupied pattern
      const result1 = entry.match({
        Occupied: (entry) => entry.get() * 2,
      });
      expect(result1).toBe(2);

      // Only Vacant pattern
      const result2 = entry.match({
        Vacant: () => 0,
      });
      expect(result2).toBeUndefined();

      // Empty pattern object
      const result3 = entry.match({});
      expect(result3).toBeUndefined();
    });

    test('chaining entry methods', () => {
      const map = new HashMap<string, number>();

      // Test orInsert followed by modify
      map.entry('a')
        .orInsert(1)
      expect(map.get('a').unwrap()).toBe(1);

      map.entry('a')
        .match({
          Occupied: entry => entry.modify(v => v * 2),
          Vacant: () => {}
        });
      expect(map.get('a').unwrap()).toBe(2);

      // Test orInsertWithKey followed by modify
      const value = map.entry('hello')
        .orInsertWithKey(key => key.length);
      expect(value).toBe(5);

      map.entry('hello')
        .match({
          Occupied: entry => entry.modify(v => v + 1),
          Vacant: () => {}
        });
      expect(map.get('hello').unwrap()).toBe(6);
    });

    test('entry type checks', () => {
      const map = new HashMap<string, number>();
      map.insert('key', 1);

      const occupied = map.entry('key');
      expect(occupied.isOccupied()).toBe(true);
      expect(occupied.isVacant()).toBe(false);
      expect(occupied.occupied().isSome()).toBe(true);
      expect(occupied.vacant().isNone()).toBe(true);

      const vacant = map.entry('nonexistent');
      expect(vacant.isOccupied()).toBe(false);
      expect(vacant.isVacant()).toBe(true);
      expect(vacant.occupied().isNone()).toBe(true);
      expect(vacant.vacant().isSome()).toBe(true);
    });
  });
});
