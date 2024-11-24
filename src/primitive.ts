/**
 * Base class for primitive type wrappers
 */
export class PrimitiveType<T> {
  constructor(protected value: T) {
    if (value === undefined || value === null) {
      throw new Error('Cannot create primitive type from undefined or null');
    }
  }

  /**
   * Get the underlying primitive value
   */
  getValue(): T {
    return this.value;
  }
}

export class VoidType extends PrimitiveType<undefined> {
  constructor() {
    super(void 0);
  }
}

/**
 * Wrapper class for string primitive type
 */
export class StringType extends PrimitiveType<string> {
  constructor(value: string | any) {
    if (typeof value !== 'string') {
      throw new Error(`Cannot create StringType from ${typeof value}`);
    }
    super(value);
  }
}

/**
 * Wrapper class for number primitive type
 */
export class NumberType extends PrimitiveType<number> {
  constructor(value: number | string | any) {
    let finalValue: number;
    if (typeof value === 'string') {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error('Cannot convert string to number: invalid number format');
      }
      finalValue = num;
    } else if (typeof value !== 'number') {
      throw new Error(`Cannot create NumberType from ${typeof value}`);
    } else {
      finalValue = value;
    }
    super(finalValue);
  }
}

/**
 * Wrapper class for boolean primitive type
 */
export class BooleanType extends PrimitiveType<boolean> {
  constructor(value: boolean | string | any) {
    let finalValue: boolean;
    if (typeof value === 'string') {
      const lowered = value.toLowerCase();
      if (lowered !== 'true' && lowered !== 'false') {
        throw new Error('Cannot convert string to boolean: must be "true" or "false"');
      }
      finalValue = lowered === 'true';
    } else if (typeof value !== 'boolean') {
      throw new Error(`Cannot create BooleanType from ${typeof value}`);
    } else {
      finalValue = value;
    }
    super(finalValue);
  }
}

/**
 * Check if a value is a primitive type
 */
export function isPrimitive(value: any): boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/**
 * Wrap a primitive value in its corresponding wrapper class
 */
export function wrapPrimitive(value: any): PrimitiveType<any> {
  if (value === undefined || value === null) {
    throw new Error('Cannot wrap undefined or null value');
  }

  if (!isPrimitive(value)) {
    throw new Error('Cannot wrap non-primitive type');
  }

  switch (typeof value) {
    case 'string':
      return new StringType(value);
    case 'number':
      return new NumberType(value);
    case 'boolean':
      return new BooleanType(value);
    default:
      throw new Error(`Unsupported primitive type: ${typeof value}`);
  }
}

/**
 * Unwrap a primitive wrapper to get the underlying primitive value
 */
export function unwrapPrimitive<T>(wrapped: PrimitiveType<T>): T {
  if (!(wrapped instanceof PrimitiveType)) {
    throw new Error('Cannot unwrap non-primitive type');
  }
  return wrapped.getValue();
}
