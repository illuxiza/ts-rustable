import { from, implFrom } from '../../src/traits/from';

// Example classes for testing
class Target {
  constructor(public value: string) {}
}

class Source {
  constructor(public value: number) {}
}

class NoImpl {}

// Temperature classes for testing conversions
class Temperature {
  constructor(public value: number) {}
}

class Celsius extends Temperature {}
class Fahrenheit extends Temperature {}
class Kelvin extends Temperature {}

describe('Type Conversion System', () => {
  beforeAll(() => {
    // Basic type conversions
    implFrom(Number, String, {
      from(value: string): number {
        return Number(value);
      },
    });

    implFrom(String, Number, {
      from(value: number): string {
        return value.toString();
      },
    });

    implFrom(Boolean, String, {
      from(value: string): boolean {
        return value === 'true';
      },
    });

    implFrom(String, Boolean, {
      from(value: boolean): string {
        return value.toString();
      },
    });

    implFrom(Boolean, Number, {
      from(value: number): boolean {
        return value !== 0;
      },
    });

    implFrom(Number, Boolean, {
      from(value: boolean): number {
        return value ? 1 : 0;
      },
    });

    // Custom type conversions
    implFrom(Target, Source, {
      from(source: Source): Target {
        return new Target(source.value.toString());
      },
    });

    implFrom(Source, Target, {
      from(target: Target): Source {
        return new Source(parseInt(target.value));
      },
    });

    // Temperature conversions
    implFrom(Fahrenheit, Celsius, {
      from(celsius: Celsius): Fahrenheit {
        return new Fahrenheit((celsius.value * 9) / 5 + 32);
      },
    });

    implFrom(Kelvin, Celsius, {
      from(celsius: Celsius): Kelvin {
        return new Kelvin(celsius.value + 273.15);
      },
    });

    implFrom(Temperature, Celsius, {
      from(celsius: Celsius): Temperature {
        return new Temperature(celsius.value);
      },
    });

    implFrom(Temperature, Kelvin, {
      from(kelvin: Kelvin): Temperature {
        return new Temperature(kelvin.value - 273.15);
      },
    });

    implFrom(Temperature, Fahrenheit, {
      from(fahrenheit: Fahrenheit): Temperature {
        return new Temperature(((fahrenheit.value - 32) * 5) / 9);
      },
    });
  });

  describe('Basic Type Conversions', () => {
    test('should convert between primitive types using from/into', () => {
      // String <-> Number
      expect(from('42', Number)).toBe(42);
      expect('42'.into(Number)).toBe(42);
      expect(from(42, String)).toBe('42');
      expect((42).into(String)).toBe('42');

      // String <-> Boolean
      expect(from('true', Boolean)).toBe(true);
      expect('true'.into(Boolean)).toBe(true);
      expect(from(true, String)).toBe('true');
      expect(true.into(String)).toBe('true');

      // Number <-> Boolean
      expect(from(1, Boolean)).toBe(true);
      expect(from(0, Boolean)).toBe(false);
      expect((1).into(Boolean)).toBe(true);
      expect((0).into(Boolean)).toBe(false);
    });

    test('should convert between custom types using from/into', () => {
      const source = new Source(42);
      const target = new Target('42');

      const convertedTarget = from(source, Target);
      const convertedSource = target.into(Source);

      expect(convertedTarget.value).toBe('42');
      expect(convertedSource.value).toBe(42);
    });

    test('should throw error for non-implemented conversions', () => {
      const noImpl = new NoImpl();
      expect(() => from(noImpl, Target)).toThrow(/not implemented/);
      expect(() => noImpl.into(Target)).toThrow(/into is not a function/);
    });
  });

  describe('Temperature Conversions', () => {
    test('should convert between temperature scales using from/into', () => {
      // Celsius -> Others
      const celsius = new Celsius(0);
      expect(celsius.into(Fahrenheit).value).toBe(32);
      expect(celsius.into(Kelvin).value).toBe(273.15);
      expect(celsius.into(Temperature).value).toBe(0);

      // Kelvin -> Temperature
      const kelvin = new Kelvin(273.15);
      expect(kelvin.into(Temperature).value).toBe(0);

      // Verify precision
      const celsius100 = new Celsius(100);
      expect(celsius100.into(Fahrenheit).value).toBe(212);
      expect(celsius100.into(Kelvin).value).toBe(373.15);
    });

    test('should handle chained conversions', () => {
      const celsius = new Celsius(0);

      // Convert through multiple types
      const result = celsius.into(Fahrenheit).into(Temperature);

      expect(result.value).toBe(0);
    });
  });
  describe('implFrom Overloads', () => {
    test('basic implementation without generics', () => {
      class Target {
        constructor(public value: string) {}
      }

      implFrom(Target, Source, {
        from(source: Source): Target {
          return new Target(source.value.toString());
        },
      });
      const source = new Source(42);
      expect(from(source, Target).value).toBe('42');
    });

    test('implementation with single generic', () => {
      class Generic {}
      implFrom(Target, Source, [Generic], {
        from(source: Source): Target {
          return new Target(source.value.toString());
        },
      });
      const source = new Source(42);
      expect(from(source, Target).value).toBe('42');
    });

    test('implementation with multiple generics', () => {
      class Generic1 {}
      class Generic2 {}
      implFrom(Target, Source, [Generic1, Generic2], {
        from(source: Source): Target {
          return new Target(source.value.toString());
        },
      });
      const source = new Source(42);
      expect(from(source, Target).value).toBe('42');
    });
  });
  describe('Edge Cases', () => {
    test('implementation as third parameter', () => {
      class Target {
        constructor(public value: string) {}
      }

      implFrom(Target, Source, {
        from(source: Source): Target {
          return new Target(source.value.toString());
        },
      });
      const source = new Source(42);
      expect(from(source, Target).value).toBe('42');
    });

    test('empty generic array', () => {
      expect(() => {
        implFrom(Target, Source, [], {
          from(source: Source): Target {
            return new Target(source.value.toString());
          },
        });
      }).toThrow('At least one generic type of array parameter is required');
    });
  });
  describe('Complex Generic Scenarios', () => {
    test('nested generic types', () => {
      class Container<T> {
        constructor(public value: T) {}
      }

      implFrom(Container, Source, {
        from(source: Source): Container<number> {
          return new Container(source.value);
        },
      });

      const source = new Source(42);
      const result = from(source, Container);
      expect(result.value).toBe(42);
    });
  });
  describe('From Function Edge Cases', () => {
    test('should handle null and undefined values', () => {
      expect(() => from(null, String)).toThrow('Cannot convert null');
      expect(() => from(undefined, String)).toThrow('Cannot convert undefined');
    });

    test('should handle non-constructable targets', () => {
      const nonConstructable = {};
      expect(() => from('test', nonConstructable as any)).toThrow('Invalid target type');
    });

    test('should handle circular references', () => {
      class CircularA {
        b?: CircularB;
      }
      class CircularB {
        a?: CircularA;
      }

      const a = new CircularA();
      const b = new CircularB();
      a.b = b;
      b.a = a;

      expect(() => from(a, CircularB)).toThrow(/not implemented/);
    });

    test('should handle primitive wrappers', () => {
      const numObj = new Number(42);
      const strObj = new String('42');
      const boolObj = new Boolean(true);

      expect(from(numObj, String)).toBe('42');
      expect(from(strObj, Number)).toBe(42);
      expect(from(boolObj, Number)).toBe(1);
    });

    test('should handle array-like objects', () => {
      const arrayLike = { 0: 'a', 1: 'b', length: 2 };
      expect(() => from(arrayLike, Array)).toThrow(/not implemented/);
    });

    test('should handle empty objects', () => {
      expect(() => from({}, String)).toThrow(/not implemented/);
    });

    test('should handle prototype chain', () => {
      class Parent {}
      class Child extends Parent {}
      const child = new Child();

      expect(() => from(child, Parent)).toThrow(/not implemented/);
      expect(() => from(child, Object)).toThrow(/not implemented/);
    });

    test('should handle non-object source with object target', () => {
      class Target {
        constructor(public value: string) {}
      }

      expect(() => from(42, Target)).toThrow(/not implemented/);
    });

    test('should handle object source with non-object target', () => {
      class Source {
        constructor(public value: number) {}
      }

      expect(() => from(new Source(42), Number)).toThrow(/not implemented/);
    });
  });
  describe('implFrom Error Cases', () => {
    test('should throw error for invalid generic parameter', () => {
      class Source {
        constructor(public value: number) {}
      }
      class Target {
        constructor(public value: string) {}
      }

      expect(() => {
        implFrom(Target, Source, {} as any, {
          from(source: Source): Target {
            return new Target(source.value.toString());
          },
        });
      }).toThrow('Invalid generic parameter');
    });

    test('should throw error for invalid implementation', () => {
      class Source {
        constructor(public value: number) {}
      }
      class Target {
        constructor(public value: string) {}
      }

      expect(() => {
        implFrom(Target, Source, undefined as any);
      }).toThrow('Invalid implementation');
    });
  });
});
