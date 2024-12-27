import { mut, Mut } from '../src/mut';

describe('Mut', () => {
  it('should get and set object properties through getter/setter', () => {
    let obj = { name: 'Alice', age: 30 };
    const m = mut({
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
    const m = mut({
      get: () => obj,
      set: (newValue) => {
        obj = newValue;
      },
    });

    m[Mut.ptr]({ name: 'Charlie', age: 25 });
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
    const m = mut({
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

  it('should throw when accessing properties of non-object values', () => {
    const numberMut = mut({
      get: () => 42 as any,
      set: () => {},
    });
    expect(() => (numberMut.toString = () => {})).toThrow('Mut can only be used with objects');

    const nullMut = mut({
      get: () => null as any,
      set: () => {},
    });
    expect(() => (nullMut.toString = () => {})).toThrow('Mut can only be used with objects');

    const undefinedMut = mut({
      get: () => undefined as any,
      set: () => {},
    });
    expect(() => (undefinedMut.toString = () => {})).toThrow('Mut can only be used with objects');
  });
});
