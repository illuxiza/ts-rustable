# @rustable/coll

A TypeScript implementation of Rust-like collections, providing efficient and type-safe data structures.

## Features

- 🔒 Type-safe implementations
- 🦀 Rust-like APIs
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

## Usage

### HashMap<K, V>

```typescript
import { HashMap } from '@rustable/coll';

const map = new HashMap<string, number>();
map.insert('key', 1);
const value = map.get('key').unwrapOr(0);

for (const [k, v] of map) {
  console.log(`${k}: ${v}`);
}
```

### HashSet\<T>

```typescript
import { HashSet } from '@rustable/coll';

const set = new HashSet<string>();
set.insert('value');
console.log(set.contains('value')); // true

for (const item of set) {
  console.log(item);
}
```

### Vec\<T>

```typescript
import { Vec } from '@rustable/coll';

const vec = Vec.from([1, 2, 3]);
vec.push(4);
const last = vec.pop(); // Some(4)

vec
  .iter()
  .map((x) => x * 2)
  .filter((x) => x > 2)
  .forEach(console.log);
```

## License

MIT © illuxiza
