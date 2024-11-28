import { derive } from '../../src/trait';
import { Clone } from '../../src/traits/clone';

describe('Clone trait', () => {
  // Test basic primitive types
  test('should correctly clone primitive types', () => {
    @derive([Clone])
    class PrimitiveContainer {
      constructor(
        public number: number,
        public string: string,
        public boolean: boolean,
        public nullValue: null,
        public undefinedValue: undefined,
      ) {}
    }
    interface PrimitiveContainer extends Clone {}

    const obj = new PrimitiveContainer(42, 'test', true, null, undefined);
    const cloned = obj.clone();

    expect(cloned).not.toBe(obj);
    expect(cloned.number).toBe(42);
    expect(cloned.string).toBe('test');
    expect(cloned.boolean).toBe(true);
    expect(cloned.nullValue).toBeNull();
    expect(cloned.undefinedValue).toBeUndefined();
  });

  // Test arrays with different types
  test('should handle arrays of different types', () => {
    @derive([Clone])
    class ArrayContainer {
      constructor(
        public numbers: number[],
        public mixed: any[],
        public nested: number[][],
        public empty: never[],
      ) {}
    }
    interface ArrayContainer extends Clone {}

    const obj = new ArrayContainer(
      [1, 2, 3],
      [1, 'string', true, { x: 1 }],
      [
        [1, 2],
        [3, 4],
      ],
      [],
    );
    const cloned = obj.clone();

    expect(cloned.numbers).toEqual([1, 2, 3]);
    expect(cloned.numbers).not.toBe(obj.numbers);
    expect(cloned.mixed).toEqual([1, 'string', true, { x: 1 }]);
    expect(cloned.mixed[3]).not.toBe(obj.mixed[3]);
    expect(cloned.nested).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(cloned.nested[0]).not.toBe(obj.nested[0]);
    expect(cloned.empty).toEqual([]);
  });

  // Test complex object structures
  test('should handle complex nested objects', () => {
    @derive([Clone])
    class ComplexObject {
      constructor(
        public nested: { x: number; y: { z: string } },
        public list: number[],
        public child?: ComplexObject,
      ) {}
    }
    interface ComplexObject extends Clone {}

    const obj = new ComplexObject(
      { x: 1, y: { z: 'test' } },
      [1, 2, 3],
      new ComplexObject({ x: 3, y: { z: 'nested' } }, [5, 6]),
    );

    const cloned = obj.clone();

    // Verify different object instances
    expect(cloned).not.toBe(obj);
    expect(cloned instanceof ComplexObject).toBeTruthy();

    // Verify nested objects are deeply cloned
    expect(cloned.nested).not.toBe(obj.nested);
    expect(cloned.nested.y).not.toBe(obj.nested.y);
    expect(cloned.nested).toEqual(obj.nested);

    // Verify modifications don't affect original
    cloned.nested.y.z = 'modified';
    expect(obj.nested.y.z).toBe('test');
  });

  // Test special object types
  test('should handle special object types', () => {
    @derive([Clone])
    class SpecialObject {
      constructor(
        public date: Date,
        public regex: RegExp,
        public set: Set<any>,
        public map: Map<string, any>,
        public error: Error,
        public typedArray: Uint8Array,
      ) {}
    }
    interface SpecialObject extends Clone {}

    const obj = new SpecialObject(
      new Date('2024-01-01'),
      /test/gi,
      new Set([1, { x: 2 }, [3]]),
      new Map<string, any>([
        ['key1', { x: 1 }],
        ['key2', [1, 2, 3]],
        ['key3', new Set([4, 5])],
      ]),
      new Error('test error'),
      new Uint8Array([1, 2, 3]),
    );

    const cloned = obj.clone();

    // Verify Date
    expect(cloned.date).not.toBe(obj.date);
    expect(cloned.date.getTime()).toBe(obj.date.getTime());

    // Verify RegExp
    expect(cloned.regex).not.toBe(obj.regex);
    expect(cloned.regex.source).toBe(obj.regex.source);
    expect(cloned.regex.flags).toBe(obj.regex.flags);

    // Verify Set with nested objects
    expect(cloned.set).not.toBe(obj.set);
    const setValues = [...obj.set];
    const clonedSetValues = [...cloned.set];
    expect(clonedSetValues).toEqual(setValues);
    expect(clonedSetValues[1]).not.toBe(setValues[1]);

    // Verify Map with complex values
    expect(cloned.map).not.toBe(obj.map);
    expect(cloned.map.size).toBe(obj.map.size);
    expect(cloned.map.get('key1')).toEqual({ x: 1 });
    expect(cloned.map.get('key1')).not.toBe(obj.map.get('key1'));
    expect(cloned.map.get('key2')).toEqual([1, 2, 3]);
    expect(cloned.map.get('key2')).not.toBe(obj.map.get('key2'));
    expect(cloned.map.get('key3')).toEqual(new Set([4, 5]));
    expect(cloned.map.get('key3')).not.toBe(obj.map.get('key3'));

    // Verify Error
    expect(cloned.error).not.toBe(obj.error);
    expect(cloned.error.message).toBe(obj.error.message);
    expect(cloned.error.stack).toBe(obj.error.stack);

    // Verify TypedArray
    expect(cloned.typedArray).not.toBe(obj.typedArray);
    expect([...cloned.typedArray]).toEqual([...obj.typedArray]);
  });

  // Test circular references
  test('should handle complex circular references', () => {
    @derive([Clone])
    class Node {
      constructor(
        public value: any,
        public parent?: Node,
        public children: Node[] = [],
      ) {}
    }
    interface Node extends Clone {}

    // Create a tree-like structure with circular references
    const root = new Node('root');
    const child1 = new Node('child1');
    const child2 = new Node('child2');
    const grandChild = new Node('grandChild');

    root.children.push(child1, child2);
    child1.parent = root;
    child2.parent = root;
    child1.children.push(grandChild);
    grandChild.parent = child1;

    // Add circular reference between siblings
    child1.children.push(child2);
    child2.children.push(child1);

    const cloned = root.clone();

    // Verify structure
    expect(cloned).not.toBe(root);
    expect(cloned.children[0]).not.toBe(child1);
    expect(cloned.children[1]).not.toBe(child2);

    // Verify circular references are maintained
    expect(cloned.children[0].parent).toBe(cloned);
    expect(cloned.children[1].parent).toBe(cloned);
    expect(cloned.children[0].children[0].parent).toBe(cloned.children[0]);

    // Verify sibling circular references
    expect(cloned.children[0].children[1]).toBe(cloned.children[1]);
    expect(cloned.children[1].children[0]).toBe(cloned.children[0]);
  });

  // Test inheritance
  test('should handle class inheritance', () => {
    @derive([Clone])
    class Animal {
      constructor(public name: string) {}
      makeSound(): string {
        return 'generic sound';
      }
    }
    interface Animal extends Clone {}

    class Dog extends Animal {
      constructor(
        name: string,
        public breed: string,
      ) {
        super(name);
      }
      makeSound(): string {
        return 'woof';
      }
    }
    interface Dog extends Clone {}

    const dog = new Dog('Rex', 'German Shepherd');
    const cloned = dog.clone();

    expect(cloned).not.toBe(dog);
    expect(cloned instanceof Dog).toBeTruthy();
    expect(cloned instanceof Animal).toBeTruthy();
    expect(cloned.name).toBe('Rex');
    expect(cloned.breed).toBe('German Shepherd');
    expect(cloned.makeSound()).toBe('woof');
  });

  // Test with getters and setters
  test('should handle getters and setters', () => {
    @derive([Clone])
    class Rectangle {
      private _width: number;
      private _height: number;

      constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
      }

      get width() {
        return this._width;
      }
      set width(value: number) {
        this._width = value;
      }

      get height() {
        return this._height;
      }
      set height(value: number) {
        this._height = value;
      }

      get area() {
        return this._width * this._height;
      }
    }
    interface Rectangle extends Clone {}

    const rect = new Rectangle(10, 20);
    const cloned = rect.clone();

    expect(cloned).not.toBe(rect);
    expect(cloned.width).toBe(10);
    expect(cloned.height).toBe(20);
    expect(cloned.area).toBe(200);

    cloned.width = 5;
    expect(cloned.area).toBe(100);
    expect(rect.area).toBe(200);
  });

  // Test should perform deep clone with nested objects
  test('should perform deep clone with nested objects', () => {
    @derive([Clone])
    class ComplexObject {
      constructor(
        public nested: { x: number; y: number },
        public list: number[],
        public child?: ComplexObject,
      ) {}
    }
    interface ComplexObject extends Clone {}

    const obj = new ComplexObject({ x: 1, y: 2 }, [1, 2, 3], new ComplexObject({ x: 3, y: 4 }, [5, 6]));

    const cloned = obj.clone();

    // Verify different object instances
    expect(cloned).not.toBe(obj);
    expect(cloned instanceof ComplexObject).toBeTruthy();

    // Verify nested objects are deeply cloned
    expect(cloned.nested).not.toBe(obj.nested);
    expect(cloned.nested).toEqual(obj.nested);

    // Verify arrays are deeply cloned
    expect(cloned.list).not.toBe(obj.list);
    expect(cloned.list).toEqual(obj.list);

    // Verify nested ComplexObject is correctly cloned
    expect(cloned.child).not.toBe(obj.child);
    expect(cloned.child instanceof ComplexObject).toBeTruthy();
    expect(cloned.child?.nested).not.toBe(obj.child?.nested);
    expect(cloned.child?.nested).toEqual(obj.child?.nested);

    // Verify modifications don't affect original object
    cloned.nested.x = 100;
    cloned.list[0] = 999;
    expect(obj.nested.x).toBe(1);
    expect(obj.list[0]).toBe(1);
  });

  // Test should perform deep clone with special types
  test('should perform deep clone with special types', () => {
    @derive([Clone])
    class SpecialObject {
      constructor(
        public date: Date,
        public regex: RegExp,
        public set: Set<number>,
        public map: Map<string, any>,
        public error: Error,
      ) {}
    }
    interface SpecialObject extends Clone {}

    const originalDate = new Date('2024-01-01');
    const originalError = new Error('test error');
    const obj = new SpecialObject(
      originalDate,
      /test/gi,
      new Set([1, 2, 3]),
      new Map<string, any>([
        ['key1', { x: 1 }],
        ['key2', [1, 2, 3]],
        ['key3', new Set([4, 5])],
      ]),
      originalError,
    );

    const cloned = obj.clone();

    // Verify different object instances
    expect(cloned).not.toBe(obj);
    expect(cloned instanceof SpecialObject).toBeTruthy();

    // Verify Date is deeply cloned
    expect(cloned.date).not.toBe(obj.date);
    expect(cloned.date.getTime()).toBe(obj.date.getTime());

    // Verify RegExp is deeply cloned
    expect(cloned.regex).not.toBe(obj.regex);
    expect(cloned.regex.source).toBe(obj.regex.source);
    expect(cloned.regex.flags).toBe(obj.regex.flags);

    // Verify Set is deeply cloned
    expect(cloned.set).not.toBe(obj.set);
    expect([...cloned.set]).toEqual([...obj.set]);

    // Verify Map is deeply cloned
    expect(cloned.map).not.toBe(obj.map);
    expect(cloned.map.get('key1')).toEqual(obj.map.get('key1'));
    expect(cloned.map.get('key1')).not.toBe(obj.map.get('key1')); // Nested objects are also cloned
    expect(cloned.map.get('key2')).toEqual(obj.map.get('key2'));
    expect(cloned.map.get('key2')).not.toBe(obj.map.get('key2')); // Nested arrays are also cloned

    // Verify Error is deeply cloned
    expect(cloned.error).not.toBe(obj.error);
    expect(cloned.error.message).toBe(obj.error.message);
    expect(cloned.error.stack).toBe(obj.error.stack);
  });

  // Test should handle circular references
  test('should handle circular references', () => {
    @derive([Clone])
    class CircularObject {
      constructor(public name: string) {}
      public self?: CircularObject;
      public parent?: CircularObject;
    }
    interface CircularObject extends Clone {}

    const obj1 = new CircularObject('obj1');
    const obj2 = new CircularObject('obj2');
    obj1.self = obj1; // Self-reference
    obj1.parent = obj2;
    obj2.parent = obj1; // Circular reference

    const cloned = obj1.clone();

    // Verify basic properties are correctly cloned
    expect(cloned.name).toBe('obj1');
    expect(cloned).not.toBe(obj1);

    // Verify self-reference is handled correctly
    expect(cloned.self).toBe(cloned);

    // Verify circular reference is handled correctly
    expect(cloned.parent).not.toBe(obj2);
    expect(cloned.parent?.name).toBe('obj2');
    expect(cloned.parent?.parent).toBe(cloned);
  });

  // Test edge cases and special scenarios
  test('should handle edge cases', () => {
    @derive([Clone])
    class EdgeCaseContainer {
      constructor(
        // Special numbers
        public infinity: number,
        public negInfinity: number,
        public nan: number,
        // Empty containers
        public emptyMap: Map<string, any>,
        public emptySet: Set<any>,
        public emptyArray: any[],
        public emptyObject: object,
        // Function properties
        public func: Function,
        // Symbol properties
        public symbol: Symbol,
        public symbolKey: { [Symbol.iterator]: Function },
      ) {}
    }
    interface EdgeCaseContainer extends Clone {}

    const obj = new EdgeCaseContainer(
      Infinity,
      -Infinity,
      NaN,
      new Map(),
      new Set(),
      [],
      {},
      () => 'test',
      Symbol('test'),
      {
        [Symbol.iterator]: function* () {
          yield 1;
        },
      },
    );

    const cloned = obj.clone();

    expect(cloned instanceof EdgeCaseContainer).toBeTruthy();
    // Verify special numbers
    expect(cloned.infinity).toBe(Infinity);
    expect(cloned.negInfinity).toBe(-Infinity);
    expect(Number.isNaN(cloned.nan)).toBeTruthy();

    // Verify empty containers
    expect(cloned.emptyMap).not.toBe(obj.emptyMap);
    expect(cloned.emptyMap.size).toBe(0);
    expect(cloned.emptySet).not.toBe(obj.emptySet);
    expect(cloned.emptySet.size).toBe(0);
    expect(cloned.emptyArray).not.toBe(obj.emptyArray);
    expect(cloned.emptyArray.length).toBe(0);
    expect(cloned.emptyObject).not.toBe(obj.emptyObject);
    expect(Object.keys(cloned.emptyObject).length).toBe(0);

    // Verify function (should maintain reference)
    expect(cloned.func).toBe(obj.func);
    expect(cloned.func()).toBe('test');

    // Verify symbol
    expect(cloned.symbol).toBe(obj.symbol);
    expect(typeof cloned.symbolKey[Symbol.iterator]).toBe('function');
  });

  // Test for property descriptors preservation
  test('should preserve property descriptors', () => {
    @derive([Clone])
    class PropertyContainer {
      private _value: number = 0;
      public readonlyValue: number = 42;

      get value(): number {
        return this._value;
      }

      set value(v: number) {
        this._value = v;
      }
    }
    interface PropertyContainer extends Clone {}

    const obj = new PropertyContainer();
    const cloned = obj.clone();

    // Test getter/setter
    obj.value = 10;
    cloned.value = 20;
    expect(obj.value).toBe(10);
    expect(cloned.value).toBe(20);

    // Verify property descriptors are preserved
    const originalDescriptor = Object.getOwnPropertyDescriptor(obj, 'readonlyValue');
    const clonedDescriptor = Object.getOwnPropertyDescriptor(cloned, 'readonlyValue');
    expect(clonedDescriptor?.writable).toBe(originalDescriptor?.writable);
    expect(clonedDescriptor?.configurable).toBe(originalDescriptor?.configurable);
  });

  // Test for prototype chain and method preservation
  test('should preserve prototype chain and methods', () => {
    @derive([Clone])
    class BaseClass {
      constructor(public baseField: string) {}
      baseMethod() {
        return 'base';
      }
    }
    interface BaseClass extends Clone {}

    class MiddleClass extends BaseClass {
      constructor(
        baseField: string,
        public middleField: number,
      ) {
        super(baseField);
      }
      middleMethod() {
        return 'middle';
      }
    }

    class SubClass extends MiddleClass {
      constructor(
        baseField: string,
        middleField: number,
        public subField: boolean,
      ) {
        super(baseField, middleField);
      }
      subMethod() {
        return 'sub';
      }
    }

    const obj = new SubClass('test', 42, true);
    const cloned = obj.clone() as SubClass;

    // Verify instance checks
    expect(cloned instanceof SubClass).toBeTruthy();
    expect(cloned instanceof MiddleClass).toBeTruthy();
    expect(cloned instanceof BaseClass).toBeTruthy();

    // Verify fields
    expect(cloned.baseField).toBe('test');
    expect(cloned.middleField).toBe(42);
    expect(cloned.subField).toBe(true);

    // Verify methods
    expect(cloned.baseMethod()).toBe('base');
    expect(cloned.middleMethod()).toBe('middle');
    expect(cloned.subMethod()).toBe('sub');

    // Verify prototype chain
    expect(Object.getPrototypeOf(cloned)).toBe(SubClass.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(cloned))).toBe(MiddleClass.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(cloned)))).toBe(BaseClass.prototype);
  });
});
