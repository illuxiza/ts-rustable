# @rustable/commons

Common trait implementations for the Rustable trait system, providing ready-to-use implementations of standard traits like Clone, Eq, From, and Iter.

## Features

- 🧰 Decorator-based API
- 🎨 Default implementations
- 🔄 Runtime trait checking
- 🏷️ Trait metadata

## Installation

```bash
npm install @rustable/commons
# or
yarn add @rustable/commons
# or
pnpm add @rustable/commons
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
- Temperature conversion example:

```typescript
import { from, implFrom } from '@rustable/commons';

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
import { derive } from '@rustable/trait';
import { Iter } from '@rustable/commons';

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
