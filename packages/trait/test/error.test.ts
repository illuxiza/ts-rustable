import { Type } from '@rustable/utils';
import { Trait } from '../src/trait';

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

  class Print extends Trait implements Printable {
    print(): string {
      return 'default print';
    }

    format(prefix: string): string {
      return `${prefix}: ${this.print()}`;
    }
  }

  describe('Invalid Trait Definitions', () => {
    it('should throw when implementing trait twice', () => {
      class DuplicateClass {}

      Print.implFor(DuplicateClass);
      expect(() => {
        Print.implFor(DuplicateClass);
      }).toThrow('Trait Print already implemented for DuplicateClass');
    });
  });

  describe('Invalid Implementation Methods', () => {
    it('should throw when implementing non-existent method', () => {
      class TestClass {}

      expect(() => {
        Print.implFor(TestClass, {
          nonExistent(this: TestClass) {
            return 'invalid';
          },
        } as any);
      }).toThrow('Method nonExistent not defined in trait');
    });
  });

  describe('Inheritance Errors', () => {
    class ExtendedPrint extends Print {
      extended(): string {
        return 'extended';
      }
    }

    it('should throw when parent trait not implemented', () => {
      class TestClass {}

      expect(() => {
        ExtendedPrint.implFor(TestClass);
      }).toThrow('Trait Print not implemented for TestClass');
    });

    it('should throw error for non-implemented trait with multiple generics', () => {
      class MultiGeneric<T, U> extends Trait {
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
      expect(() => Type(MultiGeneric, [String, Number]).wrap(point)).toThrow(
        'Trait MultiGeneric<String,Number> not implemented for Point',
      );
    });

    it('should handle trait inheritance chain', () => {
      class BaseA extends Trait {
        methodA(): string {
          return 'A';
        }
      }

      class ExtendedB extends BaseA {
        methodB(): string {
          return 'B';
        }
      }

      class ExtendedC extends ExtendedB {
        methodC(): string {
          return 'C';
        }
      }

      class TestClass {}

      // Implement commons in reverse order to test inheritance chain validation
      expect(() => {
        ExtendedC.implFor(TestClass);
      }).toThrow('Trait ExtendedB not implemented for TestClass');

      BaseA.implFor(TestClass);
      expect(() => {
        ExtendedC.implFor(TestClass);
      }).toThrow('Trait ExtendedB not implemented for TestClass');

      ExtendedB.implFor(TestClass);
      ExtendedC.implFor(TestClass);

      const instance = new TestClass();
      expect(BaseA.wrap(instance).methodA()).toBe('A');
      expect(ExtendedB.wrap(instance).methodB()).toBe('B');
      expect(ExtendedC.wrap(instance).methodC()).toBe('C');
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

      Print.implFor(ErrorClass, {
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

      expect(() => Print.wrap(instance)).toThrow('Trait Print not implemented for TestClass');
      expect(Print.isImplFor(instance)).toBe(false);
    });
  });

  describe('Proxy Behavior', () => {
    it('should throw when accessing non-string property in trait proxy', () => {
      interface ITestTrait {
        testMethod(): string;
      }

      class TestTrait extends Trait implements ITestTrait {
        testMethod(): string {
          return 'test';
        }
      }

      class TestClass {}
      TestTrait.implFor(TestClass);

      const instance = new TestClass();
      const traitImpl = TestTrait.wrap(instance);

      const sym = Symbol('test');
      expect(() => (traitImpl as any)[sym]).toThrow();
    });

    it('should throw when accessing non-existent method in trait proxy', () => {
      interface ITestTrait {
        testMethod(): string;
      }

      class TestTrait extends Trait implements ITestTrait {
        testMethod(): string {
          return 'test';
        }
      }

      class TestClass {}
      TestTrait.implFor(TestClass);

      const instance = new TestClass();
      const traitImpl = TestTrait.wrap(instance);

      if (traitImpl) {
        // Access non-existent method
        expect(() => (traitImpl as any).nonExistentMethod).toThrow(
          'Method nonExistentMethod not defined in trait TestTrait',
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

      Print.implFor(TypedClass, {
        print(this: TypedClass) {
          return this.specificMethod();
        },
      });

      const instance = new TypedClass('test');
      expect(Print.wrap(instance).print()).toBe('specific');
    });

    it('should preserve method types in implementation', () => {
      interface NumberPrintable {
        print(): number;
      }

      class NumberPrint extends Trait implements NumberPrintable {
        print(): number {
          return 42;
        }
      }

      interface TestClass extends NumberPrintable {}
      class TestClass extends BaseClass {}

      NumberPrint.implFor(TestClass, {
        print(this: TestClass): number {
          return parseInt(this.getValue());
        },
      });

      const instance = new TestClass('123');
      expect(NumberPrint.wrap(instance).print()).toBe(123);
    });
  });
});
