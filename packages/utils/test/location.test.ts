import { Location } from '../src/location';

describe('Location', () => {
  // Helper function to create nested calls
  function level3() {
    const loc = new Location();
    return loc.stack();
  }

  function level2() {
    return level3();
  }

  function level1() {
    return level2();
  }

  describe('stack trace', () => {
    it('should capture correct call stack depth', () => {
      const stack = level1();
      expect(stack.length).toBeGreaterThanOrEqual(3);
    });

    it('should have correct call order', () => {
      const stack = level1();
      expect(stack[0].name).toContain('level3');
      expect(stack[1].name).toContain('level2');
      expect(stack[2].name).toContain('level1');
    });
  });

  describe('caller method', () => {
    function getCallerAtDepth(depth: number) {
      const loc = new Location();
      return loc.caller(depth);
    }

    it('should get immediate caller', () => {
      function immediate() {
        return getCallerAtDepth(1);
      }
      const caller = immediate();
      expect(caller?.name).toContain('immediate');
    });

    it('should return undefined for invalid depth', () => {
      const loc = new Location();
      expect(loc.caller(999)).toBeUndefined();
    });

    it('should throw error for negative depth', () => {
      const loc = new Location();
      expect(() => loc.caller(-1)).toThrow('Depth must be non-negative');
    });
  });

  describe('current method', () => {
    it('should get current location', () => {
      function getCurrentLocation() {
        const loc = new Location();
        return loc.current();
      }
      const current = getCurrentLocation();
      expect(current.name).toContain('getCurrentLocation');
      expect(current.file).toContain('location.test.ts');
    });
  });

  describe('stack method', () => {
    it('should return copy of stack', () => {
      const loc = new Location();
      const stack1 = loc.stack();
      const stack2 = loc.stack();
      expect(stack1).not.toBe(stack2); // Different array instances
      expect(stack1).toEqual(stack2); // But same content
    });
  });

  describe('stack line parsing', () => {
    it('should parse standard format correctly', () => {
      function standardFormat() {
        const loc = new Location();
        return loc.current();
      }
      const info = standardFormat();
      expect(info).toEqual(
        expect.objectContaining({
          name: expect.stringContaining('standardFormat'),
          file: 'location.test.ts',
          line: expect.any(Number),
          column: expect.any(Number),
        }),
      );
    });

    it('should parse anonymous function correctly', () => {
      const info = (() => {
        const loc = new Location();
        return loc.current();
      })();
      expect(info.file).toBeTruthy();
      expect(info.line).toBeGreaterThanOrEqual(0);
      expect(info.column).toBeGreaterThanOrEqual(0);
    });
  });
});
