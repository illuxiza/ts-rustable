# @rustable/enum

A TypeScript implementation of Rust-style pattern matching, Option, and Result types. This package provides type-safe alternatives to null/undefined and error handling patterns in TypeScript.

## Installation

```bash
npm install @rustable/enum
# or
yarn add @rustable/enum
# or
pnpm add @rustable/enum
```

## Core Components

### Pattern Matching (`enum.ts`)

Implements Rust-style pattern matching for TypeScript through the `Enum` base class and variant system.

```typescript
import { Enum } from '@rustable/enum';

class MyEnum extends Enum {
  static Variant1(value: string) {
    return new MyEnum('Variant1', value);
  }
  static Variant2(value: number) {
    return new MyEnum('Variant2', value);
  }
}

const value = MyEnum.Variant1('test');
value.match({
  Variant1: (str) => console.log(str),
  Variant2: (num) => console.log(num),
});
```

### Option Type (`option.ts`)

Represents an optional value that may or may not be present. A type-safe alternative to null/undefined.

```typescript
import { Some, None } from '@rustable/enum';

function divide(a: number, b: number): Option<number> {
  return b === 0 ? None : Some(a / b);
}

const result = divide(10, 2)
  .map((n) => n * 2) // Transform if Some
  .unwrapOr(0); // Default if None
```

### Result Type (`result.ts`)

Represents either success (Ok) or failure (Err). A type-safe way to handle operations that may fail.

```typescript
import { Result } from '@rustable/enum';

function validateAge(age: number): Result<number, Error> {
  return age >= 0 && age <= 120 ? Result.Ok(age) : Result.Err(new Error('Invalid age'));
}

const result = validateAge(25)
  .map((age) => age + 1) // Transform if Ok
  .unwrapOr(0); // Default if Err
```

## Key Features

- **Type Safety**: Full TypeScript support with proper type inference
- **Pattern Matching**: Rust-style exhaustive pattern matching
- **Option Type**: Safe handling of optional values
- **Result Type**: Elegant error handling
- **Method Chaining**: Rich set of combinators for value transformation
- **Null Safety**: Eliminates null/undefined related bugs

## Usage Examples

### Pattern Matching

```typescript
enum.match({
  Variant1: (value) => handleVariant1(value),
  Variant2: (value) => handleVariant2(value),
  _: () => handleDefault()  // Default case
});
```

### Option Type

```typescript
const opt = Some(5);

// Pattern matching
opt.match({
  Some: (value) => console.log(value),
  None: () => console.log('No value'),
});

// Method chaining
opt
  .map((n) => n * 2)
  .filter((n) => n > 5)
  .unwrapOr(0);
```

### Result Type

```typescript
const result = Result.Ok(42);

// Pattern matching
result.match({
  Ok: (value) => console.log(`Success: ${value}`),
  Err: (error) => console.error(`Error: ${error.message}`),
});

// Error handling
result.mapErr((err) => new Error(`Wrapped: ${err.message}`)).unwrapOr(0);
```

## Best Practices

1. Use `Option` instead of null/undefined for optional values
2. Use `Result` for operations that may fail
3. Leverage pattern matching for exhaustive case handling
4. Chain methods to transform values safely
5. Always handle both success and failure cases explicitly

## Notes

- All types are immutable and side-effect free
- Pattern matching is exhaustive by default
- Methods follow Rust's naming conventions
- Full TypeScript type inference support

## License

MIT © illuxiza
