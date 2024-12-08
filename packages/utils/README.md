# Utils Package

This is the utilities package of the Rustable project, providing fundamental utilities and type management functionalities. The package implements essential features like type identification, object cloning, hashing, and string manipulation.

## Installation

```bash
npm install @rustable/utils
# or
yarn add @rustable/utils
# or
pnpm add @rustable/utils
```

## Key Components

### Type Identification System (`type_id.ts`)

- Provides a robust type identification system
- Uses WeakMap for efficient memory management
- Supports generic type parameters
- Ensures type safety using TypeScript's branded type pattern

### String Manipulation (`stringify.ts`)

- Advanced string manipulation and conversion utilities
- Handles complex object to string conversions

### Hashing (`hash.ts`)

- Implements hashing functionality for various data types
- Provides consistent hash generation

### Object Cloning (`clone.ts`)

- Deep cloning utilities for objects
- Handles complex data structures

### Equality Comparison (`eq.ts`)

- Implements equality comparison functionality
- Supports deep equality checks

## Usage

Import the required utilities from the package:

```typescript
import { typeId, clone, hash, stringify } from '@rustable/utils';
```

### Example: Using Type ID

```typescript
class MyClass {}
const id = typeId(MyClass); // Get type ID for class

// With generic parameters
class Container<T> {}
const stringContainerId = typeId(Container, [String]);
```

### Example: Deep Cloning

```typescript
import { deepCopy } from '@rustable/utils';

// Cloning simple objects
const original = { name: 'John', age: 30 };
const clone = deepCopy(original);

// Cloning complex objects with circular references
const complexObj = {
  data: [1, 2, 3],
  date: new Date(),
};
complexObj.self = complexObj; // circular reference
const cloned = deepCopy(complexObj);
```

### Example: Hashing

```typescript
import { hash } from '@rustable/utils';

// Hash simple values
const numberHash = hash(42);
const stringHash = hash('Hello World');

// Hash objects
const objectHash = hash({ x: 1, y: 2 });
const arrayHash = hash([1, 2, 3]);
```

### Example: Equality Comparison

```typescript
import { equals } from '@rustable/utils';

// Compare simple values
console.log(equals(5, 5)); // true
console.log(equals('hello', 'hello')); // true

// Compare objects
const obj1 = { x: 1, y: [1, 2, 3] };
const obj2 = { x: 1, y: [1, 2, 3] };
console.log(equals(obj1, obj2)); // true
```

## Notes

- All utilities are designed with TypeScript's type system in mind
- The package uses WeakMap for efficient memory management
- Generic type support is available where applicable

## License

MIT © illuxiza
