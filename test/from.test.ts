import { implTrait } from '../src/trait';
import { From, from } from '../src/from';

describe('From Trait', () => {
  it('should convert string to number', () => {
    class NumberWrapper {
      value: number;

      constructor() {
        this.value = 0;
      }
    }

    implTrait(NumberWrapper, From<string>, {
      from(value: string): NumberWrapper {
        const instance = new NumberWrapper();
        instance.value = parseInt(value, 10);
        return instance;
      },
    });

    const result = from('42', NumberWrapper);
    expect(result.value).toBe(42);
  });

  it('should convert array to custom collection', () => {
    class Collection<T> {
      items: T[];

      constructor() {
        this.items = [];
      }
    }

    implTrait(Collection, From<number[]>, {
      from(value: number[]): Collection<number> {
        const instance = new Collection<number>();
        instance.items = [...value];
        return instance;
      },
    });

    const result = from([1, 2, 3], Collection);
    expect(result.items).toEqual([1, 2, 3]);
  });

  it('should throw error when from is not implemented', () => {
    class UnimplementedClass {}

    expect(() => from('test', UnimplementedClass)).toThrow('Trait From<string> not implemented for UnimplementedClass');
  });

  it('should handle complex object conversion', () => {
    interface Person {
      name: string;
      age: number;
    }

    class PersonRecord {
      fullName: string;
      yearOfBirth: number;

      constructor() {
        this.fullName = '';
        this.yearOfBirth = 0;
      }
    }

    implTrait(PersonRecord, From<Person>, {
      from(person: Person): PersonRecord {
        const instance = new PersonRecord();
        instance.fullName = person.name;
        instance.yearOfBirth = new Date().getFullYear() - person.age;
        return instance;
      },
    });

    const person: Person = { name: 'John Doe', age: 30 };
    const record = from(person, PersonRecord);

    expect(record.fullName).toBe('John Doe');
    expect(record.yearOfBirth).toBe(new Date().getFullYear() - 30);
  });
});
