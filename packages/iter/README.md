# @rustable/iter

A TypeScript library providing Rust-style iterator adapters with a rich set of functional operations for collection manipulation.

## Overview

@rustable/iter brings Rust's powerful iterator patterns to TypeScript, enabling functional, lazy, and composable operations on collections. It provides a rich set of iterator adapters that can be chained together to create complex data transformations with minimal overhead.

## Features

- 🚀 **Lazy Evaluation** - Computations are performed only when needed
- 🔗 **Chainable API** - Fluent interface for composing operations
- 📦 **Zero Dependencies** - Lightweight and self-contained
- 🛡️ **Type Safe** - Full TypeScript support with strong type inference
- 🦀 **Rust-Inspired** - Familiar API for Rust developers
- 🎯 **Tree-Shakeable** - Only import what you need

## Installation

```bash
npm install @rustable/iter

# or with yarn
yarn add @rustable/iter

# or with pnpm
pnpm add @rustable/iter
```

## Usage

```typescript
import { iter, range } from '@rustable/iter';

// Basic transformations
iter([1, 2, 3, 4, 5])
  .map((x) => x * 2)
  .filter((x) => x > 5)
  .collect(); // [6, 8, 10]

// Working with strings
iter('hello').enumerate().collect(); // [[0, 'h'], [1, 'e'], [2, 'l'], [3, 'l'], [4, 'o']]

// Numeric ranges
range(0, 5)
  .map((x) => x * x)
  .collect(); // [0, 1, 4, 9, 16]
```

## API

### Creation

- `iter(iterable)` - Create iterator from any iterable
- `range(start, end, step?)` - Create numeric range iterator

### Transformation

- `map(fn)` - Transform each element
- `filter(predicate)` - Keep elements matching predicate
- `flatMap(fn)` - Map and flatten results
- `flatten()` - Flatten nested iterables

### Subsetting

- `take(n)` - Take first n elements
- `skip(n)` - Skip first n elements
- `stepBy(n)` - Take every nth element
- `takeWhile(predicate)` - Take while predicate is true

### Combining

- `zip(other)` - Combine with another iterator
- `chain(other)` - Append another iterator
- `interleave(other)` - Alternate elements with another iterator

### Grouping

- `groupBy(fn)` - Group elements by key
- `uniq()` - Remove consecutive duplicates
- `uniqBy(fn)` - Remove duplicates by key

### Terminal Operations

- `collect()` - Collect into array
- `reduce(fn, initial?)` - Reduce to single value
- `forEach(fn)` - Execute for each element
- `find(predicate)` - Find first matching element

## Examples

### Lazy Evaluation

```typescript
const iter = iter([1, 2, 3, 4, 5])
  .map((x) => {
    console.log(`Processing ${x}`);
    return x * 2;
  })
  .filter((x) => x > 5);

// Nothing logged yet - no processing has occurred
const result = iter.collect(); // Now the processing happens
```

### Complex Transformations

```typescript
// Process user data
interface User {
  id: number;
  name: string;
  age: number;
}

const users: User[] = [
  /* ... */
];

iter(users)
  .filter((user) => user.age >= 18)
  .map((user) => ({
    id: user.id,
    displayName: user.name.toUpperCase(),
  }))
  .groupBy((user) => user.id)
  .collect();

// String processing
iter('Hello World!')
  .flatMap((s) => s.split(' '))
  .map((s) => s.toLowerCase())
  .filter((s) => s.length > 3)
  .collect(); // ['hello', 'world']

// Generate Fibonacci sequence
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

iter(fibonacci()).take(10).collect(); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Illuxiza
