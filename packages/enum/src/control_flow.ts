import { Enum } from './enum';
import { None, Option, Some } from './option';

/**
 * Interface for pattern matching on ControlFlow
 * @template B Type of the break value
 * @template C Type of the continue value
 * @template R Return type of the match operation
 */
interface MatchControlFlow<B, C, R> {
  /**
   * Handler for Continue variant
   * @param value The continue value
   */
  Continue?: (value?: C) => R;
  /**
   * Handler for Break variant
   * @param value The break value
   */
  Break?: (value: B) => R;
}

/**
 * Default match patterns that preserve the original value
 * @internal
 */
const defaultMatchControlFlow: MatchControlFlow<any, any, any> = {
  Continue: (val) => val,
  Break: (val) => val,
};

/**
 * ControlFlow represents a flow control state that can either continue (Continue)
 * or break with a value (Break).
 *
 * Key features:
 * - Type-safe control flow
 * - Pattern matching support
 * - Rich set of helper methods
 *
 * @template B The type of the break value
 * @template C The type of the continue value
 *
 * @example
 * ```typescript
 * function findFirst<T>(iter: Iterable<T>, pred: (x: T) => boolean): Option<T> {
 *   for (const x of iter) {
 *     if (pred(x)) {
 *       return Break(x);
 *     }
 *   }
 *   return Continue();
 * }
 * ```
 */
export class ControlFlow<B, C = void> extends Enum {
  protected constructor(name: string, ...args: any[]) {
    super(name, ...args);
  }

  static Continue<B, C>(value?: C): ControlFlow<B, C> {
    return new ControlFlow('Continue', value);
  }

  static Break<B, C>(value: B): ControlFlow<B, C> {
    return new ControlFlow('Break', value);
  }

  /**
   * Pattern matches on the ControlFlow
   * @param patterns Object containing handlers for Continue and Break cases
   * @returns Result of the matched handler
   *
   * @example
   * ```typescript
   * const flow = Continue(42);
   * const result = flow.match({
   *   Continue: (val) => `Continuing with ${val}`,
   *   Break: (val) => `Breaking with ${val}`,
   * });
   * ```
   */
  match<R>(patterns: Partial<MatchControlFlow<B, C, R>>): R {
    const defaults = {
      Continue: defaultMatchControlFlow.Continue,
      Break: defaultMatchControlFlow.Break,
    };
    return super.match(patterns, defaults);
  }

  /**
   * Returns true if this is a Break variant
   */
  isBreak(): boolean {
    return this.is('Break');
  }

  /**
   * Returns true if this is a Continue variant
   */
  isContinue(): boolean {
    return this.is('Continue');
  }

  /**
   * Returns the Break value if this is Break, throws otherwise
   * @throws Error if this is not a Break variant
   */
  breakValue(): Option<B> {
    return this.match({
      Break: (val) => Some(val),
      Continue: () => None,
    });
  }

  /**
   * Returns the Continue value if this is Continue, throws otherwise
   * @throws Error if this is not a Continue variant
   */
  continueValue(): Option<C> {
    return this.match({
      Break: () => None,
      Continue: (val) => Some(val),
    });
  }

  /**
   * Maps the Break value using the provided function
   * @param fn Function to transform the Break value
   * @returns New ControlFlow with mapped Break value
   *
   * @example
   * ```typescript
   * const flow = Break(42);
   * const mapped = flow.mapBreak(x => x.toString()); // Break("42")
   * ```
   */
  mapBreak<U>(fn: (val: B) => U): ControlFlow<U, C> {
    return this.match({
      Break: (val) => ControlFlow.Break(fn(val)),
      Continue: (val) => ControlFlow.Continue(val),
    });
  }

  /**
   * Maps the Continue value using the provided function
   * @param fn Function to transform the Continue value
   * @returns New ControlFlow with mapped Continue value
   *
   * @example
   * ```typescript
   * const flow = Continue(42);
   * const mapped = flow.mapContinue(x => x.toString()); // Continue("42")
   * ```
   */
  mapContinue<U>(fn: (val?: C) => U): ControlFlow<B, U> {
    return this.match({
      Break: (val) => ControlFlow.Break(val),
      Continue: (val) => ControlFlow.Continue(fn(val)),
    });
  }
}

/**
 * Creates a Continue variant of ControlFlow
 * @param value Optional continue value
 */
export function Continue<B, C = void>(value?: C): ControlFlow<B, C> {
  return ControlFlow.Continue(value);
}

/**
 * Creates a Break variant of ControlFlow
 * @param value Break value
 */
export function Break<B, C = void>(value: B): ControlFlow<B, C> {
  return ControlFlow.Break(value);
}
