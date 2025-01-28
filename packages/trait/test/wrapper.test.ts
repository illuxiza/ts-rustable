import { Trait, trait } from '../src/trait';

describe('Trait', () => {
  @trait
  class TestTrait extends Trait {
    method(): string {
      return 'test';
    }

    static staticMethod(): string {
      return 'static test';
    }
  }

  class TestClass {}

  TestTrait.implFor(TestClass);

  describe('hasTrait', () => {
    it('should return true for implemented trait', () => {
      const instance = new TestClass();
      expect(TestTrait.isImplFor(instance)).toBe(true);
    });

    it('should return false for non-implemented trait', () => {
      class OtherClass {}
      const instance = new OtherClass();
      expect(TestTrait.isImplFor(instance)).toBe(false);
    });
  });

  describe('validType', () => {
    it('should not throw for valid type', () => {
      const instance = new TestClass();
      expect(() => TestTrait.validFor(instance)).not.toThrow();
    });

    it('should throw for invalid type', () => {
      class OtherClass {}
      const instance = new OtherClass();
      expect(() => TestTrait.validFor(instance)).toThrow();
    });
  });

  describe('wrap', () => {
    it('should wrap valid instance', () => {
      const instance = new TestClass();
      const wrapped = TestTrait.wrap(instance);
      expect(wrapped.method()).toBe('test');
    });

    it('should throw for invalid instance', () => {
      class OtherClass {}
      const instance = new OtherClass();
      expect(() => TestTrait.wrap(instance)).toThrow();
    });
  });

  describe('staticWrap', () => {
    it('should wrap valid class', () => {
      const wrapped = TestTrait.staticWrap(TestClass);
      expect(wrapped.staticMethod()).toBe('static test');
    });

    it('should wrap valid instance', () => {
      const instance = new TestClass();
      const wrapped = TestTrait.staticWrap(instance);
      expect(wrapped.staticMethod()).toBe('static test');
    });

    it('should throw for invalid class', () => {
      class OtherClass {}
      expect(() => TestTrait.staticWrap(OtherClass)).toThrow();
    });
  });

  describe('Multiple trait implementations', () => {
    @trait
    class Animal extends Trait {
      speak(): string {
        return 'animal';
      }
    }

    @trait
    class Cat extends Animal {
      speak(): string {
        return 'meow';
      }
    }

    @trait
    class Dog extends Animal {
      speak(): string {
        return 'woof';
      }
    }

    class Pet {
      constructor(public name: string) {}
    }

    Animal.implFor(Pet);
    Cat.implFor(Pet);
    Dog.implFor(Pet);

    it('should use most specific trait implementation when wrapping', () => {
      const pet = new Pet('Fluffy');

      // When wrapping as Animal, should use Animal's implementation
      const animal = Animal.wrap(pet);
      expect(animal.speak()).toBe('animal');

      // When wrapping as Cat, should use Cat's implementation
      const cat = Cat.wrap(pet);
      expect(cat.speak()).toBe('meow');

      // When wrapping as Dog, should use Dog's implementation
      const dog = Dog.wrap(pet);
      expect(dog.speak()).toBe('woof');
    });
  });

  describe('Static methods and implFor', () => {
    it('should handle static methods with multiple implementations', () => {
      @trait
      class StaticAnimal extends Trait {
        static create(name: string): string {
          return `animal:${name}`;
        }
      }

      @trait
      class StaticCat extends StaticAnimal {
        static create(name: string): string {
          return `cat:${name}`;
        }
      }

      @trait
      class StaticDog extends StaticAnimal {
        static create(name: string): string {
          return `dog:${name}`;
        }
      }

      class Pet {
        constructor(public name: string) {}
      }

      StaticAnimal.implFor(Pet);
      StaticCat.implFor(Pet);
      StaticDog.implFor(Pet);

      // When wrapping as different static traits, should use corresponding implementation
      const animalPet = StaticAnimal.staticWrap(Pet);
      const catPet = StaticCat.staticWrap(Pet);
      const dogPet = StaticDog.staticWrap(Pet);

      expect(animalPet.create('test')).toBe('animal:test');
      expect(catPet.create('test')).toBe('cat:test');
      expect(dogPet.create('test')).toBe('dog:test');
    });

    it('should handle implFor with partial implementations', () => {
      @trait
      class ComplexAnimal extends Trait {
        speak(): string {
          return 'animal';
        }

        eat(): string {
          return 'eating';
        }

        sleep(): string {
          return 'sleeping';
        }
      }

      @trait
      class ComplexCat extends ComplexAnimal {
        speak(): string {
          return 'meow';
        }

        eat(): string {
          return 'eating fish';
        }

        sleep(): string {
          return 'cat nap';
        }
      }

      class Pet {
        constructor(public name: string) {}
      }

      // Implement base trait with default implementations
      ComplexAnimal.implFor(Pet);

      // Test partial override of methods
      ComplexCat.implFor(Pet, {
        speak(): string {
          return 'custom meow';
        },
        eat(): string {
          return 'custom eating fish';
        },
        // sleep method not overridden, should use parent implementation
      });

      const pet = new Pet('Fluffy');
      const cat = ComplexCat.wrap(pet);

      expect(cat.speak()).toBe('custom meow');
      expect(cat.eat()).toBe('custom eating fish');
      expect(cat.sleep()).toBe('cat nap');
    });

    it('should handle implFor with method chaining', () => {
      @trait
      class Builder extends Trait {
        value: string = '';

        append(str: string): this {
          this.value += str;
          return this;
        }

        build(): string {
          return this.value;
        }
      }

      class Pet {
        public value = '';
        constructor(public name: string) {}
      }

      Builder.implFor(Pet, {
        append(str: string): any {
          this.value += str.toUpperCase();
          return this;
        },
      });

      const pet = new Pet('test');
      const builder = Builder.wrap(pet);

      expect(builder.append('a').append('b').append('c').build()).toBe('ABC');
    });
  });
});
