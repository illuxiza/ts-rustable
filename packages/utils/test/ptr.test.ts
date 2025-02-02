import { Ptr } from '../src/ptr';

describe('Ptr', () => {
  it('should get and set object properties through getter/setter', () => {
    let obj = { name: 'Alice', age: 30 };
    const m = Ptr({
      get: () => obj,
      set: (newValue) => {
        obj = newValue;
      },
    });

    expect(m.name).toBe('Alice');
    expect(m.age).toBe(30);

    m.name = 'Bob';
    expect(obj.name).toBe('Bob');
    expect(m.name).toBe('Bob');
  });

  it('should replace entire object using Symbol', () => {
    let obj = { name: 'Alice', age: 30 };
    const m = Ptr({
      get: () => obj,
      set: (newValue) => {
        obj = newValue;
      },
    });

    m[Ptr.ptr] = { name: 'Charlie', age: 25 };
    expect(obj).toEqual({ name: 'Charlie', age: 25 });
    expect(m.name).toBe('Charlie');
    expect(m.age).toBe(25);
  });

  it('should work with nested objects through getter/setter', () => {
    let obj = {
      id: 1,
      info: {
        name: 'Alice',
        age: 30,
        hobbies: ['reading', 'coding'],
      },
    };
    const m = Ptr({
      get: () => obj,
      set: (newValue) => {
        obj = newValue;
      },
    });

    expect(m.info.name).toBe('Alice');
    m.info.age = 31;
    expect(obj.info.age).toBe(31);

    m.info.hobbies.push('swimming');
    expect(obj.info.hobbies).toEqual(['reading', 'coding', 'swimming']);
  });

  it('should handle complex nested objects and arrays', () => {
    let obj = {
      id: 1,
      data: {
        users: [
          { id: 1, name: 'Alice', tags: ['admin'] },
          { id: 2, name: 'Bob', tags: ['user'] },
        ],
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
          },
        },
      },
    };

    const m = Ptr({
      get: () => obj,
      set: (newValue) => {
        obj = newValue;
      },
    });

    // Modify deeply nested array
    m.data.users[0].tags.push('super');
    expect(obj.data.users[0].tags).toEqual(['admin', 'super']);

    // Modify deeply nested object
    m.data.settings.notifications.push = true;
    expect(obj.data.settings.notifications.push).toBe(true);

    // Replace nested object
    m.data.settings = { theme: 'light', notifications: { email: false, push: true } };
    expect(obj.data.settings).toEqual({
      theme: 'light',
      notifications: { email: false, push: true },
    });

    // Replace entire object using ptr
    m[Ptr.ptr] = {
      id: 2,
      data: {
        users: [{ id: 3, name: 'Charlie', tags: ['guest'] }],
        settings: { theme: 'system', notifications: { email: true, push: true } },
      },
    };
    expect(obj).toEqual({
      id: 2,
      data: {
        users: [{ id: 3, name: 'Charlie', tags: ['guest'] }],
        settings: { theme: 'system', notifications: { email: true, push: true } },
      },
    });
  });

  it('should handle array operations correctly', () => {
    let arr = [1, 2, 3];
    const m = Ptr({
      get: () => arr,
      set: (newValue) => {
        arr = newValue;
      },
    });

    // Array methods should work
    m.push(4);
    expect(arr).toEqual([1, 2, 3, 4]);

    m.pop();
    expect(arr).toEqual([1, 2, 3]);

    m.unshift(0);
    expect(arr).toEqual([0, 1, 2, 3]);

    m.shift();
    expect(arr).toEqual([1, 2, 3]);

    // Array spread should work
    m[Ptr.ptr] = [...m[Ptr.ptr], 4, 5];
    expect(arr).toEqual([1, 2, 3, 4, 5]);

    // Array splice should work
    m.splice(1, 2, 6, 7);
    expect(arr).toEqual([1, 6, 7, 4, 5]);
  });

  it('should preserve object methods and prototypes', () => {
    class User {
      constructor(
        public name: string,
        public age: number,
      ) {}

      greet() {
        return `Hello, I'm ${this.name}`;
      }

      birthday() {
        this.age += 1;
      }
    }

    let user = new User('Alice', 30);
    const m = Ptr({
      get: () => user,
      set: (newValue) => {
        user = newValue;
      },
    });

    // Methods should work
    expect(m.greet()).toBe("Hello, I'm Alice");

    // Method that modifies state should work
    m.birthday();
    expect(user.age).toBe(31);

    // Replace with new instance
    m[Ptr.ptr] = new User('Bob', 25);
    expect(user.name).toBe('Bob');
    expect(user.age).toBe(25);
    expect(user.greet()).toBe("Hello, I'm Bob");
  });

  it('should handle Set operations correctly', () => {
    let set = new Set([1, 2, 3]);
    const m = Ptr({
      get: () => set,
      set: (newValue) => {
        set = newValue;
      },
    });

    m.add(4);
    expect([...set]).toEqual([1, 2, 3, 4]);

    m.delete(2);
    expect([...set]).toEqual([1, 3, 4]);

    m.clear();
    expect([...set]).toEqual([]);

    // Replace using ptr
    m[Ptr.ptr] = new Set([5, 6]);
    expect([...set]).toEqual([5, 6]);
  });

  it('should handle Map operations correctly', () => {
    let map = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    const m = Ptr({
      get: () => map,
      set: (newValue) => {
        map = newValue;
      },
    });

    m.set('c', 3);
    expect([...map.entries()]).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);

    m.delete('b');
    expect([...map.entries()]).toEqual([
      ['a', 1],
      ['c', 3],
    ]);

    m.clear();
    expect([...map.entries()]).toEqual([]);

    // Replace using ptr
    m[Ptr.ptr] = new Map([['x', 10]]);
    expect([...map.entries()]).toEqual([['x', 10]]);
  });

  it('should handle Date operations correctly', () => {
    let date = new Date('2024-01-01');
    const m = Ptr({
      get: () => date,
      set: (newValue) => {
        date = newValue;
      },
    });

    m.setFullYear(2025);
    expect(date.getFullYear()).toBe(2025);

    m.setMonth(6);
    expect(date.getMonth()).toBe(6);

    // Replace using ptr
    m[Ptr.ptr] = new Date('2023-12-31');
    expect(date.toISOString()).toBe('2023-12-31T00:00:00.000Z');
  });

  it('should handle custom class with mutable methods', () => {
    class Counter {
      private numbers: number[] = [];

      // Mutable method: directly modifies the object's internal state
      add(n: number) {
        this.numbers.push(n);
        return this.sum();
      }

      remove(n: number) {
        const index = this.numbers.indexOf(n);
        if (index !== -1) {
          this.numbers.splice(index, 1);
        }
      }

      clear() {
        this.numbers = [];
      }

      // Immutable method: does not modify the object's state, only returns a new value
      sum() {
        return this.numbers.reduce((a, b) => a + b, 0);
      }

      // Immutable method: returns a new array
      getNumbers() {
        return [...this.numbers];
      }
    }

    let counter = new Counter();
    const m = Ptr({
      get: () => counter,
      set: (newValue) => {
        counter = newValue;
      },
    });

    // Test mutable methods
    m.add(5);
    expect(counter.getNumbers()).toEqual([5]);

    m.add(3);
    expect(counter.getNumbers()).toEqual([5, 3]);

    m.remove(5);
    expect(counter.getNumbers()).toEqual([3]);

    m.clear();
    expect(counter.getNumbers()).toEqual([]);

    // Test immutable methods
    m.add(2);
    m.add(4);
    expect(m.sum()).toBe(6);

    // The returned array is a copy, modifying it does not affect the original object
    const numbers = m.getNumbers();
    numbers.push(6);
    expect(m.getNumbers()).toEqual([2, 4]);

    // Replace the entire counter object using ptr
    const newCounter = new Counter();
    newCounter.add(10);
    m[Ptr.ptr] = newCounter;
    expect(counter.getNumbers()).toEqual([10]);
  });
});
