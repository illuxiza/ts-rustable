import { describe, expect, test } from '@jest/globals';
import { typeId } from '../src/type_id';

describe('TypeId System', () => {
  describe('typeId Generation', () => {
    test('should generate unique IDs for different types', () => {
      class Type1 {}
      class Type2 {}
      class Type3 {}

      const id1 = typeId(Type1);
      const id2 = typeId(Type2);
      const id3 = typeId(Type3);

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    test('should return same ID for same type', () => {
      class TestType {}

      const id1 = typeId(TestType);
      const id2 = typeId(TestType);
      const id3 = typeId(TestType);

      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
    });

    test('should work with object instances', () => {
      class TestType {}
      const instance1 = new TestType();
      const instance2 = new TestType();

      const id1 = typeId(TestType);
      const id2 = typeId(instance1);
      const id3 = typeId(instance2);

      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
    });

    test('should throw for invalid inputs', () => {
      expect(() => typeId(null)).toThrow('Cannot get typeId of null or undefined');
      expect(() => typeId(undefined)).toThrow('Cannot get typeId of null or undefined');
    });

    test('should work with built-in types', () => {
      const stringId = typeId(String);
      const numberId = typeId(Number);
      const booleanId = typeId(Boolean);
      const arrayId = typeId(Array);
      const objectId = typeId(Object);

      expect(stringId).not.toBe(numberId);
      expect(numberId).not.toBe(booleanId);
      expect(booleanId).not.toBe(arrayId);
      expect(arrayId).not.toBe(objectId);
    });

    test('should work with primitive values', () => {
      const str = 'test';
      const num = 42;
      const bool = true;

      const strId = typeId(str);
      const numId = typeId(num);
      const boolId = typeId(bool);

      expect(strId).toBe(typeId(String));
      expect(numId).toBe(typeId(Number));
      expect(boolId).toBe(typeId(Boolean));
    });
  });

  describe('Generic Type Cases', () => {
    test('should generate different IDs for different generic type parameters', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Container<T> {}

      const stringContainerId = typeId(Container, [String]);
      const numberContainerId = typeId(Container, [Number]);
      const booleanContainerId = typeId(Container, [Boolean]);

      expect(stringContainerId).not.toBe(numberContainerId);
      expect(numberContainerId).not.toBe(booleanContainerId);
      expect(stringContainerId).not.toBe(booleanContainerId);
    });

    test('should return same ID for same generic type parameters', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Container<T> {}

      const id1 = typeId(Container, [String]);
      const id2 = typeId(Container, [String]);
      const id3 = typeId(Container, [String]);

      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
    });

    test('should work with nested generic types', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Container<T> {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class NestedContainer<T, U> {}

      const singleId = typeId(Container, [Number]);
      const nestedId1 = typeId(NestedContainer, [Container, String]);
      const nestedId2 = typeId(NestedContainer, [Container, Number]);

      expect(nestedId1).not.toBe(nestedId2);
      expect(singleId).not.toBe(nestedId1);
      expect(singleId).not.toBe(nestedId2);
    });

    test('should handle complex generic type hierarchies', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Base<T> {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Derived<T, U> extends Base<T> {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Complex<T, U, V> extends Derived<T, U> {}

      const baseId = typeId(Base, [String]);
      const derivedId = typeId(Derived, [String, Number]);
      const complexId = typeId(Complex, [String, Number, Boolean]);

      expect(baseId).not.toBe(derivedId);
      expect(derivedId).not.toBe(complexId);
      expect(baseId).not.toBe(complexId);
    });

    test('should handle array type parameters', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Container<T> {}

      const numberArrayId = typeId(Container, [Array, Number]);
      const stringArrayId = typeId(Container, [Array, String]);
      const simpleNumberId = typeId(Container, [Number]);

      expect(numberArrayId).not.toBe(stringArrayId);
      expect(numberArrayId).not.toBe(simpleNumberId);
      expect(stringArrayId).not.toBe(simpleNumberId);
    });

    test('should work with generic instances', () => {
      class Container<T> {
        constructor(private value: T) {}
      }

      const stringContainer = new Container('test');
      const numberContainer = new Container(42);

      const stringTypeId = typeId(Container, [String]);
      const numberTypeId = typeId(Container, [Number]);
      const instanceStringId = typeId(stringContainer.constructor, [String]);
      const instanceNumberId = typeId(numberContainer.constructor, [Number]);

      expect(stringTypeId).toBe(instanceStringId);
      expect(numberTypeId).toBe(instanceNumberId);
      expect(stringTypeId).not.toBe(numberTypeId);
    });
  });

  describe('Inheritance Cases', () => {
    test('should generate different IDs for base and derived classes', () => {
      class Base {}
      class Derived extends Base {}
      class AnotherDerived extends Base {}

      const baseId = typeId(Base);
      const derivedId = typeId(Derived);
      const anotherDerivedId = typeId(AnotherDerived);

      expect(baseId).not.toBe(derivedId);
      expect(baseId).not.toBe(anotherDerivedId);
      expect(derivedId).not.toBe(anotherDerivedId);
    });

    test('should maintain ID consistency with multi-level inheritance', () => {
      class GrandParent {}
      class Parent extends GrandParent {}
      class Child extends Parent {}

      const grandParentId = typeId(GrandParent);
      const parentId = typeId(Parent);
      const childId = typeId(Child);

      // Each level should have its own unique ID
      expect(grandParentId).not.toBe(parentId);
      expect(parentId).not.toBe(childId);
      expect(grandParentId).not.toBe(childId);

      // IDs should be consistent
      expect(typeId(GrandParent)).toBe(grandParentId);
      expect(typeId(Parent)).toBe(parentId);
      expect(typeId(Child)).toBe(childId);
    });

    test('should handle instances of inherited classes correctly', () => {
      class Animal {}
      class Dog extends Animal {}
      class Cat extends Animal {}

      const dog = new Dog();
      const cat = new Cat();
      const animal = new Animal();

      // Instance IDs should match their class IDs
      expect(typeId(dog)).toBe(typeId(Dog));
      expect(typeId(cat)).toBe(typeId(Cat));
      expect(typeId(animal)).toBe(typeId(Animal));

      // Different class hierarchies should have different IDs
      expect(typeId(dog)).not.toBe(typeId(cat));
      expect(typeId(dog)).not.toBe(typeId(animal));
      expect(typeId(cat)).not.toBe(typeId(animal));
    });

    test('should work with abstract classes and inheritance', () => {
      abstract class Shape {
        abstract getArea(): number;
      }

      class Circle extends Shape {
        constructor(private radius: number) {
          super();
        }
        getArea(): number {
          return Math.PI * this.radius * this.radius;
        }
      }

      class Rectangle extends Shape {
        constructor(
          private width: number,
          private height: number,
        ) {
          super();
        }
        getArea(): number {
          return this.width * this.height;
        }
      }

      const circle = new Circle(5);
      const rectangle = new Rectangle(4, 6);

      // Abstract base class should have its own typeId
      expect(typeId(Shape)).not.toBe(typeId(Circle));
      expect(typeId(Shape)).not.toBe(typeId(Rectangle));

      // Concrete implementations should have different IDs
      expect(typeId(Circle)).not.toBe(typeId(Rectangle));

      // Instances should match their class IDs
      expect(typeId(circle)).toBe(typeId(Circle));
      expect(typeId(rectangle)).toBe(typeId(Rectangle));
    });

    test('should handle interfaces and implementation inheritance', () => {
      interface Drawable {
        draw(): void;
      }

      abstract class UIComponent implements Drawable {
        abstract draw(): void;
      }

      class Button extends UIComponent {
        draw(): void {
          // Implementation
        }
      }

      class Icon extends UIComponent {
        draw(): void {
          // Implementation
        }
      }

      const button = new Button();
      const icon = new Icon();

      // Each concrete class should have unique ID
      expect(typeId(UIComponent)).not.toBe(typeId(Button));
      expect(typeId(UIComponent)).not.toBe(typeId(Icon));
      expect(typeId(Button)).not.toBe(typeId(Icon));

      // Instances should match their class IDs
      expect(typeId(button)).toBe(typeId(Button));
      expect(typeId(icon)).toBe(typeId(Icon));
    });
  });
});
