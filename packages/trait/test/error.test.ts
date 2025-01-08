import { hasTrait, implTrait, trait, useTrait } from '../src/trait';

describe('Trait Error Cases', () => {
  // Base class for testing
  class BaseClass {
    constructor(protected value: any) {}
    getValue(): any {
      return this.value;
    }
  }

  // Basic trait interface
  interface Printable {
    print(): string;
    format(prefix: string): string;
  }

  // Basic trait implementation
  @trait
  class Print implements Printable {
    print(): string {
      return 'default print';
    }

    format(prefix: string): string {
      return `${prefix}: ${this.print()}`;
    }
  }

  describe('Invalid Trait Definitions', () => {
    it('should throw when implementing non-trait class', () => {
      class NonTrait {
        print(): string {
          return 'not a trait';
        }
      }

      class TestClass {}

      expect(() => {
        implTrait(TestClass, NonTrait as any);
      }).toThrow('Trait must be implemented using the trait function');
    });

    it('should throw when implementing trait twice', () => {
      class DuplicateClass {}

      implTrait(DuplicateClass, Print);
      expect(() => {
        implTrait(DuplicateClass, Print);
      }).toThrow('Trait Print already implemented for DuplicateClass');
    });
  });

  describe('Invalid Implementation Methods', () => {
    it('should throw when implementing non-existent method', () => {
      class TestClass {}

      expect(() => {
        implTrait(TestClass, Print, {
          nonExistent(this: TestClass) {
            return 'invalid';
          },
        } as any);
      }).toThrow('Method nonExistent not defined in trait');
    });
  });

  describe('Inheritance Errors', () => {
    @trait
    class ExtendedPrint extends Print {
      extended(): string {
        return 'extended';
      }
    }

    it('should throw when parent trait not implemented', () => {
      class TestClass {}

      expect(() => {
        implTrait(TestClass, ExtendedPrint);
      }).toThrow('Parent trait Print not implemented for TestClass');
    });

    it('should throw error for non-implemented trait with multiple generics', () => {
      @trait
      class MultiGeneric<T, U> {
        method(t: T, u: U): string {
          return `${String(t)},${String(u)}`;
        }
      }
      class Point {
        constructor(
          public x: number,
          public y: number,
        ) {}
      }

      const point = new Point(1, 2);
      expect(() => useTrait(point, MultiGeneric, [String, Number])).toThrow(
        'Trait MultiGeneric<String,Number> not implemented for Point',
      );
    });

    it('should handle trait inheritance chain', () => {
      @trait
      class BaseA {
        methodA(): string {
          return 'A';
        }
      }

      @trait
      class ExtendedB extends BaseA {
        methodB(): string {
          return 'B';
        }
      }

      @trait
      class ExtendedC extends ExtendedB {
        methodC(): string {
          return 'C';
        }
      }

      class TestClass {}

      // Implement commons in reverse order to test inheritance chain validation
      expect(() => {
        implTrait(TestClass, ExtendedC);
      }).toThrow('Parent trait ExtendedB not implemented for TestClass');

      implTrait(TestClass, BaseA);
      expect(() => {
        implTrait(TestClass, ExtendedC);
      }).toThrow('Parent trait ExtendedB not implemented for TestClass');

      implTrait(TestClass, ExtendedB);
      implTrait(TestClass, ExtendedC);

      const instance = new TestClass();
      expect(hasTrait(instance, BaseA)).toBe(true);
      expect(hasTrait(instance, ExtendedB)).toBe(true);
      expect(hasTrait(instance, ExtendedC)).toBe(true);
    });
  });

  describe('Runtime Errors', () => {
    it('should throw when accessing unimplemented trait method', () => {
      class TestClass extends BaseClass {}
      const instance = new TestClass('test');

      expect(() => {
        (instance as any).print();
      }).toThrow();
    });

    it('should handle errors in trait method implementation', () => {
      interface ErrorClass extends Printable {}
      class ErrorClass extends BaseClass {}

      implTrait(ErrorClass, Print, {
        print(this: ErrorClass) {
          throw new Error('Implementation error');
        },
      });

      const instance = new ErrorClass('test');
      expect(() => {
        instance.print();
      }).toThrow('Implementation error');
    });

    it('should handle undefined trait implementation', () => {
      class TestClass extends BaseClass {}
      const instance = new TestClass('test');

      expect(() => useTrait(instance, Print)).toThrow('Trait Print not implemented for TestClass');
      expect(hasTrait(instance, Print)).toBe(false);
    });
  });

  describe('Proxy Behavior', () => {
    it('should throw when accessing non-string property in trait proxy', () => {
      interface ITestTrait {
        testMethod(): string;
      }

      @trait
      class TestTrait implements ITestTrait {
        testMethod(): string {
          return 'test';
        }
      }

      class TestClass {}
      implTrait(TestClass, TestTrait);

      const instance = new TestClass();
      const traitImpl = useTrait(instance, TestTrait);

      if (traitImpl) {
        // Access trait with symbol key
        const symbol = Symbol('test');
        expect(() => (traitImpl as any)[symbol]).toThrow('Method Symbol(test) not implemented for trait');
      }
    });

    it('should throw when accessing non-existent method in trait proxy', () => {
      interface ITestTrait {
        testMethod(): string;
      }

      @trait
      class TestTrait implements ITestTrait {
        testMethod(): string {
          return 'test';
        }
      }

      class TestClass {}
      implTrait(TestClass, TestTrait);

      const instance = new TestClass();
      const traitImpl = useTrait(instance, TestTrait);

      if (traitImpl) {
        // Access non-existent method
        expect(() => (traitImpl as any).nonExistentMethod).toThrow(
          'Method nonExistentMethod not implemented for trait',
        );
      }
    });
  });

  describe('Type Safety', () => {
    it('should maintain this binding in trait methods', () => {
      interface TypedClass extends Printable {
        specificMethod(): string;
      }
      class TypedClass extends BaseClass {
        specificMethod(): string {
          return 'specific';
        }
      }

      implTrait(TypedClass, Print, {
        print(this: TypedClass) {
          return this.specificMethod();
        },
      });

      const instance = new TypedClass('test');
      expect(instance.print()).toBe('specific');
    });

    it('should preserve method types in implementation', () => {
      interface NumberPrintable {
        print(): number;
      }

      @trait
      class NumberPrint implements NumberPrintable {
        print(): number {
          return 42;
        }
      }

      interface TestClass extends NumberPrintable {}
      class TestClass extends BaseClass {}

      implTrait(TestClass, NumberPrint, {
        print(this: TestClass): number {
          return parseInt(this.getValue());
        },
      });

      const instance = new TestClass('123');
      expect(instance.print()).toBe(123);
    });
  });
});
