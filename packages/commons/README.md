# @rustable/commons

A TypeScript implementation of Rust-like traits and collections, providing efficient and type-safe implementations along with common trait patterns.

## Features

- 🧰 Decorator-based trait system
- 🔒 Type-safe implementations
- 🦀 Rust-like APIs
- 🔄 Option-based value handling
- ⚡ Efficient hash-based collections
- 🎨 Default trait implementations
- 🏷️ Trait metadata
- 📦 Zero dependencies
- 🔍 Type-safe entry API for maps

## Installation

```bash
npm install @rustable/commons
# or
yarn add @rustable/commons
# or
pnpm add @rustable/commons
```

## Collections

### HashMap<K, V>

A hash map implementation similar to Rust's HashMap with efficient lookup and collision handling.

```typescript
import { HashMap } from '@rustable/commons';

// Create a new map
const map = new HashMap<string, number>();

// Insert and get values
map.insert('key', 1);
const value = map.get('key').unwrapOr(0);

// Entry API for safe insertion
map.entry('key')
   .and_modify(v => v + 1)
   .or_insert(0);

// Iterate over entries
for (const [k, v] of map) {
  console.log(`${k}: ${v}`);
}

// Other useful methods
map.remove('key');
map.contains_key('key');
map.clear();
map.len();
```

### HashSet\<T>

A hash set implementation for storing unique values.

```typescript
import { HashSet } from '@rustable/commons';

const set = new HashSet<string>();

// Basic operations
set.insert('value');
set.remove('value');
console.log(set.contains('value')); // false

// Set operations
const other = new HashSet(['a', 'b']);
set.union(other);
set.intersection(other);
set.difference(other);

// Iteration
for (const item of set) {
  console.log(item);
}
```

### Vec\<T>

A growable array implementation similar to Rust's Vec<T>.

```typescript
import { Vec } from '@rustable/commons';

// Create a new vector
const vec = Vec.new<number>();
// Or from existing array
const vec2 = Vec.from([1, 2, 3]);

// Mutate vector
vec.push(4);
vec.extend([5, 6, 7]);
const last = vec.pop(); // Some(7)

// Access elements
const first = vec.first(); // Option<T>
const item = vec.get(1); // Option<T>
vec.insert(0, 0);

// Advanced operations
vec.splice(1, 2); // Remove elements
vec.drain(0, 2); // Remove and get elements
vec.retain(x => x % 2 === 0); // Keep even numbers

// Iterator methods
vec
  .iter()
  .map(x => x * 2)
  .filter(x => x > 2)
  .collect(); // Create new Vec
```

## Traits

### Clone Trait

Provides deep cloning capability with full support for:

- Primitive types
- Complex objects with nested structures
- Arrays and collections (Map, Set)
- Special types (Date, RegExp, Error)
- Circular references
- Getter/setter properties
- Class inheritance chains

```typescript
import { derive } from '@rustable/type';
import { Clone } from '@rustable/commons';

@derive([Clone])
class ComplexObject {
  constructor(
    public nested: { x: number; y: number },
    public list: number[],
    public child?: ComplexObject,
  ) {}
}
interface ComplexObject extends Clone {}

const obj = new ComplexObject({ x: 1, y: 2 }, [1, 2, 3]);
const cloned = obj.clone(); // Deep clone with all properties
```

### From/Into Trait

Type conversion system supporting:

- Primitive type conversions
- Custom type conversions
- Generic type parameters
- Inheritance hierarchies

```typescript
import { from, From } from '@rustable/commons';

class Celsius {
  constructor(public value: number) {}
}

class Fahrenheit {
  constructor(public value: number) {}
}

// Implement conversion from Celsius to Fahrenheit
From(Celsius).implInto(Fahrenheit, {
  from(celsius: Celsius): Fahrenheit {
    return new Fahrenheit((celsius.value * 9) / 5 + 32);
  },
});

const celsius = new Celsius(100);
const fahrenheit = from(celsius, Fahrenheit); // Convert to Fahrenheit
// or
const fahrenheit = Into(Fahrenheit).wrap(celsius).into();
```

### Eq Trait

Equality comparison with support for:

- Custom equality logic
- Deep equality checks
- Type-safe comparisons

```typescript
import { derive } from '@rustable/type';
import { Eq } from '@rustable/commons';

@derive([Eq])
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
interface Point extends Eq {}

const p1 = new Point(1, 2);
const p2 = new Point(1, 2);
console.log(p1.eq(p2)); // true
```

### Iter Trait

Provides a powerful iteration interface inspired by Rust's Iterator trait:

- Lazy evaluation
- Chaining of operations
- Efficient data processing
- Compatible with various collection types

```typescript
import { derive } from '@rustable/type';
import { Iter } from '@rustable/commons';
import '@rustable/iter/advanced';

@derive([Iter])
class NumberRange {
  constructor(
    public start: number,
    public end: number,
  ) {}

  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}
interface NumberRange extends Iter<number> {}

const range = new NumberRange(1, 5);
const doubledEvenSum = range
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .sum();

console.log(doubledEvenSum); // 12 (2*2 + 4*2)
```

## License

MIT © illuxiza
