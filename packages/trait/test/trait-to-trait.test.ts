import { Type } from 'packages/utils/src';
import { hasTrait, implTrait, macroTrait, trait, useTrait } from '../src/trait';

describe('Trait to Trait Implementation', () => {
  test('trait implementing another trait should be recorded correctly', () => {
    @trait
    class Display {
      display(): string {
        return 'Display';
      }
    }

    @trait
    class Debug {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement Display for Debug trait
    implTrait(Debug, Display);

    // Debug trait should have Display trait
    expect(hasTrait(Debug, Display)).toBe(true);
  });

  test('macroled trait implementing another trait should be recorded correctly', () => {
    @trait
    class DisplayTrait {
      display(): string {
        return 'Display';
      }
    }

    const Display = macroTrait(DisplayTrait);

    @trait
    class DebugTrait {
      debug(): string {
        return 'Debug';
      }
    }

    const Debug = macroTrait(DebugTrait);

    // Implement Display for Debug trait
    implTrait(Debug, Display);

    // Debug trait should have Display trait
    expect(hasTrait(Debug, Display)).toBe(true);
  });

  test('class implementing a trait should automatically implement its implemented traits', () => {
    @trait
    class Display {
      display(): string {
        return 'Display';
      }
    }

    @trait
    class Debug {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement Display for Debug trait
    implTrait(Debug, Display);

    // Create a class and implement Debug
    class MyClass {}
    implTrait(MyClass, Debug);

    // MyClass should have both Debug and Display traits
    expect(hasTrait(MyClass, Debug)).toBe(true);
    expect(hasTrait(MyClass, Display)).toBe(true);

    // Should be able to use both traits
    const instance = new MyClass();
    const debugTrait = useTrait(instance, Debug);
    const displayTrait = useTrait(instance, Display);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
  });

  test('class implementing a macroled trait should automatically implement its implemented traits', () => {
    @trait
    class DisplayTrait {
      display(): string {
        return 'Display';
      }
    }

    const Display = macroTrait(DisplayTrait);

    @trait
    class DebugTrait {
      debug(): string {
        return 'Debug';
      }
    }

    const Debug = macroTrait(DebugTrait, {
      debug() {
        return `Debug(${this.value})`;
      },
    });

    // Implement Display for Debug trait
    implTrait(Debug, Display);

    // Create a class and implement Debug
    class MyClass {}
    implTrait(MyClass, Debug);

    // MyClass should have both Debug and Display traits
    expect(hasTrait(MyClass, Debug)).toBe(true);
    expect(hasTrait(MyClass, Display)).toBe(true);

    // Should be able to use both traits
    const instance = new MyClass();
    const debugTrait = useTrait(instance, Debug);
    const displayTrait = useTrait(instance, Display);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
  });

  test('trait implementing generic trait should work correctly', () => {
    @trait
    class ToString<T> {
      toString(value: T): string {
        return String(value);
      }
    }

    @trait
    class Debug<T> {
      debug(value: T): string {
        return `Debug(${value})`;
      }
    }

    // Implement ToString<number> for Debug<number>
    implTrait(Debug, ToString, [Number]);

    // Create a class and implement Debug<number>
    class NumberClass {}
    implTrait(NumberClass, Debug, [Number]);

    // NumberClass should have both Debug<number> and ToString<number> traits
    expect(hasTrait(NumberClass, Debug, [Number])).toBe(true);
    expect(hasTrait(NumberClass, ToString, [Number])).toBe(true);

    // Should be able to use both traits
    const instance = new NumberClass();
    const debugTrait = useTrait(instance, Debug, [Number]);
    const toStringTrait = useTrait(instance, ToString, [Number]);

    expect(debugTrait.debug(42)).toBe('Debug(42)');
    expect(toStringTrait.toString(42)).toBe('42');
  });

  test('trait implementing multiple traits should work correctly', () => {
    @trait
    class Display {
      display(): string {
        return 'Display';
      }
    }

    @trait
    class ToString {
      toString(): string {
        return 'ToString';
      }
    }

    @trait
    class Debug {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement both Display and ToString for Debug trait
    implTrait(Debug, Display);
    implTrait(Debug, ToString);

    // Create a class and implement Debug
    class MyClass {}
    implTrait(MyClass, Debug);

    // MyClass should have all three traits
    expect(hasTrait(MyClass, Debug)).toBe(true);
    expect(hasTrait(MyClass, Display)).toBe(true);
    expect(hasTrait(MyClass, ToString)).toBe(true);

    // Should be able to use all traits
    const instance = new MyClass();
    const debugTrait = useTrait(instance, Debug);
    const displayTrait = useTrait(instance, Display);
    const toStringTrait = useTrait(instance, ToString);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
    expect(toStringTrait.toString()).toBe('ToString');
  });

  test('trait implementing another trait with custom implementation', () => {
    @trait
    class Display {
      display(): string {
        return 'Display';
      }
    }

    @trait
    class Debug {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement Display for Debug trait with custom implementation
    implTrait(Debug, Display, {
      display(this: Debug) {
        return `Debug(${this.debug()})`;
      },
    });

    // Create a class and implement Debug
    class MyClass {}
    implTrait(MyClass, Debug);

    // MyClass should have both Debug and Display traits
    expect(hasTrait(MyClass, Debug)).toBe(true);
    expect(hasTrait(MyClass, Display)).toBe(true);

    // Should be able to use both traits with the custom implementation
    const instance = new MyClass();
    const debugTrait = useTrait(instance, Debug);
    const displayTrait = useTrait(instance, Display);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Debug(Debug)'); // Custom implementation uses debug()
  });

  test('trait implementing generic trait with custom implementation', () => {
    @trait
    class ToString<T> {
      value!: T;
      toString(): string {
        return String(this.value);
      }
    }

    @trait
    class Debug<T> {
      value!: T;
      debug(): string {
        return `Debug(${this.value})`;
      }
    }

    // Implement ToString<number> for Debug<number> with custom implementation
    implTrait(Debug<Number>, ToString, [Number], {
      toString(this: Debug<Number>) {
        return this.debug();
      },
    });

    // Create a class and implement Debug<number>
    class NumberClass {
      constructor(public value: number) {}
    }
    implTrait(NumberClass, Debug, [Number]);

    // NumberClass should have both Debug<number> and ToString<number> traits
    expect(hasTrait(NumberClass, Debug, [Number])).toBe(true);
    expect(hasTrait(NumberClass, ToString, [Number])).toBe(true);

    // Should be able to use both traits with the custom implementation
    const instance = new NumberClass(42);
    const debugTrait = useTrait(instance, Debug, [Number]);
    const toStringTrait = useTrait(instance, ToString, [Number]);

    expect(instance.toString()).toBe('Debug(42)');
    expect(debugTrait.debug()).toBe('Debug(42)');
    expect(toStringTrait.toString()).toBe('Debug(42)'); // Custom implementation uses debug()
  });

  test('existing classes should automatically get new trait-to-trait implementations', () => {
    @trait
    class Display {
      display(): string {
        return 'Display';
      }
    }

    @trait
    class Debug {
      debug(): string {
        return 'Debug';
      }
    }

    @trait
    class ToString {
      toString(): string {
        return 'ToString';
      }
    }

    // First create and implement a class with Debug
    class MyClass {}
    implTrait(MyClass, Debug);

    // Verify initial state
    expect(hasTrait(MyClass, Debug)).toBe(true);
    expect(hasTrait(MyClass, Display)).toBe(false);
    expect(hasTrait(MyClass, ToString)).toBe(false);

    // Now implement Display for Debug trait
    implTrait(Debug, Display);

    // MyClass should automatically get Display trait
    expect(hasTrait(MyClass, Display)).toBe(true);

    // Create another class implementing Debug
    class AnotherClass {}
    implTrait(AnotherClass, Debug);

    // AnotherClass should get both Debug and Display
    expect(hasTrait(AnotherClass, Debug)).toBe(true);
    expect(hasTrait(AnotherClass, Display)).toBe(true);

    // Now implement ToString for Debug
    implTrait(Debug, ToString);

    // Both classes should automatically get ToString
    expect(hasTrait(MyClass, ToString)).toBe(true);
    expect(hasTrait(AnotherClass, ToString)).toBe(true);

    // Verify all traits are usable
    const myInstance = new MyClass();
    const debugTrait = useTrait(myInstance, Debug);
    const displayTrait = useTrait(myInstance, Display);
    const toStringTrait = useTrait(myInstance, ToString);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
    expect(toStringTrait.toString()).toBe('ToString');
  });

  test('existing classes should automatically get new trait-to-trait implementations with generics', () => {
    @trait
    class Display<T> {
      display(value: T): string {
        return String(value);
      }
    }

    @trait
    class Debug<T> {
      debug(value: T): string {
        return `Debug(${String(value)})`;
      }
    }

    @trait
    class ToString<T> {
      toString(value: T): string {
        return String(value);
      }
    }

    // First create and implement a class with Debug<number>
    class NumberClass {
      constructor(public value: number) {}
    }
    implTrait(NumberClass, Debug, [Number]);

    // Verify initial state
    expect(hasTrait(NumberClass, Debug, [Number])).toBe(true);
    expect(hasTrait(NumberClass, Display, [Number])).toBe(false);
    expect(hasTrait(NumberClass, ToString, [Number])).toBe(false);

    // Now implement Display<T> for Debug<T>
    implTrait(Type(Debug, [Number]), Display, [Number]);

    // NumberClass should automatically get Display<number>
    expect(hasTrait(NumberClass, Display, [Number])).toBe(true);

    // Create another class implementing Debug<string>
    class StringClass {
      constructor(public value: string) {}
    }
    implTrait(StringClass, Debug, [String]);
    implTrait(Type(Debug, [String]), Display, [String]);

    // StringClass should get both Debug<string> and Display<string>
    expect(hasTrait(StringClass, Debug, [String])).toBe(true);
    expect(hasTrait(StringClass, Display, [String])).toBe(true);

    // Now implement ToString<T> for Debug<T>
    implTrait(Type(Debug, [Number]), ToString, [Number]);
    implTrait(Type(Debug, [String]), ToString, [String]);

    // Both classes should automatically get ToString with their respective type parameters
    expect(hasTrait(NumberClass, ToString, [Number])).toBe(true);
    expect(hasTrait(StringClass, ToString, [String])).toBe(true);

    // Verify all traits are usable with correct types
    const numInstance = new NumberClass(42);
    const debugTrait = useTrait(numInstance, Debug, [Number]);
    const displayTrait = useTrait(numInstance, Display, [Number]);
    const toStringTrait = useTrait(numInstance, ToString, [Number]);

    expect(debugTrait.debug(42)).toBe('Debug(42)');
    expect(displayTrait.display(42)).toBe('42');
    expect(toStringTrait.toString(42)).toBe('42');

    const strInstance = new StringClass('hello');
    const strDebugTrait = useTrait(strInstance, Debug, [String]);
    const strDisplayTrait = useTrait(strInstance, Display, [String]);
    const strToStringTrait = useTrait(strInstance, ToString, [String]);

    expect(strDebugTrait.debug('hello')).toBe('Debug(hello)');
    expect(strDisplayTrait.display('hello')).toBe('hello');
    expect(strToStringTrait.toString('hello')).toBe('hello');
  });
});
