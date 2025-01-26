import { implTrait, trait } from '../src/trait';
import { TraitWrapper } from '../src/wrapper';

describe('TraitWrapper', () => {
  @trait
  class TestTrait extends TraitWrapper {
    method(): string {
      return 'test';
    }

    static staticMethod(): string {
      return 'static test';
    }
  }

  class TestClass {}

  implTrait(TestClass, TestTrait);

  describe('hasTrait', () => {
    it('should return true for implemented trait', () => {
      const instance = new TestClass();
      expect(TestTrait.hasTrait(instance)).toBe(true);
    });

    it('should return false for non-implemented trait', () => {
      class OtherClass {}
      const instance = new OtherClass();
      expect(TestTrait.hasTrait(instance)).toBe(false);
    });
  });

  describe('validType', () => {
    it('should not throw for valid type', () => {
      const instance = new TestClass();
      expect(() => TestTrait.validType(instance)).not.toThrow();
    });

    it('should throw for invalid type', () => {
      class OtherClass {}
      const instance = new OtherClass();
      expect(() => TestTrait.validType(instance)).toThrow();
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
});
