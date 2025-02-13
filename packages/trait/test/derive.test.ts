import { derive } from '@rustable/type';
import { macroTrait, Trait } from '../src/trait';

class DebugTrait extends Trait {
  string(): string {
    return `Debug: ${this.constructor.name}`;
  }
}

const Debug = macroTrait(DebugTrait);

interface Debug extends DebugTrait {}

describe('derive decorator', () => {
  test('should derive single trait', () => {
    @derive([Debug])
    class Point {
      constructor(
        public x: number,
        public y: number,
      ) {}
    }
    interface Point extends Debug {}

    const point = new Point(1, 2);
    expect(point.string()).toBe('Debug: Point');
    expect(point instanceof Point).toBeTruthy();
  });

  test('should derive multiple commons', () => {
    @derive([Debug])
    class Rectangle {
      constructor(
        public width: number,
        public height: number,
      ) {}
    }

    interface Rectangle extends Debug {}

    const rect = new Rectangle(10, 20);
    expect(rect.string()).toBe('Debug: Rectangle');
  });

  test('should preserve original class functionality', () => {
    @derive([Debug])
    class Circle {
      constructor(public radius: number) {}

      getArea(): number {
        return Math.PI * this.radius * this.radius;
      }
    }

    interface Circle extends Debug {}
    const circle = new Circle(5);
    expect(circle.string()).toBe('Debug: Circle');
    expect(circle.getArea()).toBeCloseTo(78.54, 2);
  });
});
