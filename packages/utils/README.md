# @rustable/utils

This is the utilities package of the Rustable project, providing fundamental utilities and type management functionalities. The package implements essential features like type identification, object cloning, hashing, string manipulation, and mutable references.

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

### Mutable Reference (`mut.ts`)

- Provides a mutable reference with getter and setter functions
- Supports generic types for flexible usage

### Immutable Reference (`ref.ts`)

- Provides an immutable reference to values
- Creates a deep clone of the original value
- Supports independent modifications without affecting the original

## Usage

Import the required utilities from the package:

```typescript
import { typeId, clone, hash, stringify, Mut, Ref } from '@rustable/utils';
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

### Example: Using Mutable Reference

```typescript
import { Mut } from '@rustable/utils';

// Create a mutable object reference
let obj = { name: 'Alice', age: 30 };
const mutRef = Mut.of({
  get: () => obj,
  set: (newValue) => {
    obj = newValue;
  },
});

// Access and modify properties directly
console.log(mutRef.name); // Output: 'Alice'
mutRef.age = 31;
console.log(obj.age); // Output: 31

// Replace entire object using Mut.ptr
mutRef[Mut.ptr] = { name: 'Bob', age: 25 };
console.log(obj); // Output: { name: 'Bob', age: 25 }

// Get current value using Mut.ptr
console.log(mutRef[Mut.ptr]); // Output: { name: 'Bob', age: 25 }

// Replace using Mut.replace helper
Mut.replace(mutRef, { name: 'Charlie', age: 20 });
console.log(obj); // Output: { name: 'Charlie', age: 20 }

// Working with nested objects
let nested = {
  info: {
    name: 'Alice',
    hobbies: ['reading'],
  },
};
const nestedRef = Mut.of({
  get: () => nested,
  set: (newValue) => {
    nested = newValue;
  },
});

// Modify nested properties
nestedRef.info.hobbies.push('coding');
console.log(nested.info.hobbies); // Output: ['reading', 'coding']

// Replace nested object
Mut.replace(nestedRef, {
  info: {
    name: 'Bob',
    hobbies: ['gaming'],
  },
});
console.log(nested); // Output: { info: { name: 'Bob', hobbies: ['gaming'] } }
```

### Example: Using Immutable Reference

```typescript
import { Ref } from '@rustable/utils';

// Create a reference
const obj = { name: 'Alice', age: 30 };
const ref = Ref.of(obj);

// Modify the reference
ref.name = 'Bob';
console.log(ref.name); // 'Bob'

// Original remains unchanged
console.log(obj.name); // 'Alice'

// Access original through ptr
console.log(ref[Ref.ptr].name); // 'Alice'
```

## Ref

The `Ref` type provides a way to create immutable references to values. Unlike `Mut`, which tracks mutations to the original value, `Ref` creates an independent copy that can be modified without affecting the original.

### Usage

```typescript
import { Ref } from '@congeer/utils';

// Create a reference
const obj = { name: 'Alice', age: 30 };
const ref = Ref.of(obj);

// Modify the reference
ref.name = 'Bob';
console.log(ref.name); // 'Bob'

// Original remains unchanged
console.log(obj.name); // 'Alice'

// Access original through ptr
console.log(ref[Ref.ptr].name); // 'Alice'
```

### Features

- **Deep Cloning**: Creates a deep clone of the original value, ensuring complete isolation
- **Independent Modifications**: The reference can be freely modified without affecting the original
- **Original Access**: The original value can be accessed through `Ref.ptr` symbol
- **Method Support**: All methods work on the cloned value, preserving the original

### Example with Complex Objects

```typescript
// Arrays
const arr = [1, 2, 3];
const arrRef = Ref.of(arr);

arrRef.push(4);
console.log([...arrRef]); // [1, 2, 3, 4]
console.log(arr); // [1, 2, 3]

// Objects with Methods
class User {
  constructor(public name: string) {}
  setName(name: string) {
    this.name = name;
    return this;
  }
}

const user = new User('Alice');
const userRef = Ref.of(user);

userRef.setName('Bob');
console.log(userRef.name); // 'Bob'
console.log(user.name); // 'Alice'
```

### When to Use

- When you need to experiment with modifications without affecting the original
- When you want to maintain a separate copy of a value
- When you need to compare modified state with original state
- In scenarios where immutability of the original value is critical

### Comparison with Mut

While `Mut` tracks and propagates changes to the original value, `Ref` provides isolation:

```typescript
// Mut modifies original
const mut = Mut.of({ value: 1 });
mut.value = 2;
console.log(mut[Mut.ptr].value); // 2

// Ref keeps original unchanged
const ref = Ref.of({ value: 1 });
ref.value = 2;
console.log(ref[Ref.ptr].value); // 1
```

## Notes

- All utilities are designed with TypeScript's type system in mind
- The package uses WeakMap for efficient memory management
- Generic type support is available where applicable
- The `Mut` type provides a proxy-based mutable reference that allows direct property access and modification
- The `Ref` type provides an immutable reference to values, creating a deep clone of the original value

## License

MIT  illuxiza
