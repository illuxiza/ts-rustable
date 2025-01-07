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
});
