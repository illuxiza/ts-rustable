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

    implTrait(Point, Type(FormatTrait, [Number, String]), {
      format(this: Point, value: number, style: string): string {
        return `${style}: (${this.x}, ${this.y}) -> ${value}`;
      },
    });

    implTrait(Point, Type(MultiDisplayTrait, [Number, String, Boolean]), {
      display(this: Point, value: number, format: string, extra: boolean): string {
        const coords = `(${this.x}, ${this.y})`;
        return extra ? `${format}: ${coords} -> ${value}` : coords;
      },
    });
    test('should handle two generic parameters', () => {
      const point = new Point(1, 2);
      expect(hasTrait(point, Type(FormatTrait, [Number, String]))).toBe(true);
      expect(hasTrait(point, Type(FormatTrait, [String, Number]))).toBe(false);

      const format = useTrait(point, Type(FormatTrait, [Number, String]));
      expect(format?.format(42, 'Point')).toBe('Point: (1, 2) -> 42');
    });

    test('should handle three generic parameters', () => {
      const point = new Point(3, 4);
      expect(hasTrait(point, Type(MultiDisplayTrait, [Number, String, Boolean]))).toBe(true);
      expect(hasTrait(point, Type(MultiDisplayTrait, [String, Number, Boolean]))).toBe(false);

      const display = useTrait(point, Type(MultiDisplayTrait, [Number, String, Boolean]));
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
    const StringTypeContainer = Type(TypeContainer<string>, [String]);
    interface StringTypeContainer extends TypeContainer<string> {}

    implTrait(StringTypeContainer, Type(Transform, [String]), {
      transform<U extends number | string>(this: StringTypeContainer, value: U): string {
        return `${this.getValue()}_${String(value)}`;
      },
      convertTo<U>(this: StringTypeContainer, converter: (value: string) => U): U {
        return converter(this.getValue());
      },
    });

    test('should handle generic method constraints with proper type checking', () => {
      const container = new TypeContainer('base');
      const stringContainer = new StringTypeContainer('base');
      const StringTransform = Type(Transform<string>, [String]);

      // Type checking
      expect(hasTrait(container, StringTransform)).toBe(false);
      expect(hasTrait(stringContainer, StringTransform)).toBe(true);
      expect(hasTrait(TypeContainer, StringTransform)).toBe(false);

      // Method implementations
      const stringTrait = useTrait(stringContainer, StringTransform);
      expect(stringTrait?.transform(42)).toBe('base_42');
      expect(stringTrait?.transform('test')).toBe('base_test');
      expect(stringTrait?.convertTo((value) => value.length)).toBe(4);
      expect(useTrait(StringTypeContainer, StringTransform)?.version()).toBe('1.0.0');
    });
  });

  describe('Default Generic Trait Implementation', () => {
    test('should handle default implementations with single and multiple type parameters', () => {
      @trait
      class MultiParamTrait<T, U> {
        test(t: T, u: U): string {
          return `${t},${u}`;
        }
      }

      @trait      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class SingleParamTrait<T> {
        test(): string {
          return 'default';
        }
      }

      class Target {}

      // Test multi-parameter implementation
      implTrait(Target, Type(MultiParamTrait, [String, Number]));
      const multiTarget = new Target();
      const multiImpl = useTrait(multiTarget, Type(MultiParamTrait, [String, Number]));
      expect(multiImpl?.test('hello', 42)).toBe('hello,42');

      // Test single-parameter implementation
      implTrait(Target, Type(SingleParamTrait, [String]));
      const singleTarget = new Target();
      const singleImpl = useTrait(singleTarget, Type(SingleParamTrait, [String]));
      expect(singleImpl?.test()).toBe('default');
    });
  });
});
