# rustable

A TypeScript library that brings Rust-inspired features to TypeScript, including traits, Option, Result, and more. This library aims to provide a more Rust-like development experience while maintaining TypeScript's type safety and ease of use.

## Features

- **Trait System**: A flexible trait implementation similar to Rust's trait system
- **Option Type**: Safe handling of optional values with `Some` and `None`
- **Result Type**: Elegant error handling with `Ok` and `Err` types
- **Type-safe**: Fully typed with TypeScript for maximum safety and IDE support
- **Zero Dependencies**: No runtime dependencies, keeping your project lean
- **Rust-like Patterns**: Familiar patterns for developers with Rust experience

## Installation

```bash
npm install rustable
```

## API Reference

### Exported Modules

#### Core Trait System

- `trait(target, trait, implementation?)`: Main function to implement traits
- `useTrait(target, trait)`: Use a trait's default implementation
- `doesImplement(target, trait)`: Check if a target implements a trait

#### Built-in Traits

- `Into`: Trait for type conversion
- `into(value, type)`: Helper function for type conversion

#### Option Type

- `Option<T>`: Type representing optional values
- `Some(value)`: Constructor for present values
- `None()`: Constructor for absent values
- `isNone(value)`: Type guard for None values
- `isSome(value)`: Type guard for Some values

#### Result Type

- `Result<T, E>`: Type for error handling
- `Ok(value)`: Constructor for success values
- `Err(error)`: Constructor for error values
- `isErr(value)`: Type guard for Err values
- `isOk(value)`: Type guard for Ok values

#### Type System Utilities

- `typeId`: Get unique type identifier
- `TypeId`: Type identifier type
- `TypeIdMap`: Map using type identifiers as keys

## Usage Examples

### Working with Traits

Traits allow you to define shared behavior in an abstract way, similar to Rust's traits:

```typescript
import { trait, doesImplement } from 'rustable';

// Define a trait
class Display {
  display(this: any): string {
    return String(this);
  }
}

// Implement the trait for a class
class Point {
  constructor(public x: number, public y: number) {}
}

trait(Point, Display, {
  display(this: Point) {
    return `Point(${this.x}, ${this.y})`;
  }
});

const point = new Point(1, 2);
console.log(point.display()); // Output: Point(1, 2)
console.log(doesImplement(point, Display)); // true
```

### Type Conversion with Into

```typescript
import { Into, into } from 'rustable';

class Meters {
  constructor(public value: number) {}
}

class Centimeters {
  constructor(public value: number) {}
}

// Implement conversion from Meters to Centimeters
trait(Meters, Into, {
  into(this: Meters, _type: typeof Centimeters) {
    return new Centimeters(this.value * 100);
  }
});

const meters = new Meters(1);
const centimeters = into(meters, Centimeters);
console.log(centimeters.value); // Output: 100
```

### Working with Options

`Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`:

```typescript
import { Option, Some, None, isSome, isNone } from 'rustable';

// Working with Some values
const maybeNumber: Option<number> = Some(42);
console.log(isSome(maybeNumber)); // true
console.log(maybeNumber.unwrap()); // 42

// Safely handling None
const noValue: Option<number> = None();
console.log(isNone(noValue)); // true
console.log(noValue.unwrapOr(0)); // 0

// Chaining operations
const result = maybeNumber
  .map(x => x * 2)
  .filter(x => x > 50)
  .unwrapOr(0);
```

### Error Handling with Result

`Result` is the type used for returning and propagating errors:

```typescript
import { Result, Ok, Err, isOk, isErr } from 'rustable';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Err("Division by zero");
  }
  return Ok(a / b);
}

// Successful case
const success = divide(10, 2);
if (isOk(success)) {
  console.log(success.unwrap()); // 5
}

// Error case
const error = divide(10, 0);
if (isErr(error)) {
  console.log(error.unwrapErr()); // "Division by zero"
}

// Chain operations
const result = divide(10, 2)
  .map(x => x + 1)
  .mapErr(e => `Error: ${e}`)
  .unwrapOr(0);
```

### Using Type System Utilities

```typescript
import { typeId, TypeId, TypeIdMap } from 'rustable';

class MyClass {}

// Get type ID
const id: TypeId = typeId(MyClass);

// Use TypeIdMap
const map = new TypeIdMap<string>();
map.set(MyClass, "MyClass value");
console.log(map.get(MyClass)); // "MyClass value"
```

## Detailed API Documentation

### Trait System API

- `trait(target, trait, implementation?)`: Implements a trait for a target class
- `useTrait(target, trait)`: Uses default trait implementation
- `doesImplement(target, trait)`: Checks trait implementation
- Supports method overriding and default implementations
- Type-safe with TypeScript support

### Option API

- `isSome()`: Returns true if the option is `Some`
- `isNone()`: Returns true if the option is `None`
- `unwrap()`: Returns the value if `Some`, throws if `None`
- `unwrapOr(default)`: Returns the value or a default
- `map(fn)`: Transforms the contained value
- `flatMap(fn)`: Transforms with a function that returns an Option
- `filter(predicate)`: Filters the value based on a predicate

### Result API

- `isOk()`: Returns true if the result is `Ok`
- `isErr()`: Returns true if the result is `Err`
- `unwrap()`: Returns the success value or throws
- `unwrapOr(default)`: Returns the success value or a default
- `unwrapErr()`: Returns the error value
- `map(fn)`: Transforms the success value
- `mapErr(fn)`: Transforms the error value
- `flatMap(fn)`: Transforms with a function that returns a Result

### Type System API

- `typeId(type)`: Returns a unique identifier for a type
- `TypeIdMap`: A Map implementation using type identifiers as keys
  - `set(type, value)`: Sets a value for a type
  - `get(type)`: Gets a value for a type
  - `has(type)`: Checks if a type has a value
  - `delete(type)`: Removes a value for a type

## License

MIT License - see the [LICENSE](LICENSE) file for details
