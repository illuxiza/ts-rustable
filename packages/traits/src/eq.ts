import { trait } from '@rustable/trait';
import { equals } from '@rustable/utils';

/**
 * Eq trait for equality comparison.
 * Implements structural equality comparison between objects.
 *
 * # Examples
 * ```typescript
 * @derive(Eq)
 * class Point {
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * const p1 = new Point(1, 2);
 * const p2 = new Point(1, 2);
 * console.log(p1.equals(p2)); // true
 * ```
 *
 * # Implementation Details
 * - Performs deep structural comparison
 * - Handles nested objects and arrays
 * - Considers object prototypes
 * - Type-safe comparison with runtime checks
 * - Handles special JavaScript values (NaN, undefined)
 */
@trait
export class Eq {
  /**
   * Compare this object with another for equality
   * @param other Object to compare with
   * @returns true if objects are equal, false otherwise
   */
  equals(other: any): boolean {
    if (!(other instanceof Object)) {
      return false;
    }
    return equals(this, other);
  }
}
