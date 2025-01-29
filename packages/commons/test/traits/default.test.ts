import { derive } from '@rustable/type';
import { Default, defaultVal } from '../../src/traits/default';

describe('Default trait', () => {
  test('should create default instance for primitive types', () => {
    @derive(Default)
    class PrimitiveWrapper {
      constructor(public value: number = 0) {}
    }

    const defaultInstance = defaultVal(PrimitiveWrapper);
    expect(defaultInstance.value).toBe(0);
  });

  test('should use custom default method if provided', () => {
    @derive(Default)
    class CustomDefault {
      constructor(public name: string = '') {}

      static default() {
        return new CustomDefault('Default Name');
      }
    }

    const defaultInstance = defaultVal(CustomDefault);
    expect(defaultInstance.name).toBe('Default Name');
  });

  test('should create default instance for complex types', () => {
    @derive(Default)
    class ComplexType {
      constructor(
        public str: string = '',
        public num: number = 0,
        public bool: boolean = false,
        public arr: number[] = [],
      ) {}
    }

    const defaultInstance = defaultVal(ComplexType);
    expect(defaultInstance.str).toBe('');
    expect(defaultInstance.num).toBe(0);
    expect(defaultInstance.bool).toBe(false);
    expect(defaultInstance.arr).toEqual([]);
  });
});
