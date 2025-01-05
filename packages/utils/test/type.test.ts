import { Type } from '../src/type';

describe('Type', () => {
  class TestClass {
    constructor(public value: string) {}

    method() {
      return this.value;
    }
  }

  class GenericClass<T> {
    constructor(public data: T) {}

    getData() {
      return this.data;
    }
  }

  test('should create instances of the target class', () => {
    const TypedTestClass = Type(TestClass);
    const instance = new TypedTestClass('test');

    expect(instance).toBeInstanceOf(TestClass);
    expect(instance.value).toBe('test');
    expect(instance.method()).toBe('test');
  });

  test('should cache type constructors', () => {
    const TypedTestClass1 = Type(TestClass);
    const TypedTestClass2 = Type(TestClass);

    expect(TypedTestClass1 === TypedTestClass2).toBe(true);
  });

  test('should work with generic classes', () => {
    const StringGenericClass = Type(GenericClass, [String]);
    const NumberGenericClass = Type(GenericClass, [Number]);

    const stringInstance = new StringGenericClass('test');
    const numberInstance = new NumberGenericClass(42);

    expect(stringInstance).toBeInstanceOf(GenericClass);
    expect(numberInstance).toBeInstanceOf(GenericClass);

    expect(stringInstance.data).toBe('test');
    expect(numberInstance.data).toBe(42);

    expect(stringInstance.getData()).toBe('test');
    expect(numberInstance.getData()).toBe(42);
  });

  test('should cache generic types separately', () => {
    const StringGenericClass1 = Type(GenericClass, [String]);
    const StringGenericClass2 = Type(GenericClass, [String]);
    const NumberGenericClass = Type(GenericClass, [Number]);

    expect(StringGenericClass1 === StringGenericClass2).toBe(true);
    expect(StringGenericClass1 === NumberGenericClass).toBe(false);
  });

  test('should preserve static members', () => {
    class StaticClass {
      static readonly VERSION = '1.0.0';
      static helper() {
        return 'help';
      }
      static config = {
        setting: true,
      };
    }

    const TypedStaticClass = Type(StaticClass);
    expect(TypedStaticClass.VERSION).toBe('1.0.0');
    expect(TypedStaticClass.helper()).toBe('help');
    expect(TypedStaticClass.config.setting).toBe(true);

    // Verify that static properties are properly typed
    const version: string = TypedStaticClass.VERSION;
    const setting: boolean = TypedStaticClass.config.setting;

    expect(version).toBe('1.0.0');
    expect(setting).toBe(true);
  });

  test('should work with inheritance', () => {
    class BaseClass {
      constructor(public name: string) {}
      getName() {
        return this.name;
      }
    }

    class ChildClass extends BaseClass {
      constructor(
        name: string,
        public age: number,
      ) {
        super(name);
      }
      getAge() {
        return this.age;
      }
    }

    const TypedChildClass = Type(ChildClass);
    const instance = new TypedChildClass('test', 25);

    expect(instance).toBeInstanceOf(ChildClass);
    expect(instance).toBeInstanceOf(BaseClass);
    expect(instance.getName()).toBe('test');
    expect(instance.getAge()).toBe(25);
  });

  test('should set correct name for generic types', () => {
    // Single generic parameter
    const StringGenericClass = Type(GenericClass, [String]);
    expect(StringGenericClass.name).toBe('GenericClass<String>');

    // Multiple generic parameters
    class MultiGenericClass<T, U> {
      constructor(public first: T, public second: U) {}
    }
    const StringNumberClass = Type(MultiGenericClass, [String, Number]);
    expect(StringNumberClass.name).toBe('MultiGenericClass<String,Number>');

    // Nested generic parameters
    const ArrayStringClass = Type(GenericClass, [Array]);
    expect(ArrayStringClass.name).toBe('GenericClass<Array>');

    // Custom class as generic parameter
    class CustomClass {}
    const CustomGenericClass = Type(GenericClass, [CustomClass]);
    expect(CustomGenericClass.name).toBe('GenericClass<CustomClass>');
  });

  test('should handle complex generic parameter names', () => {
    // Function as generic parameter
    function customFn() {}
    const FunctionGenericClass = Type(GenericClass, [customFn]);
    expect(FunctionGenericClass.name).toBe('GenericClass<customFn>');

    // Object as generic parameter
    const obj = { toString: () => 'CustomObject' };
    const ObjectGenericClass = Type(GenericClass, [obj]);
    expect(ObjectGenericClass.name).toBe('GenericClass<CustomObject>');

    // Primitive values as generic parameters
    const NumberValueClass = Type(GenericClass, [42]);
    expect(NumberValueClass.name).toBe('GenericClass<42>');

    const StringValueClass = Type(GenericClass, ['test']);
    expect(StringValueClass.name).toBe('GenericClass<test>');
  });
});
