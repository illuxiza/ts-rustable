import { derive } from '@rustable/utils';
import { macroTrait, trait, Trait } from '../src/trait';

describe('Advanced Trait Features', () => {
  describe('Multiple Method Traits', () => {
    class MathOps extends Trait {
      add(a: number, b: number): number {
        return a + b;
      }

      multiply(a: number, b: number): number {
        return a * b;
      }
    }

    class StringOps extends Trait {
      concat(...strings: string[]): string {
        return strings.join('');
      }

      replace(text: string, searchValue: string | RegExp, replaceValue: string): string {
        return text.replace(searchValue, replaceValue);
      }
    }

    test('should handle multiple method commons', () => {
      class MathClass {
        constructor(private base: number = 0) {}
        getBase(): number {
          return this.base;
        }
      }
      interface MathClass {
        add(a: number, b: number): number;
        multiply(a: number, b: number): number;
        concat(...strings: string[]): string;
        replace(text: string, searchValue: string | RegExp, replaceValue: string): string;
      }

      MathOps.implFor(MathClass);
      StringOps.implFor(MathClass, {
        concat(this: MathClass, ...strings: string[]): string {
          return `[${this.getBase()}] ${strings.join(' + ')}`;
        },
      });
      const instance = new MathClass(10);
      expect(instance.add(2, 3)).toBe(5);
      expect(instance.multiply(4, 5)).toBe(20);
      expect(instance.concat('a', 'b', 'c')).toBe('[10] a + b + c');
      expect(instance.replace('hello world', 'world', 'typescript')).toBe('hello typescript');
    });
  });

  describe('Trait Method Conflicts', () => {
    class Animal extends Trait {
      makeSound(): string {
        return 'Default Animal sound';
      }
      getName(): string {
        throw new Error('Method not implemented.');
      }
    }

    class Pet extends Animal {
      makeSound(): string {
        return 'Default Pet sound';
      }
      play(): string {
        throw new Error('Method not implemented.');
      }
    }

    class PlayableTrait extends Trait {
      playGame(): string {
        return 'Playing a game';
      }
      getScore(): number {
        throw new Error('Method not implemented.');
      }
    }

    const Playable = macroTrait(PlayableTrait);

    class ScoreableTrait extends Trait {
      playGame(): string {
        return 'Scoring a game';
      }
      getScore(): number {
        throw new Error('Method not implemented.');
      }
    }

    const Scoreable = macroTrait(ScoreableTrait);

    @derive([Playable, Scoreable])
    class Dog {
      constructor(
        public name: string,
        private score: number = 0,
      ) {}

      getScore(): number {
        return this.score;
      }
    }
    Animal.implFor(Dog, {
      getName(this: Dog) {
        return this.name;
      },
    });
    Pet.implFor(Dog, {
      makeSound() {
        return 'Woof!';
      },
      play() {
        return 'Playing fetch!';
      },
    });

    test('should handle trait method conflicts', () => {
      const dog = new Dog('Buddy', 100);
      expect(dog.getScore()).toBe(100);
      expect(Animal.wrap(dog).getName()).toBe('Buddy');
      expect(Pet.wrap(dog).makeSound()).toBe('Woof!');
      expect(Pet.wrap(dog).play()).toBe('Playing fetch!');
      expect(Playable.wrap(dog).playGame()).toBe('Playing a game');
      expect(Scoreable.wrap(dog).playGame()).toBe('Scoring a game');
    });
  });

  describe('Default Implementation Override', () => {
    class PrintableTrait extends Trait {
      print(): string {
        return 'default print';
      }
    }

    const Printable = macroTrait(PrintableTrait);

    class DisplayableTrait extends Trait {
      display(): string {
        return 'default display';
      }
    }

    const Displayable = macroTrait(DisplayableTrait);

    test('should use default trait implementations', () => {
      @derive([Printable, Displayable])
      class Target {}

      const target = new Target();
      expect(Printable.wrap(target)?.print()).toBe('default print');
      expect(Displayable.wrap(target)?.display()).toBe('default display');
    });

    test('should override default implementations', () => {
      class Target {}
      Printable.implFor(Target, {
        print(): string {
          return 'custom print';
        },
      });
      Displayable.implFor(Target, {
        display(): string {
          return 'custom display';
        },
      });

      const target = new Target();
      expect(Printable.wrap(target)?.print()).toBe('custom print');
      expect(Displayable.wrap(target)?.display()).toBe('custom display');
    });
  });
  describe('Mixed Instance and Static Methods', () => {
    @trait
    class MixedTrait extends Trait {
      static staticMethod(): string {
        return 'default static method';
      }

      instanceMethod(): string {
        return 'default instance method';
      }
    }

    test('should implement both static and instance methods', () => {
      class Target {
        static staticMethod(): string {
          return 'custom static method';
        }
      }
      MixedTrait.implFor(Target, {
        static: {
          staticMethod(): string {
            return 'custom static method';
          },
        },
        instanceMethod(): string {
          return 'custom instance method';
        },
      });

      const target = new Target();
      expect(MixedTrait.wrap(Target).staticMethod()).toBe('custom static method');
      expect(MixedTrait.wrap(target).instanceMethod()).toBe('custom instance method');
    });
  });
});
