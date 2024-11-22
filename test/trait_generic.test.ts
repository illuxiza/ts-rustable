import { hasTrait, implTrait, trait } from '../src/trait';

describe('Generic Trait Tests', () => {
  // Base generic container class
  class Container<T> {
    constructor(protected value: T) {}
    protected getValue(): T {
      return this.value;
    }
  }

  // Generic trait interfaces
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Printable<T> {
    print(): string;
    format(prefix: string): string;
    transform<U>(value: U): string;
  }

  interface Comparable<T> {
    equals(other: T): boolean;
    compare(other: T): number;
  }

  // Generic trait implementations
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

  @trait
  class Compare<T> implements Comparable<T> {
    equals(_other: T): boolean {
      return false;
    }

    compare(_other: T): number {
      return 0;
    }
  }

  describe('Basic Generic Containers', () => {
    interface NumberContainer extends Printable<number> {}
    class NumberContainer extends Container<number> {}

    interface StringContainer extends Printable<string> {}
    class StringContainer extends Container<string> {}

    beforeAll(() => {
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
    });

    it('should handle generic trait implementations', () => {
      const numContainer = new NumberContainer(42);
      const strContainer = new StringContainer('hello');

      // Test trait presence
      expect(hasTrait(numContainer, Print)).toBe(true);
      expect(hasTrait(strContainer, Print)).toBe(true);

      // Test number container
      expect(numContainer.print()).toBe('Number: 42');
      expect(numContainer.format('Test')).toBe('Test: Number: 42');
      expect(numContainer.transform('hello')).toBe('Number(42) transformed hello');

      // Test string container
      expect(strContainer.print()).toBe('String: hello');
      expect(strContainer.format('Test')).toBe('Test: String: hello');
      expect(strContainer.transform(42)).toBe('String(hello) transformed 42');
    });
  });

  describe('Multiple Generic Traits', () => {
    interface ComparableContainer<T> extends Printable<T>, Comparable<ComparableContainer<T>> {}
    class ComparableContainer<T> extends Container<T> {}

    beforeAll(() => {
      implTrait(ComparableContainer, Print, {
        print(this: ComparableContainer<any>) {
          return `Value: ${this.getValue()}`;
        },
      });

      implTrait(ComparableContainer, Compare, {
        equals(this: ComparableContainer<any>, other: ComparableContainer<any>): boolean {
          return this.getValue() === other.getValue();
        },
        compare(this: ComparableContainer<any>, other: ComparableContainer<any>): number {
          const a = this.getValue();
          const b = other.getValue();
          return a < b ? -1 : a > b ? 1 : 0;
        },
      });
    });

    it('should handle multiple generic traits', () => {
      const container1 = new ComparableContainer(42);
      const container2 = new ComparableContainer(24);
      const container3 = new ComparableContainer(42);

      // Test trait presence
      expect(hasTrait(container1, Print)).toBe(true);
      expect(hasTrait(container1, Compare)).toBe(true);

      // Test print functionality
      expect(container1.print()).toBe('Value: 42');
      expect(container2.print()).toBe('Value: 24');

      // Test comparison functionality
      expect(container1.equals(container2)).toBe(false);
      expect(container1.equals(container3)).toBe(true);
      expect(container1.compare(container2)).toBe(1);
      expect(container2.compare(container1)).toBe(-1);
      expect(container1.compare(container3)).toBe(0);
    });
  });

  describe('Error Handling', () => {
    class InvalidContainer<T> extends Container<T> {
      protected override getValue(): T {
        throw new Error('Cannot access value');
      }
    }

    interface InvalidContainer<T> extends Printable<InvalidContainer<T>> {}

    beforeAll(() => {
      implTrait(InvalidContainer, Print, {
        print(this: InvalidContainer<any>) {
          return `Value: ${this.getValue()}`;
        },
      });
    });

    it('should handle errors in trait methods', () => {
      const container = new InvalidContainer(42);
      expect(() => container.print()).toThrow('Cannot access value');
    });
  });
});
