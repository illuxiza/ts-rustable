import { Ptr } from '../src/ptr';

describe('Mut', () => {
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

      // 可变方法：直接修改对象内部状态
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

      // 非可变方法：不修改对象状态，只返回新值
      sum() {
        return this.numbers.reduce((a, b) => a + b, 0);
      }

      // 非可变方法：返回新数组
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

    // 测试可变方法
    m.add(5);
    expect(counter.getNumbers()).toEqual([5]);

    m.add(3);
    expect(counter.getNumbers()).toEqual([5, 3]);

    m.remove(5);
    expect(counter.getNumbers()).toEqual([3]);

    m.clear();
    expect(counter.getNumbers()).toEqual([]);

    // 测试非可变方法
    m.add(2);
    m.add(4);
    expect(m.sum()).toBe(6);

    // 获取的数组是副本，修改它不会影响原对象
    const numbers = m.getNumbers();
    numbers.push(6);
    expect(m.getNumbers()).toEqual([2, 4]);

    // 使用 ptr 替换整个对象
    const newCounter = new Counter();
    newCounter.add(10);
    m[Ptr.ptr] = newCounter;
    expect(counter.getNumbers()).toEqual([10]);
  });

  it('should handle Mut.replace function correctly', () => {
    // Test with primitive objects
    let obj = { x: 1, y: 2 };
    const m = Ptr({
      get: () => obj,
      set: (newValue) => {
        obj = newValue;
      },
    });

    // Using Mut.replace
    Ptr.replace(m, { x: 3, y: 4 });
    expect(obj).toEqual({ x: 3, y: 4 });

    // Compare with ptr assignment
    const m2 = Ptr({
      get: () => obj,
      set: (newValue) => {
        obj = newValue;
      },
    });
    m2[Ptr.ptr] = { x: 5, y: 6 };
    expect(obj).toEqual({ x: 5, y: 6 });

    // Test with arrays
    let arr = [1, 2, 3];
    const arrMut = Ptr({
      get: () => arr,
      set: (newValue) => {
        arr = newValue;
      },
    });

    Ptr.replace(arrMut, [4, 5, 6]);
    expect(arr).toEqual([4, 5, 6]);

    // Test with complex objects
    interface ComplexObj {
      id: number;
      data: {
        name: string;
        items: string[];
      };
    }

    let complex: ComplexObj = {
      id: 1,
      data: {
        name: 'test',
        items: ['a', 'b'],
      },
    };

    const complexMut = Ptr({
      get: () => complex,
      set: (newValue) => {
        complex = newValue;
      },
    });

    // Replace with new complex object
    Ptr.replace(complexMut, {
      id: 2,
      data: {
        name: 'new',
        items: ['c', 'd'],
      },
    });

    expect(complex).toEqual({
      id: 2,
      data: {
        name: 'new',
        items: ['c', 'd'],
      },
    });

    // Test with class instances
    class Person {
      constructor(
        public name: string,
        public age: number,
      ) {}

      greet() {
        return `Hello, ${this.name}`;
      }
    }

    let person = new Person('Alice', 30);
    const personMut = Ptr({
      get: () => person,
      set: (newValue) => {
        person = newValue;
      },
    });

    Ptr.replace(personMut, new Person('Bob', 25));
    expect(person.name).toBe('Bob');
    expect(person.age).toBe(25);
    expect(person.greet()).toBe('Hello, Bob');

    // Test with built-in objects
    let date = new Date('2024-01-01');
    const dateMut = Ptr({
      get: () => date,
      set: (newValue) => {
        date = newValue;
      },
    });

    Ptr.replace(dateMut, new Date('2024-12-31'));
    expect(date.toISOString()).toBe('2024-12-31T00:00:00.000Z');

    let set = new Set([1, 2, 3]);
    const setMut = Ptr({
      get: () => set,
      set: (newValue) => {
        set = newValue;
      },
    });

    Ptr.replace(setMut, new Set([4, 5, 6]));
    expect([...set]).toEqual([4, 5, 6]);
  });
});
