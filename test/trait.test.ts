import { hasTrait, implTrait, trait, useTrait } from '../src/trait';

// Define a class
class MyClass {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
}

// Define trait interfaces
interface MyClass {
  print(): string;
  debug(): string;
  format(prefix: string): string;
  transform<T>(value: T): string;
  add(a: number, b: number): number;
  multiply(a: number, b: number): number;
  concat(...strings: string[]): string;
  replace(text: string, searchValue: string | RegExp, replaceValue: string): string;
}

// Define traits as classes
@trait
class Print {
  print(): string {
    return 'default print';
  }

  format(prefix: string): string {
    return `${prefix}: ${this.print()}`;
  }

  transform<T>(value: T): string {
    return `transformed: ${String(value)}`;
  }
}

@trait
class Debug {
  debug(): string {
    return 'default debug';
  }
}

@trait
class MathOps {
  add(a: number, b: number): number {
    return a + b;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }
}

@trait
class StringOps {
  concat(...strings: string[]): string {
    return strings.join('');
  }

  replace(text: string, searchValue: string | RegExp, replaceValue: string): string {
    return text.replace(searchValue, replaceValue);
  }
}

// Implement traits
implTrait(MyClass, Print);
implTrait(MyClass, Debug, {
  debug(this: MyClass) {
    return `custom debug for: ${this.value}`;
  },
});
implTrait(MyClass, MathOps);
implTrait(MyClass, StringOps, {
  concat(this: MyClass, ...strings: string[]): string {
    return `[${this.value}] ${strings.join(' + ')}`;
  },
});

describe('Trait System', () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass('test');
  });

  it('should handle basic trait functionality', () => {
    expect(instance.print()).toBe('default print');
    expect(instance.debug()).toBe('custom debug for: test');
    expect(instance.format('prefix')).toBe('prefix: default print');
    expect(instance.transform(123)).toBe('transformed: 123');
  });

  it('should check trait implementation', () => {
    expect(hasTrait(instance, Print)).toBe(true);
    expect(hasTrait(instance, Debug)).toBe(true);
    expect(hasTrait({}, Print)).toBe(false);
  });

  it('should get trait implementation', () => {
    const printTrait = useTrait(instance, Print);
    const debugTrait = useTrait(instance, Debug);

    expect(printTrait).toBeDefined();
    expect(debugTrait).toBeDefined();
    expect(printTrait?.print()).toBe('default print');
    expect(debugTrait?.debug()).toBe('custom debug for: test');
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
      transform<T>(value: T): string;
    }

    beforeAll(() => {
      implTrait(CustomClass, Print, {
        print(this: CustomClass) {
          return `${this.getPrefix()} - print - ${this.getSuffix()}`;
        },
        format(this: CustomClass, prefix: string) {
          return `${prefix} [${this.getPrefix()}] - ${this.getSuffix()}`;
        },
      });
    });

    it('should support custom implementation with typed this', () => {
      const obj = new CustomClass('start', 'end');
      expect(obj.print()).toBe('start - print - end');
      expect(obj.format('test')).toBe('test [start] - end');
      expect(obj.transform(123)).toBe('transformed: 123');
    });
  });

  describe('Edge Cases', () => {
    class EmptyClass {}

    it('should handle undefined trait implementation', () => {
      const obj = new EmptyClass();
      const printTrait = useTrait(obj, Print);
      expect(printTrait).toBeUndefined();
    });
  });

  describe('Multiple traits with same method', () => {
    @trait
    class Animal {
      makeSound(): string {
        return 'Default Animal sound';
      }
      get_name(): string {
        throw new Error('Method not implemented.');
      }
    }

    @trait
    class Pet extends Animal {
      makeSound(): string {
        return 'Default Pet sound';
      }
      play(): string {
        throw new Error('Method not implemented.');
      }
    }

    @trait
    class Playable {
      playGame(): string {
        return 'Playing a game';
      }
      getScore(): number {
        throw new Error('Method not implemented.');
      }
    }

    @trait
    class Scoreable {
      playGame(): string {
        return 'Scoring a game';
      }
      getScore(): number {
        throw new Error('Method not implemented.');
      }
    }

    it('should throw error when calling ambiguous methods directly', () => {
      class Dog {
        constructor(
          public name: string,
          private _score: number = 0,
        ) {}

        getScore(): number {
          return this._score;
        }
      }
      interface Dog {
        makeSound(): string;
        playGame(): string;
      }
      implTrait(Dog, Animal);
      implTrait(Dog, Pet);
      implTrait(Dog, Playable);
      implTrait(Dog, Scoreable);

      const dog = new Dog('Buddy');

      expect(() => dog.makeSound()).toThrow(
        'Multiple implementations of method makeSound for Dog, please use useTrait',
      );
      expect(() => dog.playGame()).toThrow('Multiple implementations of method playGame for Dog, please use useTrait');
    });

    it('should work when using explicit trait methods', () => {
      class Dog {
        constructor(
          public name: string,
          private _score: number = 0,
        ) {}

        getScore(): number {
          return this._score;
        }
        makeSound(): string {
          return 'Default Dog sound';
        }
        playGame(): string {
          return 'Dog is playing a game';
        }
      }
      implTrait(Dog, Animal);
      implTrait(Dog, Pet);
      implTrait(Dog, Playable);
      implTrait(Dog, Scoreable);

      const dog = new Dog('Buddy');

      // Test Animal and Pet's makeSound
      expect(useTrait(dog, Animal)?.makeSound()).toBe('Default Animal sound');
      expect(useTrait(dog, Pet)?.makeSound()).toBe('Default Pet sound');
      expect(useTrait(dog, Dog)?.makeSound()).toBe('Default Dog sound');

      // Test Playable and Scoreable's playGame
      expect(useTrait(dog, Playable)?.playGame()).toBe('Playing a game');
      expect(useTrait(dog, Scoreable)?.playGame()).toBe('Scoring a game');
      expect(useTrait(dog, Dog)?.playGame()).toBe('Dog is playing a game');
    });

    it('should allow custom implementations of trait methods', () => {
      class Dog {
        constructor(
          public name: string,
          private _score: number = 0,
        ) {}

        getScore(): number {
          return this._score;
        }
      }

      interface Dog {
        makeSound(): string;
        playGame(): string;
      }

      implTrait(Dog, Animal);
      implTrait(Dog, Pet, {
        makeSound(this: Dog) {
          return `Custom Pet sound for ${this.name}`;
        },
      });
      implTrait(Dog, Playable);
      implTrait(Dog, Scoreable);

      const dog = new Dog('Buddy', 100);

      // Even with custom implementations, direct calls should still throw
      expect(() => dog.makeSound()).toThrow();
      expect(() => dog.playGame()).toThrow();

      // But trait-specific calls should use the implementations
      expect(useTrait(dog, Pet)?.makeSound()).toBe('Custom Pet sound for Buddy');
      expect(useTrait(dog, Scoreable)?.playGame()).toBe('Scoring a game');
    });
  });
});
