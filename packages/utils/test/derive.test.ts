import { derive, deriveType } from '../src/derive';
import { Constructor } from '../src/common';

describe('derive', () => {
  // Example derive functions
  function addProperty(target: Constructor<any>) {
    Object.defineProperty(target.prototype, 'derivedProp', {
      value: 'derived',
      writable: false,
    });
  }

  function addMethod(target: Constructor<any>) {
    target.prototype.derivedMethod = function() {
      return 'method';
    };
  }

  function addStatic(target: Constructor<any>) {
    Object.defineProperty(target, 'staticProp', {
      value: 'static',
      writable: false,
    });
  }

  test('should apply single derive function', () => {
    @derive([addProperty])
    class TestClass {}

    const instance = new TestClass();
    expect((instance as any).derivedProp).toBe('derived');
  });

  test('should apply multiple derive functions in sequence', () => {
    @derive([addProperty, addMethod, addStatic])
    class TestClass {}

    const instance = new TestClass();
    expect((instance as any).derivedProp).toBe('derived');
    expect((instance as any).derivedMethod()).toBe('method');
    expect((TestClass as any).staticProp).toBe('static');
  });

  test('should preserve original class properties', () => {
    @derive([addProperty])
    class TestClass {
      constructor(public value: string) {}
      
      method() {
        return this.value;
      }
    }

    const instance = new TestClass('test');
    expect(instance.value).toBe('test');
    expect(instance.method()).toBe('test');
    expect((instance as any).derivedProp).toBe('derived');
  });

  test('should work with type-safe deriveType', () => {
    const MyDerive = deriveType([addProperty, addMethod]);

    @MyDerive
    class TestClass {
      constructor(public value: string) {}
    }

    const instance = new TestClass('test');
    // Original properties are type-safe
    instance.value = 'new value';
    expect(instance.value).toBe('new value');
    
    // Derived properties need type assertion
    expect((instance as any).derivedProp).toBe('derived');
    expect((instance as any).derivedMethod()).toBe('method');
  });

  test('should support derive functions with additional parameters', () => {
    function parameterizedDerive(target: Constructor<any>, prefix: string) {
      target.prototype.getName = function() {
        return prefix + this.name;
      };
    }

    @derive([
      target => parameterizedDerive(target, 'test_')
    ])
    class TestClass {
      name = 'class';
    }

    const instance = new TestClass();
    expect((instance as any).getName()).toBe('test_class');
  });
});
