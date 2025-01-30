import { Type } from '@rustable/type';
import { macroTrait, Trait } from '../src/trait';

describe('Trait to Trait Implementation', () => {
  test('trait implementing another trait should be recorded correctly', () => {
    class Display extends Trait {
      display(): string {
        return 'Display';
      }
    }

    class Debug extends Trait {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement Display for Debug trait
    Display.implFor(Debug);

    // Debug trait should have Display trait
    expect(Display.isImplFor(Debug)).toBe(true);
  });

  test('macroled trait implementing another trait should be recorded correctly', () => {
    class DisplayTrait extends Trait {
      display(): string {
        return 'Display';
      }
    }

    const Display = macroTrait(DisplayTrait);

    class DebugTrait {
      debug(): string {
        return 'Debug';
      }
    }

    const Debug = macroTrait(DebugTrait);

    // Implement Display for Debug trait
    Display.implFor(Debug);

    // Debug trait should have Display trait
    expect(Display.isImplFor(Debug)).toBe(true);
  });

  test('class implementing a trait should automatically implement its implemented traits', () => {
    class Display extends Trait {
      display(): string {
        return 'Display';
      }
    }

    class Debug extends Trait {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement Display for Debug trait
    Display.implFor(Debug);

    // Create a class and implement Debug
    class MyClass {}
    Debug.implFor(MyClass);

    // MyClass should have both Debug and Display traits
    expect(Debug.isImplFor(MyClass)).toBe(true);
    expect(Display.isImplFor(MyClass)).toBe(true);

    // Should be able to use both traits
    const instance = new MyClass();
    const debugTrait = Debug.wrap(instance);
    const displayTrait = Display.wrap(instance);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
  });

  test('class implementing a macroled trait should automatically implement its implemented traits', () => {
    class DisplayTrait extends Trait {
      display(): string {
        return 'Display';
      }
    }

    const Display = macroTrait(DisplayTrait);

    class DebugTrait extends Trait {
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
    Display.implFor(Debug);

    // Create a class and implement Debug
    class MyClass {}
    Debug.implFor(MyClass);

    // MyClass should have both Debug and Display traits
    expect(Debug.isImplFor(MyClass)).toBe(true);
    expect(Display.isImplFor(MyClass)).toBe(true);

    // Should be able to use both traits
    const instance = new MyClass();
    const debugTrait = Debug.wrap(instance);
    const displayTrait = Display.wrap(instance);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
  });

  test('trait implementing generic trait should work correctly', () => {
    class ToString<T> extends Trait {
      toString(value: T): string {
        return String(value);
      }
    }

    class Debug<T> extends Trait {
      debug(value: T): string {
        return `Debug(${value})`;
      }
    }

    // Implement ToString<number> for Debug<number>
    Type(ToString, [Number]).implFor(Type(Debug, [Number]));

    // Create a class and implement Debug<number>
    class NumberClass {}
    Type(Debug, [Number]).implFor(NumberClass);

    // NumberClass should have both Debug<number> and ToString<number> traits
    expect(Type(Debug, [Number]).isImplFor(NumberClass)).toBe(true);
    expect(Type(ToString, [Number]).isImplFor(NumberClass)).toBe(true);

    // Should be able to use both traits
    const instance = new NumberClass();
    const debugTrait = Type(Debug, [Number]).wrap(instance);
    const toStringTrait = Type(ToString, [Number]).wrap(instance);

    expect(debugTrait.debug(42)).toBe('Debug(42)');
    expect(toStringTrait.toString(42)).toBe('42');
  });

  test('trait implementing multiple traits should work correctly', () => {
    class Display extends Trait {
      display(): string {
        return 'Display';
      }
    }

    class ToString extends Trait {
      toString(): string {
        return 'ToString';
      }
    }

    class Debug extends Trait {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement both Display and ToString for Debug trait
    Display.implFor(Debug);
    ToString.implFor(Debug);

    // Create a class and implement Debug
    class MyClass {}
    Debug.implFor(MyClass);

    // MyClass should have all three traits
    expect(Debug.isImplFor(MyClass)).toBe(true);
    expect(Display.isImplFor(MyClass)).toBe(true);
    expect(ToString.isImplFor(MyClass)).toBe(true);

    // Should be able to use all traits
    const instance = new MyClass();
    const debugTrait = Debug.wrap(instance);
    const displayTrait = Display.wrap(instance);
    const toStringTrait = ToString.wrap(instance);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
    expect(toStringTrait.toString()).toBe('ToString');
  });

  test('trait implementing another trait with custom implementation', () => {
    class Display extends Trait {
      display(): string {
        return 'Display';
      }
    }

    class Debug extends Trait {
      debug(): string {
        return 'Debug';
      }
    }

    // Implement Display for Debug trait with custom implementation
    Display.implFor(Debug, {
      display(this: Debug) {
        return `Debug(${this.debug()})`;
      },
    });

    // Create a class and implement Debug
    class MyClass {}
    Debug.implFor(MyClass);

    // MyClass should have both Debug and Display traits
    expect(Debug.isImplFor(MyClass)).toBe(true);
    expect(Display.isImplFor(MyClass)).toBe(true);

    // Should be able to use both traits
    const instance = new MyClass();
    const debugTrait = Debug.wrap(instance);
    const displayTrait = Display.wrap(instance);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Debug(Debug)'); // Custom implementation uses debug()
  });

  test('generic trait implementing another generic trait with custom implementation should work correctly', () => {
    class ToString<T> extends Trait {
      value!: T;
      toString(): string {
        return String(this.value);
      }
    }

    class Debug<T> extends Trait {
      value!: T;
      debug(): string {
        return `Debug(${this.value})`;
      }
    }

    // Implement ToString<number> for Debug<number> with custom implementation
    Type(ToString, [Number]).implFor(Debug<Number>, {
      toString(this: Debug<Number>) {
        return this.debug();
      },
    });

    // Create a class and implement Debug<number>
    class NumberClass {
      constructor(public value: number) {}
    }
    Type(Debug, [Number]).implFor(NumberClass);

    // NumberClass should have both Debug<number> and ToString<number> traits
    expect(Type(Debug, [Number]).isImplFor(NumberClass)).toBe(true);
    expect(Type(ToString, [Number]).isImplFor(NumberClass)).toBe(true);

    // Should be able to use both traits with the custom implementation
    const instance = new NumberClass(42);
    const debugTrait = Type(Debug, [Number]).wrap(instance);
    const toStringTrait = Type(ToString, [Number]).wrap(instance);

    expect(instance.toString()).toBe('Debug(42)');
    expect(debugTrait.debug()).toBe('Debug(42)');
    expect(toStringTrait.toString()).toBe('Debug(42)'); // Custom implementation uses debug()
  });

  test('existing classes should automatically get new trait-to-trait implementations', () => {
    class Display extends Trait {
      display(): string {
        return 'Display';
      }
    }

    class Debug extends Trait {
      debug(): string {
        return 'Debug';
      }
    }

    class ToString extends Trait {
      toString(): string {
        return 'ToString';
      }
    }

    // First create and implement a class with Debug
    class MyClass {}
    Debug.implFor(MyClass);

    // Verify initial state
    expect(Debug.isImplFor(MyClass)).toBe(true);
    expect(Display.isImplFor(MyClass)).toBe(false);
    expect(ToString.isImplFor(MyClass)).toBe(false);

    // Now implement Display for Debug trait
    Display.implFor(Debug);

    // MyClass should automatically get Display trait
    expect(Display.isImplFor(MyClass)).toBe(true);

    // Create another class implementing Debug
    class AnotherClass {}
    Debug.implFor(AnotherClass);

    // AnotherClass should get both Debug and Display
    expect(Debug.isImplFor(AnotherClass)).toBe(true);
    expect(Display.isImplFor(AnotherClass)).toBe(true);

    // Now implement ToString for Debug
    ToString.implFor(Debug);

    // Both classes should automatically get ToString
    expect(ToString.isImplFor(MyClass)).toBe(true);
    expect(ToString.isImplFor(AnotherClass)).toBe(true);

    // Verify all traits are usable
    const myInstance = new MyClass();
    const debugTrait = Debug.wrap(myInstance);
    const displayTrait = Display.wrap(myInstance);
    const toStringTrait = ToString.wrap(myInstance);

    expect(debugTrait.debug()).toBe('Debug');
    expect(displayTrait.display()).toBe('Display');
    expect(toStringTrait.toString()).toBe('ToString');
  });

  test('existing classes should automatically get new trait-to-trait implementations with generics', () => {
    class Display<T> extends Trait {
      display(value: T): string {
        return String(value);
      }
    }

    class Debug<T> extends Trait {
      debug(value: T): string {
        return `Debug(${String(value)})`;
      }
    }

    class ToString<T> extends Trait {
      toString(value: T): string {
        return String(value);
      }
    }

    // First create and implement a class with Debug<number>
    class NumberClass {
      constructor(public value: number) {}
    }
    Type(Debug, [Number]).implFor(NumberClass);

    // Verify initial state
    expect(Type(Debug, [Number]).isImplFor(NumberClass)).toBe(true);
    expect(Type(Display, [Number]).isImplFor(NumberClass)).toBe(false);
    expect(Type(ToString, [Number]).isImplFor(NumberClass)).toBe(false);

    // Now implement Display<T> for Debug<T>
    Type(Display, [Number]).implFor(Type(Debug, [Number]));

    // NumberClass should automatically get Display<number>
    expect(Type(Display, [Number]).isImplFor(NumberClass)).toBe(true);

    // Create another class implementing Debug<string>
    class StringClass {
      constructor(public value: string) {}
    }
    Type(Debug, [String]).implFor(StringClass);
    Type(Display, [String]).implFor(Type(Debug, [String]));

    // StringClass should get both Debug<string> and Display<string>
    expect(Type(Debug, [String]).isImplFor(StringClass)).toBe(true);
    expect(Type(Display, [String]).isImplFor(StringClass)).toBe(true);

    // Now implement ToString<T> for Debug<T>
    Type(ToString, [Number]).implFor(Type(Debug, [Number]));
    Type(ToString, [String]).implFor(Type(Debug, [String]));

    // Both classes should automatically get ToString with their respective type parameters
    expect(Type(ToString, [Number]).isImplFor(NumberClass)).toBe(true);
    expect(Type(ToString, [String]).isImplFor(StringClass)).toBe(true);

    // Verify all traits are usable with correct types
    const numInstance = new NumberClass(42);
    const debugTrait = Type(Debug, [Number]).wrap(numInstance);
    const displayTrait = Type(Display, [Number]).wrap(numInstance);
    const toStringTrait = Type(ToString, [Number]).wrap(numInstance);

    expect(debugTrait.debug(42)).toBe('Debug(42)');
    expect(displayTrait.display(42)).toBe('42');
    expect(toStringTrait.toString(42)).toBe('42');

    const strInstance = new StringClass('hello');
    const strDebugTrait = Type(Debug, [String]).wrap(strInstance);
    const strDisplayTrait = Type(Display, [String]).wrap(strInstance);
    const strToStringTrait = Type(ToString, [String]).wrap(strInstance);

    expect(strDebugTrait.debug('hello')).toBe('Debug(hello)');
    expect(strDisplayTrait.display('hello')).toBe('hello');
    expect(strToStringTrait.toString('hello')).toBe('hello');
  });

  test('trait implementing another trait with static methods should work correctly', () => {
    class FromStr extends Trait {
      static fromStr(str: string): any {
        return str;
      }
    }
    class Parse extends Trait {
      static parse(str: string): any {
        return str;
      }
    }

    // Implement FromStr for Parse trait with custom static implementation
    FromStr.implFor(Parse, {
      static: {
        fromStr(str: string) {
          return `Parsed(${str})`;
        },
      },
    });

    expect(FromStr.isImplFor(Parse)).toBe(true);

    const FromStrWrapped = FromStr.staticWrap(Parse);

    const instance2 = FromStrWrapped.fromStr('world');
    expect(instance2).toBe('Parsed(world)');
  });
});
