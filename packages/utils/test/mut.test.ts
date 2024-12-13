import { Mut } from '../src/mut';

// Test cases for Ptr class
describe('MutValue', () => {
  it('should get and set values correctly', () => {
    let value = 0;
    const ptr = new Mut(
      () => value,
      (v) => {
        value = v;
      },
    );

    expect(ptr.value).toBe(0);

    ptr.value = 42;
    expect(ptr.value).toBe(42);
    expect(value).toBe(42);
  });

  it('should work with objects', () => {
    let obj = { name: 'Alice' };
    const ptr = new Mut(
      () => obj,
      (v) => {
        obj = v;
      },
    );

    expect(ptr.value).toEqual({ name: 'Alice' });

    ptr.value = { name: 'Bob' };
    expect(ptr.value).toEqual({ name: 'Bob' });
    expect(obj).toEqual({ name: 'Bob' });
  });

  it('should handle undefined values', () => {
    let value: number | undefined;
    const ptr = new Mut(
      () => value,
      (v) => {
        value = v;
      },
    );

    expect(ptr.value).toBeUndefined();

    ptr.value = 100;
    expect(ptr.value).toBe(100);

    ptr.value = undefined;
    expect(ptr.value).toBeUndefined();
  });

  it('should handle complex nested objects', () => {
    let complexObj = {
      id: 1,
      info: {
        name: 'Alice',
        age: 30,
        hobbies: ['reading', 'coding'],
      },
      scores: [85, 92, 78],
    };
    const ptr = new Mut(
      () => complexObj.info,
      (v) => {
        complexObj.info = v;
      },
    );

    expect(ptr.value).toEqual(complexObj.info);

    ptr.value.age = 31;
    expect(complexObj.info.age).toBe(31);

    ptr.value = { ...ptr.value, name: 'Alicia' };
    expect(complexObj).toEqual({
      id: 1,
      info: {
        name: 'Alicia',
        age: 31,
        hobbies: ['reading', 'coding'],
      },
      scores: [85, 92, 78],
    });
  });
});
