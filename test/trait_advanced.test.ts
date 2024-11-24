import { implTrait, trait, useTrait } from '../src/trait';

describe('Advanced Trait Features', () => {
  describe('Multiple Method Traits', () => {
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

    test('should handle multiple method traits', () => {
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

      implTrait(MathClass, MathOps);
      implTrait(MathClass, StringOps, {
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
    @trait
    class Animal {
      makeSound(): string {
        return 'Default Animal sound';
      }
      getName(): string {
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

    class Dog {
      constructor(
        public name: string,
        private score: number = 0,
      ) {}

      getScore(): number {
        return this.score;
      }
    }

    beforeAll(() => {
      implTrait(Dog, Animal, {
        getName(this: Dog) {
          return this.name;
        },
      });
      implTrait(Dog, Pet, {
        makeSound() {
          return 'Woof!';
        },
        play() {
          return 'Playing fetch!';
        },
      });
      implTrait(Dog, Playable);
      implTrait(Dog, Scoreable);
    });

    test('should handle trait method conflicts', () => {
      const dog = new Dog('Buddy', 100);
      expect(() => dog.getScore()).toThrow('Multiple implementations of method getScore for Dog, please use useTrait');
      expect(useTrait(dog, Animal).getName()).toBe('Buddy');
      expect(useTrait(dog, Pet).makeSound()).toBe('Woof!');
      expect(useTrait(dog, Pet).play()).toBe('Playing fetch!');
      expect(useTrait(dog, Playable).playGame()).toBe('Playing a game');
      expect(useTrait(dog, Scoreable).playGame()).toBe('Scoring a game');
      expect(useTrait(dog, Dog).getScore()).toBe(100);
    });
  });

  describe('Default Implementation Override', () => {
    @trait
    class Printable {
      print(): string {
        return 'default print';
      }
    }

    @trait
    class Displayable {
      display(): string {
        return 'default display';
      }
    }

    test('should use default trait implementations', () => {
      class Target {}
      implTrait(Target, Printable);
      implTrait(Target, Displayable);

      const target = new Target();
      expect(useTrait(target, Printable)?.print()).toBe('default print');
      expect(useTrait(target, Displayable)?.display()).toBe('default display');
    });

    test('should override default implementations', () => {
      class Target {}
      implTrait(Target, Printable, {
        print(): string {
          return 'custom print';
        },
      });
      implTrait(Target, Displayable, {
        display(): string {
          return 'custom display';
        },
      });

      const target = new Target();
      expect(useTrait(target, Printable)?.print()).toBe('custom print');
      expect(useTrait(target, Displayable)?.display()).toBe('custom display');
    });
  });
});
