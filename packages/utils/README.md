# @rustable/utils

Essential utilities for object cloning, string manipulation, and value comparison in TypeScript, inspired by Rust's standard library.

## Installation

```bash
npm install @rustable/utils
# or
yarn add @rustable/utils
# or
pnpm add @rustable/utils
```

## Key Components

### String Manipulation (`stringify.ts`)

- Robust string conversion for all JavaScript types
- Handles circular references and complex objects
- Produces deterministic output by sorting object keys
- Comprehensive type conversion rules

```typescript
import { stringify } from '@rustable/utils';

// Basic value stringification
stringify(42);              // '42'
stringify('hello');         // 'hello'
stringify(null);           // ''
stringify(undefined);      // ''

// Complex object stringification
const user = {
  name: 'John',
  info: { age: 30 }
};
stringify(user);  // '{info:{age:30},name:"John"}'

// Special types
stringify(Symbol('key'));  // 'Symbol(key)'
stringify(42n);           // '42'
stringify(() => {});      // 'function...'

// Arrays and Maps
stringify([1, 2, 3]);     // '[1,2,3]'
stringify(new Map([['a', 1]])); // 'Map{a:1}'

// Dates
stringify(new Date(1234567890)); // 'Date("1234567890")'
```

### Hashing (`hash.ts`)

- Consistent hash values for all JavaScript types
- Special handling for primitives and objects

```typescript
import { hash } from '@rustable/utils';

// Primitive values
hash('hello');         // djb2 hash of the string
hash(42);             // 42 (number as is)
hash(true);           // 1
hash(false);          // 0
hash(null);           // -1
hash(undefined);      // -1

// Objects are hashed based on their string representation
const obj = { x: 1, y: 2 };
hash(obj);            // hash of '{x:1,y:2}'
```

### Object Cloning (`clone.ts`)

- Comprehensive deep cloning system
- Handles circular references
- Supports custom clone methods
- Special handling for built-in types (Date, RegExp, Set, Map)

```typescript
import { deepClone } from '@rustable/utils';

// Clone primitive values
const num = deepClone(42);
const str = deepClone("hello");

// Clone complex objects
const original = {
  date: new Date(),
  regex: /test/g,
  set: new Set([1, 2, 3]),
  map: new Map([['a', 1], ['b', 2]]),
  nested: { array: [1, 2, 3] }
};

const cloned = deepClone(original);
// Each property is properly cloned:
// - date is a new Date instance
// - regex is a new RegExp
// - set is a new Set
// - map is a new Map
// - nested objects are deeply cloned

// Custom clone method support
class Point {
  constructor(public x: number, public y: number) {}
  clone() {
    return new Point(this.x, this.y);
  }
}

const point = new Point(1, 2);
const clonedPoint = deepClone(point); // Uses Point's clone method
```

### Equality Comparison (`eq.ts`)

- Deep equality comparison using value serialization
- Handles all JavaScript types consistently
- Supports complex objects and nested structures

```typescript
import { equals } from '@rustable/utils';

// Compare primitive values
equals(42, 42);              // true
equals("hello", "hello");    // true

// Compare objects
equals({ x: 1 }, { x: 1 });  // true
equals([1, 2], [1, 2]);      // true

// Compare nested structures
const obj1 = { data: { points: [1, 2] } };
const obj2 = { data: { points: [1, 2] } };
equals(obj1, obj2);          // true
```

### Value Management (`val.ts`)

- Provides utilities for value manipulation and comparison
- Supports primitive and object types
- Implements safe equality comparisons

```typescript
import { Val } from '@rustable/utils';

// Create an immutable reference
const original = { count: 0, data: [1, 2, 3] };
const val = Val(original);

// Modifications don't affect original
val.count = 1;
val.data.push(4);
console.log(original.count);     // Still 0
console.log(original.data);      // Still [1, 2, 3]

// Access original through symbol
const originalRef = val[Val.ptr];
console.log(originalRef === original);  // true
```

### Pointer Management (`ptr.ts`)

- Provides mutable reference functionality
- Supports transparent property access
- Includes value replacement utilities
- Type-safe implementation

```typescript
import { Ptr } from '@rustable/utils';

// Basic pointer usage with method support
class Counter {
  count = 0;
  increment() { this.count++; }
}

let counter = new Counter();
const ptr = Ptr({
  get: () => counter,
  set: (v) => counter = v
});

// Method calls and property access work transparently
ptr.increment();
console.log(counter.count);  // 1

// Value replacement
Ptr.replace(ptr, new Counter());
```

## Advanced Usage

### Combining Features

```typescript
import { Ptr, Val, stringify, equals } from '@rustable/utils';

// Safe reference with immutable copies
class SafeReference<T> {
  private ptr: Ptr<T>;
  
  constructor(value: T) {
    let current = Val(value);  // Immutable copy
    this.ptr = Ptr({
      get: () => current,
      set: (v) => current = Val(v)  // New immutable copy on set
    });
  }
  
  get value(): T {
    return this.ptr[Ptr.ptr];
  }
  
  modify(fn: (value: T) => T) {
    Ptr.replace(this.ptr, fn(this.value));
  }
  
  toString() {
    return stringify(this.value);
  }
  
  equals(other: T) {
    return equals(this.value, other);
  }
}

// Usage example combining multiple features
const ref = new SafeReference({ data: [1, 2, 3] });
ref.modify(val => ({ data: [...val.data, 4] }));
console.log(ref.toString());  // '{data:[1,2,3,4]}'
console.log(ref.equals({ data: [1, 2, 3, 4] }));  // true
```

## Notes

- All utilities are designed with TypeScript's type system in mind
- The package uses WeakMap for efficient memory management
- The `Ptr` type provides a proxy-based mutable reference
- The `Val` type provides an immutable reference with deep cloning
- All string conversions handle circular references and special types
- Hash values are consistent across different runs

## License

MIT © illuxiza
