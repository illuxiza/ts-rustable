# Rustable

A TypeScript library that brings Rust's powerful features and patterns to TypeScript development. Rustable provides type-safe implementations of Rust's most valuable patterns while maintaining TypeScript's ease of use.

## Core Features

### Trait-Based Programming

- Type-safe trait implementation similar to Rust
- Multiple trait inheritance support
- Compile-time trait checking
- Runtime trait querying

### Safe Optional and Result Types

- Safe handling of nullable values with `Option<T>`
- Error handling with `Result<T, E>`
- Rich set of combinators (`map`, `andThen`, `unwrapOr`)
- Pattern matching support

### Type Conversion System

- `From` trait for type conversion
- Type-safe conversion between compatible types
- Zero runtime overhead conversions

### Functional Collection Utilities

- Rust-like iterator namespace with `iter` object
- Lazy evaluation for better performance
- Rich set of operations: `takeWhile`, `skipWhile`, `chunks`
- Advanced operations: `permutations`, `combinations`, `product`, `zip`
- Memory-efficient implementations

### Type-Safe Data Structures

- `HashMap`: Efficient key-value storage
- Type-safe implementations
- Rust-inspired APIs
- Option-based value retrieval

### Pattern Matching System

- Custom enum definitions with variants
- Type-safe pattern matching
- Exhaustive variant checking
- Support for variant arguments

### Core Utilities

- Runtime type identification with `TypeId`
- Consistent hash generation
- Efficient string representation
- Zero-cost abstractions

### Clone System

- Provides deep cloning functionality for objects
- Handles complex object structures and circular references
- Supports cloning of special types like Date, RegExp, Set, Map, Error, and more
- Preserves prototype chains and handles circular references efficiently

## Getting Started

### Package Installation

```bash
npm install rustable
```

### Code Examples

#### Implementing Traits

```typescript
import { trait, implTrait, hasTrait, useTrait } from 'rustable';

// Define a trait
@trait
class Display {
  display(): string {
    throw new Error('Not implemented');
  }
}

// Implement the trait
class Person {
  constructor(public name: string) {}
}

implTrait(Person, Display, {
  display(this: Person) {
    return `Person(${this.name})`;
  }
});

// Check trait implementation
const person = new Person("Alice");
console.log(hasTrait(person, Display)); // true
```

#### Type Conversion

```typescript
import { From, from, implFrom } from 'rustable';

// Define types
class Celsius {
  constructor(public value: number) {}
}

class Fahrenheit {
  constructor(public value: number) {}
}

// Implement From trait for temperature conversion
implFrom(Celsius, Fahrenheit, {
  from(fahrenheit: Fahrenheit) {
    return new Celsius((fahrenheit.value - 32) * 5/9);
  }
});

implFrom(Fahrenheit, Celsius, {
  from(celsius: Celsius) {
    return new Fahrenheit((celsius.value * 9/5) + 32);
  }
});

// Convert using From
const fahrenheit = new Fahrenheit(212);
const celsius = from(fahrenheit, Celsius);
console.log(celsius.value); // 100

// Convert using Into
const backToFahrenheit = celsius.into(Fahrenheit);
console.log(backToFahrenheit.value); // 212
```

#### Optional Value Management

```typescript
import { Option, Some, None } from 'rustable';

// Working with Option
function findUser(id: number): Option<string> {
  const users = new Map([[1, "Alice"], [2, "Bob"]]);
  return users.has(id) ? Some(users.get(id)!) : None;
}

// Chain operations
const userName = findUser(1)
  .map(name => name.toUpperCase())
  .filter(name => name.length > 3)
  .unwrapOr("Unknown");

// Pattern matching
const greeting = findUser(2).match({
  Some: name => `Hello, ${name}!`,
  None: () => "User not found"
});
```

#### Result-Based Error Handling

```typescript
import { Result, Ok, Err } from 'rustable';

// Working with Result
function divide(a: number, b: number): Result<number, Error> {
  return b === 0 
    ? Err(new Error("Division by zero"))
    : Ok(a / b);
}

// Chain operations with error handling
const result = divide(10, 2)
  .map(n => n * 2)
  .mapErr(e => new Error(`Calculation error: ${e.message}`))
  .andThen(n => n > 0 ? Ok(n) : Err(new Error("Negative result")))
  .unwrapOr(0);

// Pattern matching with Result
const message = divide(10, 0).match({
  Ok: value => `Result: ${value}`,
  Err: error => `Error: ${error.message}`
});
```

#### Advanced Collection Operations

```typescript
import { iter } from 'rustable';

const numbers = [1, 2, 3, 4, 5];
const letters = ['a', 'b', 'c'];

// Take and skip operations
console.log([...iter.takeWhile(numbers, n => n < 4)]); // [1, 2, 3]
console.log([...iter.skipWhile(numbers, n => n < 3)]); // [3, 4, 5]

// Chunking and windowing
console.log([...iter.chunks(numbers, 2)]); // [[1, 2], [3, 4], [5]]
console.log([...iter.windows(numbers, 3)]); // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]

// Pairing and enumeration
console.log([...iter.pairwise(numbers)]); // [[1, 2], [2, 3], [3, 4], [4, 5]]
console.log([...iter.enumerate(numbers)]); // [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]

// Grouping
const words = ['one', 'two', 'three'];
const groups = [...iter.groupBy(words, word => word.length)];
// [[3, ['one', 'two']], [5, ['three']]]

// Combinatorics
console.log([...iter.product([1, 2], ['a', 'b'])]); 
// [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]

console.log([...iter.permutations([1, 2, 3])]); 
// [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]

console.log([...iter.combinations([1, 2, 3, 4], 2)]); 
// [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]

// Zipping iterables
console.log([...iter.zip(numbers, letters)]); 
// [[1, 'a'], [2, 'b'], [3, 'c']]
```

#### HashMap Implementation

```typescript
import { HashMap } from 'rustable';

// Create a type-safe hash map
const map = new HashMap<string, number>();

// Basic operations
map.set('one', 1);
map.set('two', 2);

console.log(map.get('one')); // 1
console.log(map.has('three')); // false

// Iterate over entries
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}

// Delete and clear
map.delete('one');
console.log(map.size); // 1
map.clear();
```

#### Enum Pattern Matching

```typescript
import { Enum, variant } from 'rustable';

// Define a custom enum
class HttpResponse extends Enum {
  @variant
  static OK(data: any): HttpResponse {
    return undefined as any;
  }

  @variant
  static NotFound(path: string): HttpResponse {
    return undefined as any;
  }

  @variant
  static Error(message: string): HttpResponse {
    return undefined as any;
  }
}

// Create and match on variants
const response = HttpResponse.OK({ id: 1, name: "Item" });

const result = response.match({
  OK: data => `Success: ${JSON.stringify(data)}`,
  NotFound: path => `404: ${path} not found`,
  Error: msg => `Error: ${msg}`
});
```

#### Clone System Implementation

```typescript
import { Clone } from 'rustable';

@derive([Clone])
class MyClass {
    constructor(public name: string, public data: any) {}
}

const original = new MyClass('example', { key: 'value' });
const cloned = original.clone();

console.log(cloned !== original); // true
console.log(cloned.data !== original.data); // true
```

#### Core Utility Functions

```typescript
import { hash, stringify, typeId } from 'rustable';

// Generate hash values
console.log(hash("hello")); // Consistent hash value

// Stringify complex objects
const obj = { name: "test", values: [1, 2, 3] };
console.log(stringify(obj)); // Pretty-printed string

// Get unique type IDs
class MyClass {}
console.log(typeId(MyClass)); // Unique type identifier
```

## API Documentation

### Trait System Interface

The trait system allows you to define and implement interfaces in a type-safe way:

- `@trait`: Decorator to define a trait
- `implTrait`: Function to implement a trait for a class
- `hasTrait`: Check if a type implements a trait
- `useTrait`: Get trait implementation for a target

### Type Conversion Interface

Type-safe conversion between compatible types:

- `From<T>`: Trait for converting from type T
- `from<T>`: Function to convert from type T
- `implFrom<T1, T2>`: Function to implement From<T1> for T2
- `Object.into<T>`: Conversion method from Object to T

### Option Type Operations

`Option<T>` represents an optional value that may or may not exist:

- `Some(value)`: Create an Option containing a value
- `None`: Represents absence of a value
- Methods: `map`, `andThen`, `unwrapOr`, `match`, etc.

### Result Type Operations

`Result<T, E>` represents either success (`Ok`) or failure (`Err`):

- `Ok(value)`: Successful result
- `Err(error)`: Error result
- Methods: `map`, `mapErr`, `andThen`, `match`, etc.

### Iterator Type Operations

Rich set of iterator operations:

- `takeWhile`: Take elements while predicate is true
- `skipWhile`: Skip elements while predicate is true
- `chunks`: Split iterator into chunks
- `windows`: Create sliding windows
- `product`: Compute cartesian product
- `permutations`: Generate all permutations
- `combinations`: Generate all combinations
- `zip`: Zip iterables

### HashMap Operations

Type-safe key-value storage:

- `set(key, value)`: Insert or update a value
- `get(key)`: Retrieve a value as Option
- `delete(key)`: Remove a value
- `has(key)`: Check key existence
- `clear()`: Remove all entries

### Pattern Matching Operations

Enum-based pattern matching system:

- `@variant`: Decorator for enum variants
- `match`: Pattern matching on variants
- Type-safe variant handling
- Exhaustive matching checks

### Clone System Operations

- `clone()`: Deep clone an object
- `derive([Clone])`: Derive Clone trait for a class

### Utility Operations

Core utility functions:

- `typeId`: Get unique type identifier
- `hash`: Generate consistent hash
- `stringify`: Convert to string representation

## Project Information

### Contributing Guidelines

We welcome contributions! Please feel free to submit a Pull Request.

### License Terms

MIT License - see the [LICENSE](LICENSE) file for details.

### Project Credits

Inspired by Rust's excellent standard library and its emphasis on safety and expressiveness.
