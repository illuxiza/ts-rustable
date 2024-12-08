# @rustable/coll

A TypeScript implementation of Rust-like collections, providing efficient and type-safe data structures.

## Features

- 🔐 Type-safe implementations
- 🎯 Rust-like APIs
- 🔄 Option-based value handling
- ⚡ Efficient hash-based storage
- 🧰 Standard interface compatibility

## Installation

```bash
npm install @rustable/coll
# or
yarn add @rustable/coll
# or
pnpm add @rustable/coll
```

## Collections

### HashMap<K, V>

A type-safe hash map implementation similar to Rust's HashMap.

```typescript
import { HashMap } from '@rustable/coll';

const map = new HashMap<string, number>();
map.set('one', 1);

const value = map.get('one')
  .map(n => n * 2)
  .unwrapOr(0); // 2

// Iteration
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}
```

### HashSet<T>

A type-safe hash set implementation for unique value storage.

```typescript
import { HashSet } from '@rustable/coll';

const set = new HashSet<string>();
set.add('one');
set.add('two');

console.log(set.has('one')); // true
console.log(set.size); // 2

// Iteration
for (const value of set) {
  console.log(value);
}
```

### Vec<T>

A dynamic array implementation with Rust-like methods.

```typescript
import { Vec } from '@rustable/coll';

const vec = new Vec<number>();
vec.push(1);
vec.push(2);

// Array-like operations
vec.pop(); // Some(2)
vec[0]; // 1

// Iteration and transformations
vec.map(x => x * 2)
   .filter(x => x > 0)
   .forEach(x => console.log(x));
```

## License

MIT © illuxiza
