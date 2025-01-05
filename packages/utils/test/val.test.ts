import { Val } from '../src/val';

describe('Ref', () => {
  it('should allow reading values', () => {
    const obj = { name: 'Alice', age: 30 };
    const ref = Val(obj);

    expect(ref.name).toBe('Alice');
    expect(ref.age).toBe(30);
  });

  it('should allow modifying ref but not affect original', () => {
    const obj = { name: 'Alice', age: 30 };
    const ref = Val(obj);

    // Modify ref
    (ref as any).name = 'Bob';
    expect(ref.name).toBe('Bob');
    // Original should not change
    expect(obj.name).toBe('Alice');

    // Add new property to ref
    (ref as any).newProp = 'test';
    expect((ref as any).newProp).toBe('test');
    // Original should not have new property
    expect((obj as any).newProp).toBeUndefined();
  });

  it('should allow reading and modifying nested objects in ref', () => {
    const obj = {
      id: 1,
      data: {
        user: {
          name: 'Alice',
          settings: {
            theme: 'dark',
          },
        },
      },
    };

    const ref = Val(obj);

    // Modify nested object in ref
    ref.data.user.name = 'Bob';
    expect(ref.data.user.name).toBe('Bob');
    // Original should not change
    expect(obj.data.user.name).toBe('Alice');

    ref.data.user.settings.theme = 'light';
    expect(ref.data.user.settings.theme).toBe('light');
    // Original should not change
    expect(obj.data.user.settings.theme).toBe('dark');
  });

  it('should handle arrays correctly', () => {
    const arr = [1, 2, 3];
    const ref = Val(arr);

    // Reading should work
    expect(ref[0]).toBe(1);
    expect(ref.length).toBe(3);
    expect([...ref]).toEqual([1, 2, 3]);

    // Modify array in ref
    ref[0] = 10;
    expect(ref[0]).toBe(10);
    // Original should not change
    expect(arr[0]).toBe(1);

    // Array methods should modify ref but not original
    ref.push(4);
    expect(ref.length).toBe(4);
    expect(ref[3]).toBe(4);
    // Original should not change
    expect(arr.length).toBe(3);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('should handle class instances correctly', () => {
    class User {
      constructor(
        public name: string,
        public age: number,
      ) {}

      greet() {
        return `Hello, ${this.name}`;
      }

      setName(newName: string) {
        this.name = newName;
        return this;
      }
    }

    const user = new User('Alice', 30);
    const ref = Val(user);

    // Methods should work with current state
    expect(ref.greet()).toBe('Hello, Alice');

    // Modify ref
    ref.setName('Bob');
    expect(ref.name).toBe('Bob');
    expect(ref.greet()).toBe('Hello, Bob');
    // Original should not change
    expect(user.name).toBe('Alice');
    expect(user.greet()).toBe('Hello, Alice');
  });

  it('should handle methods that return new objects', () => {
    const arr = [1, 2, 3];
    const ref = Val(arr);

    // map returns a new array
    const mapped = ref.map((x) => x * 2);
    expect(mapped).toEqual([2, 4, 6]);
    // Original should not change
    expect(arr).toEqual([1, 2, 3]);

    // filter returns a new array
    const filtered = ref.filter((x) => x > 1);
    expect(filtered).toEqual([2, 3]);
    // Original should not change
    expect(arr).toEqual([1, 2, 3]);
  });

  it('should handle methods that modify array', () => {
    const arr = [3, 1, 2];
    const ref = Val(arr);

    // sort should modify ref but not original
    ref.sort();
    expect([...ref]).toEqual([1, 2, 3]);
    expect(arr).toEqual([3, 1, 2]);

    // reverse should modify ref but not original
    ref.reverse();
    expect([...ref]).toEqual([3, 2, 1]);
    expect(arr).toEqual([3, 1, 2]);
  });

  it('should handle nested method calls correctly', () => {
    const obj = {
      data: {
        items: [1, 2, 3],
        getItems() {
          return this.items;
        },
        addItem(item: number) {
          this.items.push(item);
          return this.items;
        },
      },
    };

    const ref = Val(obj);

    // Getting items should return current state
    const items = ref.data.getItems();
    expect(items).toEqual([1, 2, 3]);

    // Adding item should modify ref but not original
    ref.data.addItem(4);
    expect(ref.data.items).toEqual([1, 2, 3, 4]);
    expect(obj.data.items).toEqual([1, 2, 3]);
  });

  it('should handle methods that return primitives', () => {
    const obj = {
      count: 0,
      getCount() {
        return this.count;
      },
      increment() {
        this.count++;
        return this.count;
      },
    };

    const ref = Val(obj);

    // Getting count should return current state
    expect(ref.getCount()).toBe(0);

    // Increment should modify ref but not original
    ref.increment();
    expect(ref.count).toBe(1);
    expect(ref.getCount()).toBe(1);
    expect(obj.count).toBe(0);
  });

  it('should handle Date methods correctly', () => {
    const date = new Date('2024-01-01');
    const ref = Val(date);

    // Read methods should work with current state
    expect(ref.getFullYear()).toBe(2024);
    expect(ref.toISOString()).toBe('2024-01-01T00:00:00.000Z');

    // Modification methods should modify ref but not original
    ref.setFullYear(2025);
    expect(ref.getFullYear()).toBe(2025);
    expect(date.getFullYear()).toBe(2024);
  });

  it('should handle Set/Map methods correctly', () => {
    const set = new Set([1, 2, 3]);
    const ref = Val(set);

    // Read methods should work
    expect(ref.has(1)).toBe(true);
    expect([...ref.values()]).toEqual([1, 2, 3]);

    // Modifications should affect ref but not original
    ref.add(4);
    expect([...ref.values()]).toEqual([1, 2, 3, 4]);
    expect([...set.values()]).toEqual([1, 2, 3]);

    const map = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    const mapRef = Val(map);

    // Read methods should work
    expect(mapRef.get('a')).toBe(1);
    expect([...mapRef.entries()]).toEqual([
      ['a', 1],
      ['b', 2],
    ]);

    // Modifications should affect ref but not original
    mapRef.set('c', 3);
    expect([...mapRef.entries()]).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    expect([...map.entries()]).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('should allow accessing original value through ptr', () => {
    const obj = { name: 'Alice', age: 30 };
    const ref = Val(obj);

    expect(ref[Val.ptr]).toBe(obj);

    // Original value should be unchanged
    expect(ref[Val.ptr]).toEqual({ name: 'Alice', age: 30 });
  });
});
