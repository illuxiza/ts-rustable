# @rustable/trait-impls

A TypeScript implementation of Rust-like traits system, providing core traits such as Clone, Eq, and From with full type safety and decorator support.

## Features

- 🧰 Decorator-based API
- 🎨 Default implementations
- 🔄 Runtime trait checking
- 🏷️ Trait metadata

## Installation

```bash
npm install @rustable/trait-impls
# or
yarn add @rustable/trait-impls
# or
pnpm add @rustable/trait-impls

```

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
import { derive } from '@rustable/trait';
import { Clone } from '@rustable/trait-impls';

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
- Temperature conversion example:

```typescript
import { from, implFrom } from '@rustable/trait-impls';

class Celsius {
  constructor(public value: number) {}
}

class Fahrenheit {
  constructor(public value: number) {}
}

// Implement conversion from Celsius to Fahrenheit
implFrom(Fahrenheit, Celsius, {
  from(celsius: Celsius): Fahrenheit {
    return new Fahrenheit((celsius.value * 9) / 5 + 32);
  },
});

const celsius = new Celsius(100);
const fahrenheit = from(celsius, Fahrenheit); // Convert to Fahrenheit
```

### Eq Trait

Equality comparison with support for:

- Custom equality logic
- Deep equality checks
- Type-safe comparisons

```typescript
import { derive } from '@rustable/trait';
import { Eq } from '@rustable/trait-impls';

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

## License

MIT © illuxiza
