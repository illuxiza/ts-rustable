import { derive } from '@rustable/type';
import { macroTrait, Trait } from '../src/trait';

// Basic trait interfaces
interface BasicClass {
  print(): string;
  debug(): string;
  format(prefix: string): string;
}

// Basic trait implementations
class PrintTrait extends Trait {
  print(): string {
    return 'default print';
  }

  format(prefix: string): string {
    return `${prefix}: ${this.print()}`;
  }
}

const Print = macroTrait(PrintTrait);

class DebugTrait extends Trait {
  debug(): string {
    return 'default debug';
  }
}

const Debug = macroTrait(DebugTrait);

// Basic class with commons
@derive([Print])
class BasicClass {
  constructor(public value: string) {}
}
Debug.implFor(BasicClass, {
  debug(this: BasicClass) {
    return `custom debug for: ${this.value}`;
  },
});

describe('Basic Trait Features', () => {
  describe('Simple Trait Implementation', () => {
    test('should implement default trait methods', () => {
      const instance = new BasicClass('test');
      expect(instance.print()).toBe('default print');
      expect(instance.format('prefix')).toBe('prefix: default print');
    });

    test('should implement custom trait methods', () => {
      const instance = new BasicClass('test');
      expect(instance.debug()).toBe('custom debug for: test');
    });

    test('should check trait implementation', () => {
      const instance = new BasicClass('test');
      expect(PrintTrait.isImplFor(instance)).toBe(true);
      expect(DebugTrait.isImplFor(instance)).toBe(true);
      expect(PrintTrait.isImplFor({})).toBe(false);
    });

    test('should get trait implementation', () => {
      const instance = new BasicClass('test');
      const printTrait = PrintTrait.wrap(instance);
      const debugTrait = DebugTrait.wrap(instance);

      expect(printTrait).toBeDefined();
      expect(debugTrait).toBeDefined();
      expect(printTrait instanceof BasicClass).toBeTruthy();
      expect(debugTrait instanceof BasicClass).toBeTruthy();
      expect(printTrait.print()).toBe('default print');
      expect(debugTrait.debug()).toBe('custom debug for: test');
    });
  });

  describe('Custom Implementation', () => {
    class CustomClass {
      constructor(
        private prefix: string,
        private suffix: string,
      ) {}
      getPrefix(): string {
        return this.prefix;
      }
      getSuffix(): string {
        return this.suffix;
      }
    }

    interface CustomClass {
      print(): string;
      format(prefix: string): string;
    }

    beforeAll(() => {
      PrintTrait.implFor(CustomClass, {
        print(this: CustomClass) {
          return `${this.getPrefix()} - print - ${this.getSuffix()}`;
        },
        format(this: CustomClass, prefix: string) {
          return `${prefix} [${this.getPrefix()}] - ${this.getSuffix()}`;
        },
      });
    });

    test('should support custom implementation with typed this', () => {
      const obj = new CustomClass('start', 'end');
      expect(PrintTrait.wrap(obj).print()).toBe('start - print - end');
      expect(PrintTrait.wrap(obj).format('test')).toBe('test [start] - end');
    });
  });
});
