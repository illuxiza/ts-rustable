import { Enum, Enums, variant } from '../src/enum';

class TestEnum extends Enum<typeof TestEnum> {
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

      const matchA = enumA.match({
        A: () => 'custom A',
        _: 'default',
      });
      expect(matchA).toBe('custom A');

      const matchB = enumB.match({ _: 'default' });
      expect(matchB).toBe('default');
    });

    it('should support isAnd for conditional execution', () => {
      const enumA = TestEnum.A();
      const enumB = TestEnum.B(1, 2);

      const resultA = enumA.let('A', { if: () => 'executed A', else: undefined });
      expect(resultA).toBe('executed A');

      const resultB = enumB.let('B', { if: (x, y) => x + y, else: undefined });
      expect(resultB).toBe(3);

      // Should return undefined for non-matching variants
      const noResultA = enumA.let('B', { if: () => 'should not execute', else: undefined });
      expect(noResultA).toBeUndefined();
    });
  });

  describe('Custom Enum', () => {
    class Color extends Enum<typeof Color> {
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
        rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
      });
      expect(matchRed).toBe('pure red');

      const matchRgb = rgb.match({
        red: () => 'pure red',
        rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
      });
      expect(matchRgb).toBe('rgb(255, 128, 0)');
    });
  });

  describe('Enums.create', () => {
    it('should support variant-specific isAnd methods', () => {
      const SimpleEnum = Enums.create({
        A: () => {},
        B: (_x: number, _y: string) => {},
      });

      const a = SimpleEnum.A();
      const b = SimpleEnum.B(42, 'hello');

      // Test variant-specific isAnd methods
      const aResult = a.letA({ if: () => 'executed A', else: 'other' });
      expect(aResult).toBe('executed A');

      const bResult = b.letB({ if: (x, y) => `${x}-${y}`, else: 'other' });
      expect(bResult).toBe('42-hello');

      // Should return undefined for non-matching variants
      const noResultA = a.letB({ if: () => 'should not execute', else: undefined });
      expect(noResultA).toBeUndefined();

      const noResultB = b.letA({ if: () => 'should not execute', else: undefined });
      expect(noResultB).toBeUndefined();
    });
  });

  describe('Enum.eq', () => {
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
      expect(a1.eq(a2)).toBe(true);
    });

    test('different variants should not be equal', () => {
      const a = TestEnum.A();
      const b = TestEnum.B(1);
      expect(a.eq(b)).toBe(false);
    });

    test('same variants with same args should be equal', () => {
      const b1 = TestEnum.B(42);
      const b2 = TestEnum.B(42);
      expect(b1.eq(b2)).toBe(true);
    });

    test('same variants with different args should not be equal', () => {
      const b1 = TestEnum.B(42);
      const b2 = TestEnum.B(24);
      expect(b1.eq(b2)).toBe(false);
    });

    test('same variants with multiple same args should be equal', () => {
      const c1 = TestEnum.C(1, 'hello');
      const c2 = TestEnum.C(1, 'hello');
      expect(c1.eq(c2)).toBe(true);
    });

    test('same variants with multiple different args should not be equal', () => {
      const c1 = TestEnum.C(1, 'hello');
      const c2 = TestEnum.C(1, 'world');
      expect(c1.eq(c2)).toBe(false);
    });

    test('should handle nested enums', () => {
      const nested1 = TestEnum.B(42);
      const nested2 = TestEnum.B(42);
      const d1 = TestEnum.D(nested1);
      const d2 = TestEnum.D(nested2);
      expect(d1.eq(d2)).toBe(true);

      const differentNested = TestEnum.B(24);
      const d3 = TestEnum.D(differentNested);
      expect(d1.eq(d3)).toBe(false);
    });

    test('should handle non-enum values', () => {
      const b = TestEnum.B(42);
      expect(b.eq({} as any)).toBe(false);
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

      expect(e1.eq(e2)).toBe(true);
      expect(e1.eq(e3)).toBe(false);
    });
  });
});

describe('Enum.modify', () => {
  it('should modify the arguments of the current variant', () => {
    const b = TestEnum.B(10, 5);
    b.modify({
      B: (x) => [x * 2],
    });

    expect(b.unwrap()).toBe(20);
  });
});

describe('Enum.createEnum', () => {
  it('should create a simple enum with given variants', () => {
    const SimpleEnum = Enums.create({
      A: () => {},
      B: (_x: number) => {},
      C: (_x: string, _y: number) => {},
    });

    const a = SimpleEnum.A();
    const b = SimpleEnum.B(42);
    const c = SimpleEnum.C('hello', 5);

    expect(b.unwrap()).toBe(42);
    expect(c.unwrapTuple()).toEqual(['hello', 5]);

    expect(a.isA()).toBe(true);
    expect(a.isB()).toBe(false);
    expect(a.isC()).toBe(false);

    expect(b.isA()).toBe(false);
    expect(b.isB()).toBe(true);
    expect(b.isC()).toBe(false);

    expect(c.isA()).toBe(false);
    expect(c.isB()).toBe(false);
    expect(c.isC()).toBe(true);
  });

  it('should throw when accessing non-existent variant', () => {
    const SimpleEnum = Enums.create({
      A: () => {},
    });

    expect(() => (SimpleEnum as any).B()).toThrow();
    expect(() => (SimpleEnum.A() as any).isB()).toThrow();
  });

  it('should create a named enum with given variants', () => {
    const NamedEnum = Enums.create('NamedEnum', {
      X: () => {},
      Y: (_value: number) => {},
      Z: (_: { a: string; b: boolean }) => {},
    });

    expect(NamedEnum.name).toBe('NamedEnum');

    const x = NamedEnum.X();
    const y = NamedEnum.Y(10);
    const z = NamedEnum.Z({ a: 'test', b: true });

    expect(x.isX()).toBe(true);
    expect(y.isY()).toBe(true);
    expect(z.isZ()).toBe(true);

    expect(y.unwrap()).toBe(10);
    expect(z.unwrap()).toEqual({ a: 'test', b: true });

    expect(() => (NamedEnum as any).W()).toThrow();
  });
});
