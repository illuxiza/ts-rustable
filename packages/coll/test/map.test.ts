import { HashMap } from '../src/map';
import { Option } from '@rustable/enum';

describe('HashMap', () => {
  let map: HashMap<string, number>;

  beforeEach(() => {
    map = new HashMap<string, number>();
  });

  test('should create an empty HashMap', () => {
    expect(map.len()).toBe(0);
  });

  test('isEmpty', () => {
    const map = new HashMap<string, number>();
    expect(map.isEmpty()).toBe(true);
    map.insert('a', 1);
    expect(map.isEmpty()).toBe(false);
  });

  test('should insert and retrieve key-value pairs', () => {
    expect(map.insert('a', 1)).toEqual(Option.None());
    expect(map.len()).toBe(1);
    expect(map.get('a').unwrapOr(0)).toBe(1);
  });

  test('should update existing key', () => {
    map.insert('a', 1);
    expect(map.insert('a', 2).unwrap()).toBe(1);
    expect(map.get('a').unwrapOr(0)).toBe(2);
  });

  test('should remove key-value pairs', () => {
    map.insert('a', 1);
    expect(map.remove('a').unwrap()).toBe(1);
    expect(map.len()).toBe(0);
    expect(map.get('a').isNone()).toBe(true);
  });

  test('should handle non-existing keys', () => {
    expect(map.get('b').isNone()).toBe(true);
  });

  test('should clear the map', () => {
    map.insert('a', 1);
    map.clear();
    expect(map.len()).toBe(0);
  });

  test('should iterate over entries', () => {
    map.insert('a', 1);
    map.insert('b', 2);
    expect([...map.entries()]).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  test('should handle multiple entries with the same hash', () => {
    const map = new HashMap<{ id: number }, number>();
    const key1 = { id: 1 };
    const key2 = { id: 2 };
    map.insert(key1, 1);
    map.insert(key2, 2);
    expect(map.get(key1).unwrapOr(0)).toBe(1);
    expect(map.get(key2).unwrapOr(0)).toBe(2);
  });

  test('should handle large number of entries', () => {
    for (let i = 0; i < 1000; i++) {
      map.insert(`key${i}`, i);
    }
    expect(map.len()).toBe(1000);
  });

  test('should implement removeEntry', () => {
    map.insert('a', 1);
    const entry = map
      .removeEntry('a')
      .map(([k, v]) => [k, v * 2])
      .unwrapOr(['', 0]);
    expect(entry).toEqual(['a', 2]);
    expect(map.len()).toBe(0);
  });

  test('should implement keys and values iterators', () => {
    map.insert('a', 1);
    map.insert('b', 2);
    expect([...map.keys()]).toEqual(['a', 'b']);
    expect([...map.values()]).toEqual([1, 2]);
  });

  test('should retain elements based on predicate', () => {
    map.insert('a', 1);
    map.insert('b', 2);
    map.insert('c', 3);
    map.retain((_, v) => v % 2 === 0);
    expect(map.len()).toBe(1);
    expect(map.get('b').unwrapOr(0)).toBe(2);
  });

  test('should drain all entries', () => {
    map.insert('a', 1);
    map.insert('b', 2);
    const entries = [...map.drain()];
    expect(entries).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
    expect(map.len()).toBe(0);
  });

  test('should initialize with entries', () => {
    const entries: [string, number][] = [
      ['a', 1],
      ['b', 2],
    ];
    const mapWithEntries = new HashMap(entries);
    expect(mapWithEntries.len()).toBe(2);
    expect(mapWithEntries.get('a').unwrapOr(0)).toBe(1);
    expect(mapWithEntries.get('b').unwrapOr(0)).toBe(2);
  });

  test('should handle getUnchecked method', () => {
    map.insert('a', 1);
    expect(map.getUnchecked('a')).toBe(1);
    expect(() => map.getUnchecked('nonexistent')).toThrow('Key not found');
  });

  test('should handle key equality edge cases', () => {
    // Test object equality
    const objMap = new HashMap<{ id: string }, number>();
    const key1 = { id: 'same' };
    const key2 = { id: 'same' };
    objMap.insert(key1, 1);
    expect(objMap.get(key2).unwrapOr(0)).toBe(1);

    // Test null/undefined handling
    const nullMap = new HashMap<any, number>();
    nullMap.insert(null, 1);
    nullMap.insert(undefined, 2);
    expect(nullMap.get(null).unwrapOr(0)).toBe(1);
    expect(nullMap.get(undefined).unwrapOr(0)).toBe(2);
  });

  describe('entry methods', () => {
    test('entry API with occupied entry', () => {
      const map = new HashMap<string, number>();
      map.insert('key', 1);

      const entry = map.entry('key');
      expect(entry.isOccupied()).toBe(true);

      entry.occupied().map((occupied) => {
        expect(occupied.get()).toBe(1);
        occupied.modify((v) => v * 2);
        expect(occupied.get()).toBe(2);
        expect(occupied.getKey()).toBe('key');
      });
    });

    test('entry API with vacant entry', () => {
      const map = new HashMap<string, number>();
      const entry = map.entry('key');

      expect(entry.isVacant()).toBe(true);
      entry.vacant().map((vacant) => {
        expect(vacant.getKey()).toBe('key');
        expect(vacant.insert(1)).toBe(1);
      });
      expect(map.get('key').unwrap()).toBe(1);
    });

    test('orInsert methods', () => {
      const map = new HashMap<string, number>();

      // Test orInsert
      expect(map.entry('a').orInsert(1)).toBe(1);
      expect(map.entry('a').orInsert(2)).toBe(1); // Already exists

      // Test orInsertWith
      expect(map.entry('b').orInsertWith(() => 2)).toBe(2);
      expect(map.entry('b').orInsertWith(() => 3)).toBe(2); // Already exists

      // Test orInsertWithKey
      expect(map.entry('abc').orInsertWithKey((k) => k.length)).toBe(3);
      expect(map.entry('abc').orInsertWithKey((_k) => 0)).toBe(3); // Already exists
    });

    test('andModify and andReplaceEntryWith', () => {
      const map = new HashMap<string, number>();
      map.insert('key', 1);

      // Test andModify
      map.entry('key').andModify((v) => (v *= 2));
      expect(map.get('key').unwrap()).toBe(2);

      // Test andReplaceEntryWith
      const oldValue = map.entry('key').andReplaceEntryWith(() => 3);
      expect(oldValue.unwrap()).toBe(2);
      expect(map.get('key').unwrap()).toBe(3);

      // Test on vacant entry
      map.entry('nonexistent').andModify((v) => (v *= 2)); // Should do nothing
      expect(map.containsKey('nonexistent')).toBe(false);
    });
  });

  it('should handle edge cases for deletion', () => {
    const map = new HashMap<string, number>();
    map.insert('key1', 1);
    map.insert('key2', 2);

    expect(map.remove('nonexistent').isNone()).toBe(true);
    expect(map.len()).toBe(2);

    expect(map.remove('key1').isSome()).toBe(true);
    expect(map.len()).toBe(1);
  });

  it('should clear map correctly', () => {
    const map = new HashMap<string, number>();
    map.insert('key1', 1);
    map.insert('key2', 2);

    map.clear();
    expect(map.len()).toBe(0);
    expect(map.isEmpty()).toBe(true);
  });
});

describe('query methods', () => {});

describe('error cases', () => {
  test('getUnchecked on non-existent key', () => {
    const map = new HashMap<string, number>();
    expect(() => map.getUnchecked('nonexistent')).toThrow('Key not found');
  });
});

describe('static methods', () => {
  test('fromKey', () => {
    const map = HashMap.fromKey('hello', (k) => k.length);
    expect(map.get('hello').unwrap()).toBe(5);
  });
});
