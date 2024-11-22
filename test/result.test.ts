import { Err, Ok, Result } from '../src/result';

describe('Result Type', () => {
  // Test Ok variant
  describe('Ok variant', () => {
    const okValue = 42;
    const ok = Ok(okValue);

    test('isOk() returns true', () => {
      expect(ok.isOk()).toBe(true);
    });

    test('isErr() returns false', () => {
      expect(ok.isErr()).toBe(false);
    });

    test('ok() returns Some with value', () => {
      const option = ok.ok();
      expect(option.isSome()).toBe(true);
      expect(option.unwrap()).toBe(okValue);
    });

    test('err() returns None', () => {
      const option = ok.err();
      expect(option.isNone()).toBe(true);
    });

    test('unwrap() returns value', () => {
      expect(ok.unwrap()).toBe(okValue);
    });

    test('unwrapOr() returns original value', () => {
      expect(ok.unwrapOr(100)).toBe(okValue);
    });

    test('unwrapOrElse() returns original value', () => {
      expect(ok.unwrapOrElse(() => 100)).toBe(okValue);
    });

    test('unwrapOrThrow() returns value', () => {
      expect(ok.unwrapOrThrow()).toBe(okValue);
    });

    test('unwrapErr() throws', () => {
      expect(() => ok.unwrapErr()).toThrow(ReferenceError);
    });

    test('match() calls ok handler', () => {
      const result = ok.match({
        ok: (val) => val * 2,
        err: () => -1,
      });
      expect(result).toBe(okValue * 2);
    });

    test('map() transforms Ok value', () => {
      const mapped = ok.map((x: number) => x * 2);
      expect(mapped.unwrap()).toBe(okValue * 2);
    });

    test('mapErr() returns original Ok', () => {
      const mapped = ok.mapErr(() => new Error('new error'));
      expect(mapped.unwrap()).toBe(okValue);
    });

    test('andThen() chains Ok results', () => {
      const chained = ok.andThen((x) => Ok(x * 2));
      expect(chained.unwrap()).toBe(okValue * 2);
    });

    test('orElse() returns original Ok', () => {
      const result = ok.orElse(() => Ok(100));
      expect(result.unwrap()).toBe(okValue);
    });
  });

  // Test Err variant
  describe('Err variant', () => {
    const errorMessage = 'test error';
    const err = Err(new Error(errorMessage));

    test('isOk() returns false', () => {
      expect(err.isOk()).toBe(false);
    });

    test('isErr() returns true', () => {
      expect(err.isErr()).toBe(true);
    });

    test('ok() returns None', () => {
      const option = err.ok();
      expect(option.isNone()).toBe(true);
    });

    test('err() returns Some with error', () => {
      const option = err.err();
      expect(option.isSome()).toBe(true);
      expect(option.unwrap().message).toBe(errorMessage);
    });

    test('unwrap() throws', () => {
      expect(() => err.unwrap()).toThrow(ReferenceError);
    });

    test('unwrapOr() returns default value', () => {
      expect(err.unwrapOr(100)).toBe(100);
    });

    test('unwrapOrElse() returns computed value', () => {
      expect(err.unwrapOrElse(() => 100)).toBe(100);
    });

    test('unwrapOrThrow() throws original error', () => {
      expect(() => err.unwrapOrThrow()).toThrow(Error);
      expect(() => err.unwrapOrThrow()).toThrow(errorMessage);
    });

    test('unwrapErr() returns error', () => {
      expect(err.unwrapErr().message).toBe(errorMessage);
    });

    test('match() calls err handler', () => {
      const result = err.match({
        ok: () => 42,
        err: (e) => e.message.length,
      });
      expect(result).toBe(errorMessage.length);
    });

    test('map() returns original Err', () => {
      const mapped = err.map((x: unknown) => (x as number) * 2);
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr().message).toBe(errorMessage);
    });

    test('mapErr() transforms error', () => {
      const newMessage = 'new error';
      const mapped = err.mapErr(() => new Error(newMessage));
      expect(mapped.unwrapErr().message).toBe(newMessage);
    });

    test('andThen() returns original Err', () => {
      const chained = err.andThen(() => Ok(100));
      expect(chained.isErr()).toBe(true);
      expect(chained.unwrapErr().message).toBe(errorMessage);
    });

    test('orElse() returns new result', () => {
      const result = err.orElse(() => Ok(100));
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(100);
    });
  });

  // Test type guards
  describe('Type Guards', () => {
    test('isOk() narrows type correctly', () => {
      const result: Result<number, Error> = Ok(42);
      if (result.isOk()) {
        expect(result.unwrap()).toBe(42);
      } else {
        fail('Should be Ok');
      }
    });

    test('isErr() narrows type correctly', () => {
      const result: Result<number, Error> = Err(new Error('test'));
      if (result.isErr()) {
        expect(result.unwrapErr().message).toBe('test');
      } else {
        fail('Should be Err');
      }
    });
  });

  // Test complex types
  describe('Complex Types', () => {
    interface User {
      id: number;
      name: string;
    }

    test('handles objects correctly', () => {
      const user: User = { id: 1, name: 'Test' };
      const ok = Ok(user);
      expect(ok.unwrap()).toEqual(user);
    });

    test('handles arrays correctly', () => {
      const arr = [1, 2, 3];
      const ok = Ok(arr);
      expect(ok.unwrap()).toEqual(arr);
    });

    test('handles nested Results correctly', () => {
      const nested = Ok(Ok(42));
      expect(nested.unwrap().unwrap()).toBe(42);
    });

    test('handles custom error types', () => {
      class CustomError extends Error {
        constructor(
          public code: number,
          message: string,
        ) {
          super(message);
        }
      }

      const err = Err(new CustomError(404, 'Not Found'));
      expect(err.unwrapErr().code).toBe(404);
    });
  });

  // Test match with partial handlers
  describe('Partial Match Handlers', () => {
    test('match with only ok handler on Ok', () => {
      const ok = Ok(42);
      const result = ok.match({
        ok: (val) => val * 2,
      });
      expect(result).toBe(84);
    });

    test('match with only err handler on Err', () => {
      const err = Err(new Error('test'));
      const result = err.match({
        err: (e) => e.message,
      });
      expect(result).toBe('test');
    });

    test('match with no handlers uses defaults', () => {
      const ok = Ok(42);
      const err = Err(new Error('test'));

      expect(ok.match({})).toBe(42);
      expect((err.match({}) as Error).message).toBe('test');
    });
  });
});
