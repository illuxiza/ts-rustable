import { Enum, variant } from '../src/enum';

class TestEnum extends Enum {
  @variant
  static A(): TestEnum {
    return undefined as any;
  }

  @variant
  static B(_a: number, _b: number): TestEnum {
    return undefined as any;
  }
}

describe('Enum System', () => {
  describe('TestEnum', () => {
    it('should create variant A', () => {
      const enumA = TestEnum.A();
      expect(enumA.is('A')).toBe(true);
      expect(enumA.is('B')).toBe(false);
      expect(enumA.toString()).toBe('A');
    });

    it('should create variant B with parameters', () => {
      const enumB = TestEnum.B(1, 2);
      expect(enumB.is('B')).toBe(true);
      expect(enumB.is('A')).toBe(false);
      expect(enumB.toString()).toBe('B(1, 2)');
    });

    it('should unwrap tuple values from variant B', () => {
      const enumB = TestEnum.B(1, 2);
      const [a, b] = enumB.unwrapTuple<[number, number]>();
      expect(a).toBe(1);
      expect(b).toBe(2);
    });

    it('should throw error when unwrapping variant without args', () => {
      const enumA = TestEnum.A();
      expect(() => enumA.unwrap()).toThrow('Cannot unwrap a variant without arguments');
      expect(() => enumA.unwrapTuple()).toThrow('Cannot unwrap a variant without arguments');
    });

    it('should support pattern matching with type checking', () => {
      const enumA = TestEnum.A();
      const enumB = TestEnum.B(1, 2);

      const matchA = enumA.match({
        A: () => 'matched A',
        B: (x: number, y: number) => `matched B with ${x}, ${y}`,
      });
      expect(matchA).toBe('matched A');

      const matchB = enumB.match({
        A: () => 'matched A',
        B: (x: number, y: number) => `matched B with ${x}, ${y}`,
      });
      expect(matchB).toBe('matched B with 1, 2');
    });

    it('should support pattern matching with default patterns', () => {
      const enumA = TestEnum.A();
      const enumB = TestEnum.B(1, 2);

      const defaultPatterns = {
        A: () => 'default A',
        B: () => 'default B',
      };

      const matchA = enumA.match(
        {
          A: () => 'custom A',
        },
        defaultPatterns,
      );
      expect(matchA).toBe('custom A');

      const matchB = enumB.match({}, defaultPatterns);
      expect(matchB).toBe('default B');
    });

    it('should throw on non-exhaustive pattern matching', () => {
      const enumA = TestEnum.A();
      expect(() =>
        enumA.match({
          B: (x: number, y: number) => `matched B with ${x}, ${y}`,
        }),
      ).toThrow('Non-exhaustive pattern matching');
    });
  });

  describe('Custom Enum', () => {
    class Color extends Enum {
      @variant
      static red(): Color {
        return undefined as any;
      }

      @variant
      static rgb(_r: number, _g: number, _b: number): Color {
        return undefined as any;
      }
    }

    it('should work with custom enum implementation', () => {
      const red = Color.red();
      const rgb = Color.rgb(255, 128, 0);

      expect(red.is('red')).toBe(true);
      expect(rgb.is('rgb')).toBe(true);

      const matchRed = red.match({
        red: () => 'pure red',
        rgb: (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`,
      });
      expect(matchRed).toBe('pure red');

      const matchRgb = rgb.match({
        red: () => 'pure red',
        rgb: (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`,
      });
      expect(matchRgb).toBe('rgb(255, 128, 0)');
    });
  });
  describe('Enum.equals', () => {
    class TestEnum extends Enum {
      @variant static A(): TestEnum {
        return undefined as any;
      }
      @variant static B(_value: number): TestEnum {
        return undefined as any;
      }
      @variant static C(_x: number, _y: string): TestEnum {
        return undefined as any;
      }
      @variant static D(_nested: TestEnum): TestEnum {
        return undefined as any;
      }
    }

    test('same variants with no args should be equal', () => {
      const a1 = TestEnum.A();
      const a2 = TestEnum.A();
      expect(a1.equals(a2)).toBe(true);
    });

    test('different variants should not be equal', () => {
      const a = TestEnum.A();
      const b = TestEnum.B(1);
      expect(a.equals(b)).toBe(false);
    });

    test('same variants with same args should be equal', () => {
      const b1 = TestEnum.B(42);
      const b2 = TestEnum.B(42);
      expect(b1.equals(b2)).toBe(true);
    });

    test('same variants with different args should not be equal', () => {
      const b1 = TestEnum.B(42);
      const b2 = TestEnum.B(24);
      expect(b1.equals(b2)).toBe(false);
    });

    test('same variants with multiple same args should be equal', () => {
      const c1 = TestEnum.C(1, 'hello');
      const c2 = TestEnum.C(1, 'hello');
      expect(c1.equals(c2)).toBe(true);
    });

    test('same variants with multiple different args should not be equal', () => {
      const c1 = TestEnum.C(1, 'hello');
      const c2 = TestEnum.C(1, 'world');
      expect(c1.equals(c2)).toBe(false);
    });

    test('should handle nested enums', () => {
      const nested1 = TestEnum.B(42);
      const nested2 = TestEnum.B(42);
      const d1 = TestEnum.D(nested1);
      const d2 = TestEnum.D(nested2);
      expect(d1.equals(d2)).toBe(true);

      const differentNested = TestEnum.B(24);
      const d3 = TestEnum.D(differentNested);
      expect(d1.equals(d3)).toBe(false);
    });

    test('should handle non-enum values', () => {
      const b = TestEnum.B(42);
      expect(b.equals({} as any)).toBe(false);
    });

    test('should handle complex objects as args', () => {
      class ComplexEnum extends Enum {
        @variant static Data(_obj: { x: number; y: string }): ComplexEnum {
          return undefined as any;
        }
      }

      const e1 = ComplexEnum.Data({ x: 1, y: 'test' });
      const e2 = ComplexEnum.Data({ x: 1, y: 'test' });
      const e3 = ComplexEnum.Data({ x: 2, y: 'test' });

      expect(e1.equals(e2)).toBe(true);
      expect(e1.equals(e3)).toBe(false);
    });
  });
});
