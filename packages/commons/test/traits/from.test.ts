import { Type } from '../../../utils';
import { from, From, Into } from '../../src/traits/from';

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
    From(String).implInto(Number, {
      from(value) {
        return Number(value);
      },
    });

    From(Number).implInto(String, {
      from(value: Number): string {
        return value.toString();
      },
    });

    From(String).implInto(Boolean, {
      from(value: String): boolean {
        return value === 'true';
      },
    });

    From(Boolean).implInto(String, {
      from(value: Boolean): string {
        return value.toString();
      },
    });

    From(Number).implInto(Boolean, {
      from(value: Number): boolean {
        return value !== 0;
      },
    });

    From(Boolean).implInto(Number, {
      from(value: Boolean): number {
        return value ? 1 : 0;
      },
    });

    // Custom type conversions
    From(Source).implInto(Target, {
      from(source: Source): Target {
        return new Target(source.value.toString());
      },
    });

    From(Target).implInto(Source, {
      from(target: Target): Source {
        return new Source(parseInt(target.value));
      },
    });

    // Temperature conversions
    From(Celsius).implInto(Fahrenheit, {
      from(celsius: Celsius): Fahrenheit {
        return new Fahrenheit((celsius.value * 9) / 5 + 32);
      },
    });

    From(Celsius).implInto(Kelvin, {
      from(celsius: Celsius): Kelvin {
        return new Kelvin(celsius.value + 273.15);
      },
    });

    From(Celsius).implInto(Temperature, {
      from(celsius: Celsius): Temperature {
        return new Temperature(celsius.value);
      },
    });

    From(Kelvin).implInto(Temperature, {
      from(kelvin: Kelvin): Temperature {
        return new Temperature(kelvin.value - 273.15);
      },
    });

    From(Fahrenheit).implInto(Temperature, {
      from(fahrenheit: Fahrenheit): Temperature {
        return new Temperature(((fahrenheit.value - 32) * 5) / 9);
      },
    });
  });

  describe('Basic Type Conversions', () => {
    test('should convert between primitive types using from/into', () => {
      // String <-> Number
      expect(from('42', Number)).toBe(42);
      expect(Into(Number).wrap('42').into()).toBe(42);
      expect(from(42, String)).toBe('42');
      expect(Into(String).wrap(42).into()).toBe('42');

      // String <-> Boolean
      expect(from('true', Boolean)).toBe(true);
      expect(Into(Boolean).wrap('true').into()).toBe(true);
      expect(from(true, String)).toBe('true');
      expect(Into(String).wrap(true).into()).toBe('true');

      // Number <-> Boolean
      expect(from(1, Boolean)).toBe(true);
      expect(from(0, Boolean)).toBe(false);
      expect(Into(Boolean).wrap(1).into()).toBe(true);
      expect(Into(Boolean).wrap(0).into()).toBe(false);
    });

    test('should convert between custom types using from/into', () => {
      const source = new Source(42);
      const target = new Target('42');

      const convertedTarget = from(source, Target);
      const convertedSource = Into(Source).wrap(target).into();

      expect(convertedTarget.value).toBe('42');
      expect(convertedSource.value).toBe(42);
    });

    test('should throw error for non-implemented conversions', () => {
      const noImpl = new NoImpl();
      expect(() => from(noImpl, Target)).toThrow(/not implemented/);
      expect(() => (noImpl as any).into()).toThrow(/into is not a function/);
    });
  });

  describe('Temperature Conversions', () => {
    test('should convert between temperature scales using from/into', () => {
      // Celsius -> Others
      const celsius = new Celsius(0);
      expect(Into(Fahrenheit).wrap(celsius).into().value).toBe(32);
      expect(Into(Kelvin).wrap(celsius).into().value).toBe(273.15);
      expect(Into(Temperature).wrap(celsius).into().value).toBe(0);

      // Kelvin -> Temperature
      const kelvin = new Kelvin(273.15);
      expect(Into(Temperature).wrap(kelvin).into().value).toBe(0);

      // Verify precision
      const celsius100 = new Celsius(100);
      expect(Into(Fahrenheit).wrap(celsius100).into().value).toBe(212);
      expect(Into(Kelvin).wrap(celsius100).into().value).toBe(373.15);
    });

    test('should handle chained conversions', () => {
      const celsius = new Celsius(0);

      // Convert through multiple types
      const result = Into(Temperature).wrap(Into(Fahrenheit).wrap(celsius).into()).into();

      expect(result.value).toBe(0);
    });
  });
  describe('implFrom Overloads', () => {
    test('basic implementation without generics', () => {
      class Target {
        constructor(public value: string) {}
      }

      From(Source).implInto(Target, {
        from(source: Source): Target {
          return new Target(source.value.toString());
        },
      });
      const source = new Source(42);
      expect(from(source, Target).value).toBe('42');
    });

    test('implementation with single generic', () => {
      class Generic {}
      From(Type(Source, [Generic])).implInto(Target, {
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
      From(Type(Source, [Generic1, Generic2])).implInto(Target, {
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

      From(Source).implInto(Target, {
        from(source: Source): Target {
          return new Target(source.value.toString());
        },
      });
      const source = new Source(42);
      expect(from(source, Target).value).toBe('42');
    });
  });
  describe('Complex Generic Scenarios', () => {
    test('nested generic types', () => {
      class Container<T> {
        constructor(public value: T) {}
      }

      From(Source).implInto(Container, {
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
});
