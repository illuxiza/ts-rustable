import { Break, Continue, ControlFlow } from '../src/control_flow';
import { None, Some } from '../src/option';

describe('ControlFlow', () => {
  describe('Continue variant', () => {
    test('should create Continue with no value', () => {
      const flow = Continue();
      expect(flow.isContinue()).toBe(true);
      expect(flow.isBreak()).toBe(false);
    });

    test('should create Continue with value', () => {
      const value = 42;
      const flow = Continue(value);
      expect(flow.isContinue()).toBe(true);
      expect(flow.continueValue().unwrap()).toBe(value);
    });

    test('should return None when accessing breakValue', () => {
      const flow = Continue();
      expect(flow.breakValue().isNone()).toBe(true);
    });

    test('should handle pattern matching', () => {
      const flow = Continue(42);
      const result = flow.match({
        Continue: (val) => `Continue: ${val}`,
        Break: (val) => `Break: ${val}`,
      });
      expect(result).toBe('Continue: 42');
    });

    test('should map Continue value', () => {
      const flow = Continue(42);
      const mapped = flow.mapContinue((x) => (x ?? 0) * 2);
      expect(mapped.continueValue().unwrap()).toBe(84);
    });
  });

  describe('Break variant', () => {
    test('should create Break with value', () => {
      const value = 'error';
      const flow = Break(value);
      expect(flow.isBreak()).toBe(true);
      expect(flow.isContinue()).toBe(false);
      expect(flow.breakValue().unwrap()).toBe(value);
    });

    test('should return None when accessing continueValue', () => {
      const flow = Break('error');
      expect(flow.continueValue().isNone()).toBe(true);
    });

    test('should handle pattern matching', () => {
      const flow = Break('error');
      const result = flow.match({
        Continue: (val) => `Continue: ${val}`,
        Break: (val) => `Break: ${val}`,
      });
      expect(result).toBe('Break: error');
    });

    test('should map Break value', () => {
      const flow = Break(42);
      const mapped = flow.mapBreak((x) => x.toString());
      expect(mapped.breakValue().unwrap()).toBe('42');
    });
  });

  describe('Pattern matching', () => {
    test('should handle partial patterns', () => {
      const flow = Continue(42);
      const result = flow.match({
        Continue: (val) => (val ?? 0) * 2,
      });
      expect(result).toBe(84);
    });

    test('should handle undefined in pattern matching', () => {
      const flow = Continue();
      const result = flow.match({
        Continue: (val) => val ?? 'default',
        Break: (val) => val,
      });
      expect(result).toBe('default');
    });
  });

  describe('Complex types', () => {
    interface User {
      id: number;
      name: string;
    }

    test('should handle objects', () => {
      const user: User = { id: 1, name: 'Test' };
      const flow = Break(user);
      expect(flow.breakValue().unwrap()).toEqual(user);
    });

    test('should handle arrays', () => {
      const arr = [1, 2, 3];
      const flow = Continue(arr);
      expect(flow.continueValue().unwrap()).toEqual(arr);
    });

    test('should handle nested ControlFlows', () => {
      const nested = Break(Break(42));
      expect(nested.breakValue().unwrap().breakValue().unwrap()).toBe(42);
    });

    test('should handle nested Continue flows', () => {
      const nested = Continue(Continue(42));
      expect(nested.continueValue().unwrap().continueValue().unwrap()).toBe(42);
    });
  });

  describe('Type inference', () => {
    test('should infer types correctly', () => {
      const flow: ControlFlow<string, number> = Math.random() > 0.5 ? Break('error') : Continue(42);

      const result = flow.match({
        Break: (s: string) => s.length,
        Continue: (n?: number) => n ?? 0,
      });

      expect(typeof result).toBe('number');
    });

    test('should handle union types', () => {
      const flow: ControlFlow<string | number, boolean> =
        Math.random() > 0.5 ? Break('error') : Break(42);

      const result = flow.match({
        Break: (val) => (typeof val === 'string' ? val.length : val),
        Continue: (val) => (val ? 1 : 0),
      });

      expect(typeof result).toBe('number');
    });
  });

  describe('Option handling', () => {
    test('should handle Some values', () => {
      const flow = Continue(Some(42));
      expect(flow.continueValue().unwrap().unwrap()).toBe(42);
    });

    test('should handle None values', () => {
      const flow = Continue(None);
      expect(flow.continueValue().unwrap().isNone()).toBe(true);
    });

    test('should chain Option and ControlFlow', () => {
      const flow = Break(Some(42));
      const result = flow
        .breakValue()
        .map((opt) => opt.unwrap())
        .unwrap();
      expect(result).toBe(42);
    });
  });
});
