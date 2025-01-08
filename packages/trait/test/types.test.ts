import { Type } from '@rustable/utils';
import { hasTrait, implTrait, trait, useTrait } from '../src/trait';

describe('Trait Type System', () => {
  // Base container for all tests
  class Container<T> {
    constructor(protected value: T) {}
    protected getValue(): T {
      return this.value;
    }
  }

  describe('Single Generic Parameter', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Printable<T> {
      print(): string;
      format(prefix: string): string;
      transform<U>(value: U): string;
    }

    @trait
    class Print<T> implements Printable<T> {
      print(): string {
        return 'default print';
      }

      format(prefix: string): string {
        return `${prefix}: ${this.print()}`;
      }

      transform<U>(value: U): string {
        return `transformed: ${String(value)}`;
      }
    }

    interface NumberContainer extends Printable<number> {}
    class NumberContainer extends Container<number> {}

    interface StringContainer extends Printable<string> {}
    class StringContainer extends Container<string> {}

    implTrait(NumberContainer, Print, {
      print(this: NumberContainer) {
        return `Number: ${this.getValue()}`;
      },
      transform<U>(this: NumberContainer, value: U): string {
        return `Number(${this.getValue()}) transformed ${String(value)}`;
      },
    });

    implTrait(StringContainer, Print, {
      print(this: StringContainer) {
        return `String: ${this.getValue()}`;
      },
      transform<U>(this: StringContainer, value: U): string {
        return `String(${this.getValue()}) transformed ${String(value)}`;
      },
    });

    test('should handle single generic parameter', () => {
      const numContainer = new NumberContainer(42);
      const strContainer = new StringContainer('hello');

      expect(hasTrait(numContainer, Print)).toBe(true);
      expect(hasTrait(strContainer, Print)).toBe(true);

      expect(numContainer.print()).toBe('Number: 42');
      expect(numContainer.format('Test')).toBe('Test: Number: 42');
      expect(numContainer.transform('hello')).toBe('Number(42) transformed hello');

      expect(strContainer.print()).toBe('String: hello');
      expect(strContainer.format('Test')).toBe('Test: String: hello');
      expect(strContainer.transform(42)).toBe('String(hello) transformed 42');
    });
  });

  describe('Multiple Generic Parameters', () => {
    interface Format<T, U> {
      format(value: T, style: U): string;
    }

    interface MultiDisplay<T, U, V> {
      display(value: T, format: U, extra: V): string;
    }

    @trait
    class FormatTrait<T, U> implements Format<T, U> {
      format(value: T, style: U): string {
        return `${String(style)}: ${String(value)}`;
      }
    }

    @trait
    class MultiDisplayTrait<T, U, V> implements MultiDisplay<T, U, V> {
      display(value: T, format: U, extra: V): string {
        return `${String(format)}[${String(extra)}]: ${String(value)}`;
      }
    }

    class Point {
      constructor(
        public x: number,
        public y: number,
      ) {}
    }

    implTrait(Point, FormatTrait, [Number, String], {
      format(this: Point, value: number, style: string): string {
        return `${style}: (${this.x}, ${this.y}) -> ${value}`;
      },
    });

    implTrait(Point, MultiDisplayTrait, [Number, String, Boolean], {
      display(this: Point, value: number, format: string, extra: boolean): string {
        const coords = `(${this.x}, ${this.y})`;
        return extra ? `${format}: ${coords} -> ${value}` : coords;
      },
    });
    test('should handle two generic parameters', () => {
      const point = new Point(1, 2);
      expect(hasTrait(point, FormatTrait, [Number, String])).toBe(true);
      expect(hasTrait(point, FormatTrait, [String, Number])).toBe(false);

      const format = useTrait(point, FormatTrait, [Number, String]);
      expect(format?.format(42, 'Point')).toBe('Point: (1, 2) -> 42');
    });

    test('should handle three generic parameters', () => {
      const point = new Point(3, 4);
      expect(hasTrait(point, MultiDisplayTrait, [Number, String, Boolean])).toBe(true);
      expect(hasTrait(point, MultiDisplayTrait, [String, Number, Boolean])).toBe(false);

      const display = useTrait(point, MultiDisplayTrait, [Number, String, Boolean]);
      expect(display?.display(42, 'Point', true)).toBe('Point: (3, 4) -> 42');
      expect(display?.display(42, 'Point', false)).toBe('(3, 4)');
    });
  });

  describe('Generic Method Constraints', () => {
    interface Transformable<T> {
      transform<U extends number | string>(value: U): T;
      convertTo<U>(converter: (value: T) => U): U;
    }

    @trait
    class Transform<T> implements Transformable<T> {
      transform<U extends number | string>(_value: U): T {
        throw new Error('Not implemented');
      }

      convertTo<U>(_converter: (value: T) => U): U {
        throw new Error('Not implemented');
      }

      static version(): string {
        return '1.0.0';
      }
    }

    class TypeContainer<T> extends Container<T> {}

    const StringTypeContainer = Type(TypeContainer, [String]);

    implTrait(TypeContainer<string>, Transform, [String], {
      transform<U extends number | string>(this: TypeContainer<string>, value: U): string {
        return `${this.getValue()}_${String(value)}`;
      },
      convertTo<U>(this: TypeContainer<string>, converter: (value: string) => U): U {
        return converter(this.getValue());
      },
    });

    test('should handle generic method constraints', () => {
      const container = new TypeContainer('base');
      const trait = useTrait(container, Transform<string>, [String]);

      const stringContainer = new StringTypeContainer('base');
      const stringTrait = useTrait(stringContainer, Transform<string>, [String]);

      expect(trait?.transform(42)).toBe('base_42');
      expect(trait?.transform('test')).toBe('base_test');
      expect(trait?.convertTo((value) => value.length)).toBe(4);
      expect(useTrait(TypeContainer, Transform, [String])?.version()).toBe('1.0.0');

      expect(stringTrait?.transform(42)).toBe('base_42');
      expect(stringTrait?.transform('test')).toBe('base_test');
      expect(stringTrait?.convertTo((value) => value.length)).toBe(4);
      expect(useTrait(StringTypeContainer, Transform, [String])?.version()).toBe('1.0.0');
    });
  });

  describe('Generic Method Constraints2', () => {
    interface Transformable<T> {
      transform<U extends number | string>(value: U): T;
      convertTo<U>(converter: (value: T) => U): U;
    }

    @trait
    class Transform<T> implements Transformable<T> {
      transform<U extends number | string>(_value: U): T {
        throw new Error('Not implemented');
      }

      convertTo<U>(_converter: (value: T) => U): U {
        throw new Error('Not implemented');
      }

      static version(): string {
        return '1.0.0';
      }
    }

    class TypeContainer<T> extends Container<T> {}

    const StringTypeContainer = Type(TypeContainer<string>, [String]);

    interface StringTypeContainer extends TypeContainer<string> {}

    implTrait(StringTypeContainer, Transform, [String], {
      transform<U extends number | string>(this: StringTypeContainer, value: U): string {
        return `${this.getValue()}_${String(value)}`;
      },
      convertTo<U>(this: StringTypeContainer, converter: (value: string) => U): U {
        return converter(this.getValue());
      },
    });

    test('should handle generic method constraints', () => {
      const container = new TypeContainer('base');
      expect(hasTrait(container, Transform<string>, [String])).toBe(false);

      const stringContainer = new StringTypeContainer('base');
      const stringTrait = useTrait(stringContainer, Transform<string>, [String]);

      expect(hasTrait(TypeContainer, Transform, [String])).toBe(false);

      expect(stringTrait?.transform(42)).toBe('base_42');
      expect(stringTrait?.transform('test')).toBe('base_test');
      expect(stringTrait?.convertTo((value) => value.length)).toBe(4);
      expect(useTrait(StringTypeContainer, Transform, [String])?.version()).toBe('1.0.0');
    });
  });

  describe('Default Generic Trait Implementation', () => {
    test('should use default implementation when no implementation is provided', () => {
      @trait
      class TestTrait<T, U> {
        test(t: T, u: U): string {
          return `${t},${u}`;
        }
      }

      class Target {}

      implTrait(Target, TestTrait, [String, Number]);

      const target = new Target();
      const impl = useTrait(target, TestTrait, [String, Number]);
      expect(impl?.test('hello', 42)).toBe('hello,42');
    });

    test('should use single generic type parameter', () => {
      @trait
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestTrait<T> {
        test(): string {
          return 'default';
        }
      }

      class Target {}

      implTrait(Target, TestTrait, [String]);

      const target = new Target();
      const impl = useTrait(target, TestTrait, [String]);
      expect(impl?.test()).toBe('default');
    });
  });

  describe('Trait Implementation Edge Cases', () => {
    test('should throw error for invalid generic parameter', () => {
      class TestClass {}
      @trait
      class TestTrait {}

      expect(() => {
        implTrait(TestClass, TestTrait, {} as any, {});
      }).toThrow('Invalid generic parameter');
    });
  });
});
