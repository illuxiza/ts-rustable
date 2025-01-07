import { createFactory } from '../src/factory';

describe('createFactory', () => {
  class TestClass {
    constructor(
      public name: string,
      public age: number,
    ) {
      this.name = name;
      this.age = age;
    }

    static version = '1.0.0';

    static getVersion() {
      return TestClass.version;
    }

    static config = {
      debug: true,
      env: 'test',
    };

    getName() {
      return this.name;
    }

    getAge() {
      return this.age;
    }
  }

  const FactoryClass = createFactory(TestClass);

  it('should create instance without new keyword', () => {
    const instance = FactoryClass('John', 25);
    expect(instance).toBeInstanceOf(TestClass);
    expect(instance.name).toBe('John');
    expect(instance.age).toBe(25);
    expect(instance.getName()).toBe('John');
    expect(instance.getAge()).toBe(25);
  });

  it('should create instance with new keyword', () => {
    const instance = new FactoryClass('Jane', 30);
    expect(instance).toBeInstanceOf(TestClass);
    expect(instance.name).toBe('Jane');
    expect(instance.age).toBe(30);
    expect(instance.getName()).toBe('Jane');
    expect(instance.getAge()).toBe(30);
  });

  it('should inherit static properties and methods', () => {
    expect(FactoryClass.version).toBe('1.0.0');
    expect(FactoryClass.getVersion()).toBe('1.0.0');
    expect(FactoryClass.config).toEqual({
      debug: true,
      env: 'test',
    });
  });

  it('should maintain prototype chain', () => {
    const instance1 = FactoryClass('John', 25);
    const instance2 = new FactoryClass('Jane', 30);

    expect(instance1).toBeInstanceOf(TestClass);
    expect(instance2).toBeInstanceOf(TestClass);
    expect(Object.getPrototypeOf(instance1)).toBe(TestClass.prototype);
    expect(Object.getPrototypeOf(instance2)).toBe(TestClass.prototype);
    expect(instance1.constructor).toBe(TestClass);
    expect(instance2.constructor).toBe(TestClass);
  });

  it('should handle object properties correctly', () => {
    // Test that object properties are not shared between instances
    const instance1 = FactoryClass('John', 25);
    const instance2 = FactoryClass('Jane', 30);

    instance1.name = 'John Modified';
    expect(instance2.name).toBe('Jane');
  });
});

describe('createFactory', () => {
  class TestClass {
    constructor(
      public name: string,
      public age: number,
    ) {
      this.name = name;
      this.age = age;
    }

    static version = '1.0.0';

    static getVersion() {
      return TestClass.version;
    }

    getName() {
      return this.name;
    }

    getAge() {
      return this.age;
    }
  }

  const customFn = (name: string, age: number) => {
    return new TestClass(`Custom_${name}`, age + 1);
  };

  const CustomFactoryClass = createFactory(TestClass, customFn);

  it('should use custom function when called without new keyword', () => {
    const instance = CustomFactoryClass('John', 25);
    expect(instance).toBeInstanceOf(TestClass);
    expect(instance.name).toBe('Custom_John');
    expect(instance.age).toBe(26);
    expect(instance.getName()).toBe('Custom_John');
    expect(instance.getAge()).toBe(26);
  });

  it('should use original class when called with new keyword', () => {
    const instance = new CustomFactoryClass('Jane', 30);
    expect(instance).toBeInstanceOf(TestClass);
    expect(instance.name).toBe('Jane');
    expect(instance.age).toBe(30);
    expect(instance.getName()).toBe('Jane');
    expect(instance.getAge()).toBe(30);
  });

  it('should preserve static properties and methods', () => {
    expect(CustomFactoryClass.version).toBe('1.0.0');
    expect(CustomFactoryClass.getVersion()).toBe('1.0.0');
  });

  it('should maintain prototype chain', () => {
    const instance = CustomFactoryClass('Test', 20);
    expect(Object.getPrototypeOf(instance)).toBe(TestClass.prototype);

    const newInstance = new CustomFactoryClass('Test', 20);
    expect(Object.getPrototypeOf(newInstance)).toBe(TestClass.prototype);
  });
});

describe('createFactory with array return', () => {
  class ArrayClass {
    constructor(size: number) {
      this.size = size;
    }
    size: number;

    static defaultSize = 3;

    toArray() {
      return new Array(this.size).fill(0);
    }
  }

  it('should handle custom function returning array', () => {
    const arrayFactory = createFactory(ArrayClass, (size: number) => new Array(size).fill(1));

    // When called without new, should return array from custom function
    const result = arrayFactory(5);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(5);
    expect(result).toEqual([1, 1, 1, 1, 1]);

    // When called with new, should return ArrayClass instance
    const instance = new arrayFactory(5);
    expect(instance).toBeInstanceOf(ArrayClass);
    expect(instance.size).toBe(5);
    expect(instance.toArray()).toEqual([0, 0, 0, 0, 0]);

    // Static properties should be preserved
    expect(arrayFactory.defaultSize).toBe(3);
  });
});

describe('createFactory with different class return', () => {
  class SourceClass {
    constructor(public value: number) {}

    static defaultValue = 100;

    getValue() {
      return this.value;
    }
  }

  class TargetClass {
    constructor(
      public id: string,
      public data: number,
    ) {}

    getId() {
      return this.id;
    }

    getData() {
      return this.data;
    }
  }

  it('should handle custom function returning different class instance', () => {
    const factory = createFactory(SourceClass, (value: number) => new TargetClass(`id_${value}`, value * 2));

    // When called without new, should return TargetClass instance
    const result = factory(50);
    expect(result).toBeInstanceOf(TargetClass);
    expect(result.getId()).toBe('id_50');
    expect(result.getData()).toBe(100);
    expect(result instanceof SourceClass).toBe(false);

    // When called with new, should return SourceClass instance
    const instance = new factory(50);
    expect(instance).toBeInstanceOf(SourceClass);
    expect(instance.getValue()).toBe(50);
    expect(instance instanceof TargetClass).toBe(false);

    // Static properties should be preserved
    expect(factory.defaultValue).toBe(100);
  });

  it('should handle custom function with explicit generic types', () => {
    const complexFactory = createFactory(SourceClass, (value: number) => ({
      originalValue: value,
      sourceInstance: new SourceClass(value),
      targetInstance: new TargetClass(`id_${value}`, value * 2),
    }));

    // When called without new, should return custom object
    const result = complexFactory(25);
    expect(result.originalValue).toBe(25);
    expect(result.sourceInstance).toBeInstanceOf(SourceClass);
    expect(result.sourceInstance.getValue()).toBe(25);
    expect(result.targetInstance).toBeInstanceOf(TargetClass);
    expect(result.targetInstance.getId()).toBe('id_25');
    expect(result.targetInstance.getData()).toBe(50);

    // When called with new, should still return SourceClass instance
    const instance = new complexFactory(25);
    expect(instance).toBeInstanceOf(SourceClass);
    expect(instance.getValue()).toBe(25);
  });
});

describe('createFactory with inheritance', () => {
  class BaseClass {
    constructor(public name: string) {}

    static version = '1.0.0';

    getName() {
      return this.name;
    }

    greet() {
      return `Hello, ${this.name}!`;
    }
  }

  const FactoryBaseClass = createFactory(BaseClass);

  class DerivedClass extends FactoryBaseClass {
    constructor(
      name: string,
      public role: string,
    ) {
      super(name);
    }

    greet() {
      return `Hello, ${this.name} (${this.role})!`;
    }
  }

  const DerivedClassFactory = createFactory(DerivedClass);

  it('should allow inheritance from factory-created class', () => {
    const derived = new DerivedClass('John', 'Admin');
    expect(derived).toBeInstanceOf(DerivedClass);
    expect(derived).toBeInstanceOf(BaseClass);
    expect(derived.name).toBe('John');
    expect(derived.role).toBe('Admin');
    const derived2 = DerivedClassFactory('Jane', 'User');
    expect(derived2).toBeInstanceOf(DerivedClass);
    expect(derived2).toBeInstanceOf(BaseClass);
    expect(derived2.name).toBe('Jane');
    expect(derived2.role).toBe('User');
  });

  it('should maintain prototype chain in inherited class', () => {
    const derived = new DerivedClass('Jane', 'User');
    expect(Object.getPrototypeOf(derived)).toBe(DerivedClass.prototype);
    expect(Object.getPrototypeOf(DerivedClass.prototype)).toBe(BaseClass.prototype);
    const derived2 = DerivedClassFactory('Jane', 'User');
    expect(Object.getPrototypeOf(derived2)).toBe(DerivedClass.prototype);
    expect(Object.getPrototypeOf(DerivedClassFactory.prototype)).toBe(BaseClass.prototype);
  });

  it('should properly override methods from base class', () => {
    const base = new FactoryBaseClass('Alice');
    const derived = new DerivedClass('Bob', 'Manager');
    const derived2 = DerivedClassFactory('Charlie', 'Developer');

    expect(base.greet()).toBe('Hello, Alice!');
    expect(derived.greet()).toBe('Hello, Bob (Manager)!');
    expect(derived2.greet()).toBe('Hello, Charlie (Developer)!');
  });

  it('should inherit static properties from base class', () => {
    expect(DerivedClass.version).toBe('1.0.0');
  });

  it('should allow using base class methods', () => {
    const derived = new DerivedClass('Tom', 'Developer');
    expect(derived.getName()).toBe('Tom');
  });
});
