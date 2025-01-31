import { Type } from '@rustable/type';
import { Trait } from '../src/trait';

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

    class Print<T> extends Trait implements Printable<T> {
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

    Print.implFor(NumberContainer, {
      print(this: NumberContainer) {
        return `Number: ${this.getValue()}`;
      },
      transform<U>(this: NumberContainer, value: U): string {
        return `Number(${this.getValue()}) transformed ${String(value)}`;
      },
    });

    Print.implFor(StringContainer, {
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

      expect(Print.isImplFor(numContainer)).toBe(true);
      expect(Print.isImplFor(strContainer)).toBe(true);

      expect(Print.wrap(numContainer).print()).toBe('Number: 42');
      expect(Print.wrap(numContainer).format('Test')).toBe('Test: Number: 42');
      expect(Print.wrap(numContainer).transform('hello')).toBe('Number(42) transformed hello');

      expect(Print.wrap(strContainer).print()).toBe('String: hello');
      expect(Print.wrap(strContainer).format('Test')).toBe('Test: String: hello');
      expect(Print.wrap(strContainer).transform(42)).toBe('String(hello) transformed 42');
    });
  });

  describe('Multiple Generic Parameters', () => {
    interface Format<T, U> {
      format(value: T, style: U): string;
    }

    interface MultiDisplay<T, U, V> {
      display(value: T, format: U, extra: V): string;
    }

    class FormatTrait<T, U> extends Trait implements Format<T, U> {
      format(value: T, style: U): string {
        return `${String(style)}: ${String(value)}`;
      }
    }

    class MultiDisplayTrait<T, U, V> extends Trait implements MultiDisplay<T, U, V> {
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

    Type(FormatTrait<number, string>, [Number, String]).implFor(Point, {
      format(this: Point, value: number, style: string): string {
        return `${style}: (${this.x}, ${this.y}) -> ${value}`;
      },
    });

    Type(MultiDisplayTrait<number, string, boolean>, [Number, String, Boolean]).implFor(Point, {
      display(this: Point, value: number, format: string, extra: boolean): string {
        const coords = `(${this.x}, ${this.y})`;
        return extra ? `${format}: ${coords} -> ${value}` : coords;
      },
    });

    test('should handle two generic parameters', () => {
      const point = new Point(1, 2);
      expect(Type(FormatTrait, [Number, String]).isImplFor(point)).toBe(true);
      expect(Type(FormatTrait, [String, Number]).isImplFor(point)).toBe(false);

      const formatTrait = Type(FormatTrait, [Number, String]).wrap(point);
      expect(formatTrait.format(42, 'Point')).toBe('Point: (1, 2) -> 42');
    });

    test('should handle three generic parameters', () => {
      const point = new Point(3, 4);
      expect(Type(MultiDisplayTrait, [Number, String, Boolean]).isImplFor(point)).toBe(true);
      expect(Type(MultiDisplayTrait, [String, Number, Boolean]).isImplFor(point)).toBe(false);

      const displayTrait = Type(MultiDisplayTrait, [Number, String, Boolean]).wrap(point);
      expect(displayTrait.display(42, 'Point', true)).toBe('Point: (3, 4) -> 42');
      expect(displayTrait.display(42, 'Point', false)).toBe('(3, 4)');
    });
  });

  describe('Generic Method Constraints', () => {
    interface Transformable<T> {
      transform<U extends number | string>(value: U): T;
      convertTo<U>(converter: (value: T) => U): U;
    }

    class Transform<T> extends Trait implements Transformable<T> {
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

    Type(Transform, [String]).implFor(StringTypeContainer, {
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
      expect(StringTransform.isImplFor(container)).toBe(false);
      expect(StringTransform.isImplFor(stringContainer)).toBe(true);
      expect(StringTransform.isImplFor(TypeContainer)).toBe(false);

      // Method implementations
      const stringTrait = StringTransform.wrap(stringContainer);
      expect(stringTrait.transform(42)).toBe('base_42');
      expect(stringTrait.transform('test')).toBe('base_test');
      expect(stringTrait.convertTo((value) => value.length)).toBe(4);
      expect(StringTransform.wrap(StringTypeContainer).version()).toBe('1.0.0');
    });
  });

  describe('Default Generic Trait Implementation', () => {
    test('should handle default implementations with single and multiple type parameters', () => {
      class MultiParamTrait<T, U> extends Trait {
        test(t: T, u: U): string {
          return `${t},${u}`;
        }
      }

      class SingleParamTrait<T> extends Trait {
        test(t: T): string {
          return String(t);
        }
      }

      class Target {}

      const StringNumberParam = Type(MultiParamTrait<string, number>, [String, Number]);
      const NumberStringParam = Type(MultiParamTrait<number, string>, [Number, String]);
      // Test multi-parameter implementation
      StringNumberParam.implFor(Target, {
        test(t: string, u: number): string {
          return `string:${t},number:${u}`;
        },
      });
      NumberStringParam.implFor(Target, {
        test(t: number, u: string): string {
          return `number:${t},string:${u}`;
        },
      });
      const multiTarget = new Target();
      const multiImpl1 = StringNumberParam.wrap(multiTarget);
      expect(multiImpl1.test('hello', 42)).toBe('string:hello,number:42');
      const multiImpl2 = NumberStringParam.wrap(multiTarget);
      expect(multiImpl2.test(42, 'hello')).toBe('number:42,string:hello');
      expect(() => MultiParamTrait.wrap(multiTarget).test(42, 'hello')).toThrow();

      // Test single-parameter implementation
      Type(SingleParamTrait, [Number]).implFor(Target);
      const singleImpl = Type(SingleParamTrait, [Number]).wrap(multiTarget);
      expect(singleImpl.test(42)).toBe('42');
    });
  });
});
