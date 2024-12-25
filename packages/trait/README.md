# @rustable/trait

A powerful TypeScript implementation of Rust-like traits, providing a flexible and type-safe way to define and implement interfaces with shared behavior.

## Features

- 🦀 Rust-like trait system in TypeScript
- 🔒 Type-safe interface implementation
- 💪 Support for generic traits
- 🎯 Multiple trait implementations
- 🔄 Runtime trait checking
- 🎨 Default implementations
- 🏷️ Decorator-based API

## Installation

```bash
npm install @rustable/trait
# or
yarn add @rustable/trait
# or
pnpm add @rustable/trait
```

## Basic Usage

### Defining a Trait

```typescript
import { trait } from '@rustable/trait';

@trait
class Display<T> {
  display(value: T): string {
    return String(value); // Default implementation
  }
}
```

### Implementing a Trait

```typescript
import { implTrait } from '@rustable/trait';

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

// Implement Display for Point
implTrait(Point, Display, {
  display() {
    return `Point(${this.x}, ${this.y})`;
  },
});
```

### Using Traits

```typescript
import { useTrait, hasTrait } from '@rustable/trait';

const point = new Point(1, 2);

// Check if type implements trait
if (hasTrait(point, Display)) {
  // Get trait implementation
  const display = useTrait(point, Display);
  console.log(display.display()); // Output: "Point(1, 2)"
}
```

## Advanced Features

### Generic Traits

```typescript
@trait
class FromStr<T> {
  fromStr(s: string): T {
    throw new Error('Not implemented');
  }
}

// Implement for specific type
implTrait(Number, FromStr, {
  fromStr(s: string): number {
    return parseFloat(s);
  },
});
```

### Multiple Implementations

```typescript
@trait
class ToString<T> {
  toString(value: T): string;
}

class MultiFormat {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
}

// Implement for different formats
implTrait(MultiFormat, ToString, 'hex', {
  toString() {
    return this.value.toString(16);
  },
});

implTrait(MultiFormat, ToString, 'binary', {
  toString() {
    return this.value.toString(2);
  },
});

// Use specific implementation
const num = new MultiFormat(42);
const hexFormat = useTrait(num, ToString, 'hex');
console.log(hexFormat.toString()); // "2a"
```

### Derive Decorator

```typescript
import { derive } from '@rustable/trait';

// Automatically implement multiple commons
@derive([Display, Clone, Debug])
class Rectangle {
  constructor(
    public width: number,
    public height: number,
  ) {}
}
```

## Type Safety

The trait system provides compile-time type checking:

```typescript
@trait
class Comparable<T> {
  compare(other: T): number;
}

// Error: Missing implementation of compare
implTrait(Point, Comparable, {}); // TypeScript error

// Correct implementation
implTrait(Point, Comparable, {
  compare(other: Point): number {
    return this.x - other.x || this.y - other.y;
  },
});
```

## Best Practices

1. **Default Implementations**: Provide sensible defaults when possible

   ```typescript
   @trait
   class ToString {
     toString(): string {
       return '[Object]'; // Default implementation
     }
   }
   ```

2. **Type Parameters**: Use generic type parameters for flexible traits

   ```typescript
   @trait
   class Into<T> {
     into(): T;
   }
   ```

3. **Error Handling**: Use descriptive error messages

   ```typescript
   @trait
   class TryFrom<T> {
     tryFrom(value: T): Result<this, Error> {
       throw new Error('Not implemented');
     }
   }
   ```

4. **Documentation**: Document trait contracts and requirements

   ```typescript
   /**
   * Trait for types that can be converted to strings.
   * Implementors should ensure that:
   * 1. The string representation is human-readable
   * 2. The conversion is deterministic
   */
   @trait
   class Display { ... }
   ```

## Error Handling

The trait system provides clear error messages:

- Missing implementation: `Trait Display not implemented for Point`
- Method conflicts: `Multiple implementations of method toString for Point`
- Invalid generic parameters: `Invalid generic type parameters for trait Display`

## Performance Considerations

- Trait lookups are cached for better performance
- Method calls have minimal overhead
- Type checking is done at runtime with optimized caching

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © illuxiza
