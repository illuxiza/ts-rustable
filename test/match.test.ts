import { Enum, variant } from '../src/match';

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
});
