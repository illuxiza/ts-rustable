# @rustable/enum

A TypeScript implementation of Rust-style pattern matching, Option, and Result types. This package provides type-safe alternatives to null/undefined and error handling patterns in TypeScript.

## ✨ Features

- 🔒 **Type-safe Enums**: Full TypeScript support with proper type inference
- 🎭 **Pattern Matching**: Exhaustive pattern matching with compile-time checks
- 🔄 **Option Type**: Safe handling of optional values without null/undefined
- ✅ **Result Type**: Elegant error handling with Ok/Err variants
- 🎯 **Let Pattern**: Type-safe conditional execution with proper inference
- 🔗 **Method Chaining**: Rich set of combinators for value transformation
- 🛡️ **Null Safety**: Complete elimination of null/undefined related bugs
- 🏭 **Factory API**: Easy creation of custom enums with type checking
- 🔄 **Async Support**: First-class support for async operations with Result type
- 📦 **Zero Dependencies**: No external runtime dependencies

## 📦 Installation

```bash
npm install @rustable/enum
# or
yarn add @rustable/enum
# or
pnpm add @rustable/enum
```

## 📚 Core Components

### Pattern Matching (`enum.ts`)

Implements Rust-style pattern matching for TypeScript through the `Enum` base class and variant system.

```typescript
import { Enum } from '@rustable/enum';

// Define an enum with proper type parameter
class MyEnum extends Enum<typeof MyEnum> {
  static Variant1(value: string) {
    return new MyEnum('Variant1', value);
  }
  static Variant2(value: number) {
    return new MyEnum('Variant2', value);
  }
}

const value = MyEnum.Variant1('test');

// Type-safe pattern matching requires all variants to be handled
value.match({
  Variant1: (str) => console.log(str),
  Variant2: (num) => console.log(num),
});

// Conditional execution with let pattern matching
value.let('Variant1', {
  if: (str) => console.log(`Found Variant1: ${str}`),
  else: () => console.log('Not Variant1'),
});
```

### Custom Enums (`Enums.create`)

Create type-safe enums with custom variants and parameters using `Enums.create`. This provides a more concise and type-safe way to define enums compared to class extension.

```typescript
import { Enums } from '@rustable/enum';

// Define enum with different variant signatures
const UserState = Enums.create('UserState', {
  LoggedOut: () => {},
  LoggedIn: (userId: string, role: string) => {},
  Suspended: (reason: string) => {},
});

// Or
const UserState = Enums.create({
  LoggedOut: () => {},
  LoggedIn: (userId: string, role: string) => {},
  Suspended: (reason: string) => {},
});

// Create instances with type checking
const state1 = UserState.LoggedOut();
const state2 = UserState.LoggedIn('user123', 'admin');
const state3 = UserState.Suspended('violation');

// Type-safe pattern matching (must handle all variants)
state2.match({
  LoggedIn: (userId, role) => console.log(`User ${userId} is ${role}`),
  Suspended: (reason) => console.log(`Account suspended: ${reason}`),
  LoggedOut: () => console.log('Please log in'),
});
// or
state2.match({
  LoggedIn: (userId, role) => console.log(`User ${userId} is ${role}`),
  _: () => console.log('Not logged in'),
});

// Conditional execution with let pattern matching
state2.letLoggedIn({
  if: (userId, role) => console.log(`User ${userId} is ${role}`),
  else: () => console.log('Not logged in'),
});

// Type-safe variant checking
if (state2.isLoggedIn()) {
  // TypeScript knows this is a LoggedIn variant
  console.log(state2.unwrapTuple()); // ['user123', 'admin']
}

// Clone support
const clonedState = state2.clone();
```

#### Type Definitions

```typescript
// Define variant signatures
type UserStateVariants = {
  LoggedOut: () => void;
  LoggedIn: (userId: string, role: string) => void;
  Suspended: (reason: string) => void;
};

const userStateVariants: UserStateVariants = {
  LoggedOut: () => {},
  LoggedIn: (userId: string, role: string) => {},
  Suspended: (reason: string) => {},
};

// Create enum with type information
const UserState = Enums.create<UserStateVariants>('UserState', userStateVariants);

// Type information is preserved
type UserStateEnum = EnumInstance<UserStateVariants>;
```

#### Best Practices for Custom Enums

1. **Name Your Enums**: Always provide a name parameter to `Enums.create` for better debugging and error messages
2. **Type Parameters**: Use explicit type parameters when complex type inference is needed
3. **Variant Arguments**: Use underscore prefix for unused parameters to show intent
4. **Pattern Matching**: Always handle all variants or provide a default case
5. **Type-safe Checks**: Use generated `isVariant()` methods instead of string-based `is()`

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

// Basic usage
function validateAge(age: number): Result<number, Error> {
  return age >= 0 && age <= 120 ? Result.Ok(age) : Result.Err(new Error('Invalid age'));
}

const result = validateAge(25)
  .map((age) => age + 1) // Transform if Ok
  .unwrapOr(0); // Default if Err

// Async operation handling
const asyncResult = await Result.fromAsync<string, Error>(
  fetch('https://api.example.com/data').then((res) => res.text()),
);

if (asyncResult.isOk()) {
  console.log('Got data:', asyncResult.unwrap());
} else {
  console.error('Failed:', asyncResult.unwrapErr().message);
}

// Function error wrapping
const parseJSON = Result.fromFn<any, Error, [string]>(JSON.parse);

// Success case
const parseResult = parseJSON('{"key": "value"}');
if (parseResult.isOk()) {
  console.log('Parsed:', parseResult.unwrap());
}

// Error case
const errorResult = parseJSON('invalid json');
if (errorResult.isErr()) {
  console.error('Parse failed:', errorResult.unwrapErr().message);
}
```

## 📖 Usage

### Pattern Matching

```typescript
// All variants must be handled
enum.match({
  Variant1: (value) => handleVariant1(value),
  Variant2: (value) => handleVariant2(value),
});

// Conditional execution with let pattern
enum.letVariant1({
  if: (value) => handleVariant1(value),
  else: () => handleOtherCases(),
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

## 📝 Best Practices

1. Use `Option` instead of null/undefined for optional values
2. Use `Result` for operations that may fail
3. Leverage pattern matching for exhaustive case handling
4. Chain methods to transform values safely
5. Always handle both success and failure cases explicitly

## 📝 Notes

- All types are immutable and side-effect free
- Pattern matching is exhaustive by default
- Methods follow Rust's naming conventions
- Full TypeScript type inference support

## 📄 License

MIT © illuxiza
