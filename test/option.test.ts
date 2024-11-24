import { None, Option, Some } from '../src/option';

describe('Option', () => {
  describe('Some', () => {
    test('should create Some with value', () => {
      const some = Some(42);
      expect(some.isSome()).toBe(true);
      expect(some.isNone()).toBe(false);
      expect(some.unwrap()).toBe(42);
    });

    test('should handle isSomeAnd', () => {
      const some = Some(42);
      expect(some.isSomeAnd((x) => x > 40)).toBe(true);
      expect(some.isSomeAnd((x) => x < 40)).toBe(false);
    });

    test('should handle pattern matching', () => {
      const some = Some(42);
      const result = some.match({
        Some: (x) => x * 2,
        None: 0,
      });
      expect(result).toBe(84);
    });

    test('should handle map operations', () => {
      const some = Some(42);
      expect(some.map((x) => x * 2).unwrap()).toBe(84);
      expect(some.mapOr(0, (x) => x * 2)).toBe(84);
      expect(
        some.mapOrElse(
          () => 0,
          (x) => x * 2,
        ),
      ).toBe(84);
    });

    test('should handle andThen', () => {
      const some = Some(42);
      expect(some.andThen((x) => Some(x * 2)).unwrap()).toBe(84);
      expect(some.andThen((_) => None).isNone()).toBe(true);
    });

    test('should handle orElse', () => {
      const some = Some(42);
      expect(some.orElse(() => Some(84))).toBe(some);
      expect(some.or(Some(84))).toBe(some);
    });

    test('should handle and/or', () => {
      const some1 = Some(42);
      const some2 = Some(84);
      expect(some1.and(some2).unwrap()).toBe(84);
      expect(some1.or(some2)).toBe(some1);
    });

    test('should handle filter', () => {
      const some = Some(42);
      expect(some.filter((x) => x > 40).unwrap()).toBe(42);
      expect(some.filter((x) => x < 40).isNone()).toBe(true);
    });

    test('should handle unwrap operations', () => {
      const some = Some(42);
      expect(some.unwrap()).toBe(42);
      expect(some.unwrapOr(0)).toBe(42);
      expect(some.unwrapOrElse(() => 0)).toBe(42);
    });

    test('should handle null and undefined values', () => {
      const nullOpt = Some(null);
      const undefOpt = Some(undefined);

      expect(nullOpt.isNone()).toBe(true);
      expect(undefOpt.isNone()).toBe(true);

      expect(() => nullOpt.unwrap()).toThrow(ReferenceError);
      expect(() => undefOpt.unwrap()).toThrow(ReferenceError);

      const nullResult = nullOpt.match({
        Some: (val) => val,
        None: 'default',
      });
      expect(nullResult).toBe('default');

      const undefResult = undefOpt.match({
        Some: (val) => val,
        None: 'default',
      });
      expect(undefResult).toBe('default');
    });

    describe('xor', () => {
      test('Some xor None should return Some', () => {
        const some = Some(42);
        expect(some.xor(None).unwrap()).toBe(42);
        expect(None.xor(some).unwrap()).toBe(42);
      });

      test('Some xor Some should return None', () => {
        const some1 = Some(42);
        const some2 = Some(84);
        expect(some1.xor(some2).isNone()).toBe(true);
      });

      test('None xor None should return None', () => {
        expect(None.xor(None).isNone()).toBe(true);
      });

      test('xor should handle different types', () => {
        const someNum = Some(42);
        const someStr = Some('hello');
        const result = someNum.xor(someStr);
        expect(result.isNone()).toBe(true);
      });
    });

    describe('expect', () => {
      test('expect should return value for Some', () => {
        const some = Some(42);
        expect(some.expect('Should have value')).toBe(42);
      });

      test('expect should throw with custom message for None', () => {
        const errorMessage = 'Custom error message';
        expect(() => None.expect(errorMessage)).toThrow(errorMessage);
      });

      test('expect should handle complex objects', () => {
        const obj = { key: 'value' };
        const some = Some(obj);
        expect(some.expect('Should have object')).toBe(obj);
      });
    });

    describe('inspect', () => {
      test('inspect should call function for Some', () => {
        const mockFn = jest.fn();
        const some = Some(42);
        const result = some.inspect(mockFn);
        
        expect(mockFn).toHaveBeenCalledWith(42);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(result).toBe(some);  // Should return the same Option
      });

      test('inspect should not call function for None', () => {
        const mockFn = jest.fn();
        const result = None.inspect(mockFn);
        
        expect(mockFn).not.toHaveBeenCalled();
        expect(result).toBe(None);  // Should return None
      });

      test('inspect should maintain chain for Some', () => {
        const some = Some(42);
        const result = some
          .inspect(x => {})
          .map(x => x * 2)
          .inspect(x => {});
        
        expect(result.unwrap()).toBe(84);
      });

      test('inspect should handle side effects', () => {
        let sideEffect = 0;
        const some = Some(42);
        some.inspect(x => sideEffect = x);
        
        expect(sideEffect).toBe(42);
      });
    });
  });

  describe('None', () => {
    test('should handle basic operations', () => {
      expect(None.isSome()).toBe(false);
      expect(None.isNone()).toBe(true);
      expect(None.isSomeAnd((_x) => true)).toBe(false);
    });

    test('should handle pattern matching', () => {
      const result = None.match({
        Some: (_x) => 42,
        None: 0,
      });
      expect(result).toBe(0);

      const resultWithFn = None.match({
        Some: (_x) => 42,
        None: () => 0,
      });
      expect(resultWithFn).toBe(0);
    });

    test('should handle map operations', () => {
      expect(None.map((_x) => 42).isNone()).toBe(true);
      expect(None.mapOr(0, (_x) => 42)).toBe(0);
      expect(
        None.mapOrElse(
          () => 0,
          (_x) => 42,
        ),
      ).toBe(0);
    });

    test('should handle andThen', () => {
      expect(None.andThen((_x) => Some(42)).isNone()).toBe(true);
    });

    test('should handle orElse', () => {
      expect(None.orElse(() => Some(42)).unwrap()).toBe(42);
      expect(None.or(Some(42)).unwrap()).toBe(42);
    });

    test('should handle and/or', () => {
      expect(None.and(Some(42)).isNone()).toBe(true);
      expect(None.or(Some(42)).unwrap()).toBe(42);
    });

    test('should handle filter', () => {
      expect(None.filter((_x) => true).isNone()).toBe(true);
    });

    test('should handle unwrap operations', () => {
      expect(None.unwrapOr(42)).toBe(42);
      expect(None.unwrapOrElse(() => 42)).toBe(42);
      expect(() => None.unwrap()).toThrow(ReferenceError);
      expect(None.unwrapOr(null)).toBe(null);
    });
  });

  describe('Default match patterns', () => {
    test('should use default None pattern', () => {
      const opt = None;
      const some = Some(42);
      expect(opt.match({})).toBe(null);
      expect(some.match({})).toBe(42);
    });
  });

  describe('Static variant methods', () => {
    test('Option.Some should create Some variant', () => {
      const value = 42;
      const opt = Option.Some(value);
      expect(opt.isSome()).toBe(true);
      expect(opt.unwrap()).toBe(value);
    });

    test('Option.None should create None variant', () => {
      const opt = Option.None();
      expect(opt.isNone()).toBe(true);
      expect(() => opt.unwrap()).toThrow(ReferenceError);
    });

    test('Option.Some should handle null/undefined', () => {
      const nullOpt = Option.Some(null);
      const undefOpt = Option.Some(undefined);

      expect(nullOpt.isNone()).toBe(true);
      expect(undefOpt.isNone()).toBe(true);
      expect(nullOpt).toBe(None);
      expect(undefOpt).toBe(None);
    });
  });

  describe('Type Guards', () => {
    test('should correctly identify Some and None', () => {
      const some: Option<number> = Some(42);
      const none: Option<number> = None;

      expect(some.isSome()).toBe(true);
      expect(none.isSome()).toBe(false);
      expect(some.isNone()).toBe(false);
      expect(none.isNone()).toBe(true);

      if (some.isSome()) {
        // Type narrowing should work
        expect(some.unwrap()).toBe(42);
      }

      if (none.isNone()) {
        // Type narrowing should work
        expect(() => none.unwrap()).toThrow();
      }
    });
  });

  describe('Complex Types', () => {
    test('should handle objects', () => {
      const obj = { x: 1, y: 2 };
      const some = Some(obj);
      expect(some.unwrap()).toBe(obj);
      expect(some.map((o) => ({ ...o, z: 3 })).unwrap()).toEqual({
        x: 1,
        y: 2,
        z: 3,
      });
    });

    test('should handle arrays', () => {
      const arr = [1, 2, 3];
      const some = Some(arr);
      expect(some.unwrap()).toBe(arr);
      expect(some.map((a) => [...a, 4]).unwrap()).toEqual([1, 2, 3, 4]);
    });

    test('should handle functions', () => {
      const fn = (x: number) => x * 2;
      const some = Some(fn);
      expect(some.unwrap()(21)).toBe(42);
    });

    test('should handle nested Options', () => {
      const nested = Some(Some(42));
      expect(nested.andThen((x) => x).unwrap()).toBe(42);
    });
  });

  describe('Additional edge cases', () => {
    test('should handle isSomeAnd with null/undefined', () => {
      const nullOpt = Some(null);
      const undefOpt = Some(undefined);

      expect(nullOpt.isSomeAnd((val) => val === null)).toBe(false);
      expect(undefOpt.isSomeAnd((val) => val === undefined)).toBe(false);
    });

    test('should handle unwrapOr with null/undefined', () => {
      const nullOpt = Some(null);
      const undefOpt = Some(undefined);

      expect(nullOpt.unwrapOr('default')).toBe('default');
      expect(undefOpt.unwrapOr('default')).toBe('default');
    });

    test('should handle unwrapOrElse with null/undefined', () => {
      const nullOpt = Some(null);
      const undefOpt = Some(undefined);

      expect(nullOpt.unwrapOrElse(() => 'computed')).toBe('computed');
      expect(undefOpt.unwrapOrElse(() => 'computed')).toBe('computed');
    });
  });
});
