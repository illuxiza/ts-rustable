import { HashMap } from '../src/map';

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
  });
});
