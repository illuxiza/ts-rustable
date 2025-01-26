# @rustable/trait

A powerful TypeScript implementation of Rust-like traits, providing a flexible and type-safe way to define and implement interfaces with shared behavior. This package brings Rust's trait system to TypeScript, enabling better code organization, reusability, and type safety.

## ✨ Features

- 🦀 **Rust-like Trait System**: Familiar syntax and behavior for Rust developers
- 🔒 **Type Safety**: Full compile-time type checking and runtime verification
- 💪 **Generic Traits**: Support for generic type parameters and constraints
- 🎯 **Multiple Implementations**: Implement multiple traits for a single type
- 🔄 **Runtime Checking**: Dynamic trait verification with `hasTrait` and `useTrait`
- 🎨 **Default Implementations**: Provide default behavior in trait definitions
- 🏷️ **Decorator API**: Easy-to-use decorators for trait implementation
- 🔧 **Static Methods**: Support for both instance and static trait methods
- 📦 **Memory Efficient**: Uses WeakMap for automatic garbage collection
- 🚀 **Performance Optimized**: Smart caching of trait inheritance chains

## 📦 Installation

```bash
npm install @rustable/trait
# or
yarn add @rustable/trait
# or
pnpm add @rustable/trait
```

## 🚀 Quick Start

### Defining a Trait

```typescript
import { trait, macroTrait } from '@rustable/trait';

// Define a trait with generic type parameter
@trait
class DisplayTrait<T> {
  // Default implementation
  display(value: T): string {
    return String(value);
  }
  
  // Method without default implementation
  format(): string {
    throw new Error('Not implemented');
  }
}

// Create the trait macro for use with decorators
export const Display = macroTrait(DisplayTrait);
```

### Implementing a Trait

There are two ways to implement traits:

#### 1. Using Decorators (Recommended)

```typescript
import { derive } from '@rustable/utils';

@derive([Display])
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
  
  // Override default display implementation
  display(): string {
    return `Point(${this.x}, ${this.y})`;
  }
}
```

#### 2. Using implTrait Function

```typescript
import { implTrait } from '@rustable/trait';

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

// Implement trait with instance and static methods
implTrait(Point, Display, {
  display() {
    return `Point(${this.x}, ${this.y})`;
  },
  format() {
    return `(${this.x}, ${this.y})`;
  },
  static: {
    isValid(s: string): boolean {
      return /^\d+,\d+$/.test(s);
    }
  }
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
  console.log(display.format()); // Output: "(1, 2)"
}

// Using static methods
if (hasTrait(Point, Display)) {
  const displayStatic = useTrait(Point, Display);
  console.log(displayStatic.isValid("1,2")); // Output: true
}
```

## 🔥 Advanced Features

### Generic Traits with Constraints

```typescript
@trait
class FromStr<T> {
  fromStr(s: string): T {
    throw new Error('Not implemented');
  }
  
  static isValid(s: string): boolean {
    return true;
  }
}

// Implement for specific type
implTrait(Number, FromStr, {
  fromStr(s: string): number {
    return parseFloat(s);
  },
  static: {
    isValid(s: string): boolean {
      return !isNaN(parseFloat(s));
    }
  }
});
```

### Trait Inheritance

```typescript
@trait
class ToString {
  toString(): string {
    throw new Error('Not implemented');
  }
}

@trait
class Display extends ToString {
  display(): string {
    return this.toString();
  }
}
```

### Multiple Trait Implementations

```typescript
@derive([Display, FromStr, ToString])
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
  
  toString() {
    return `${this.x},${this.y}`;
  }
  
  static fromStr(s: string): Point {
    const [x, y] = s.split(',').map(Number);
    return new Point(x, y);
  }
}
```

### Trait-to-Trait Implementations

Traits can implement other traits. When a trait implements another trait, any class implementing the first trait automatically gets the second trait's implementation.

```typescript
import { trait, implTrait, useTrait } from '@rustable/trait';

@trait
class Display {
  display(): string {
    return 'Display';
  }
}

@trait
class Debug {
  debug(): string {
    return 'Debug';
  }
}

// Implement Display for Debug trait
implTrait(Debug, Display);

// Create a class and implement Debug
class MyClass {}
implTrait(MyClass, Debug);

// MyClass automatically gets both Debug and Display traits
const instance = new MyClass();
console.log(useTrait(instance, Debug).debug());     // Output: "Debug"
console.log(useTrait(instance, Display).display()); // Output: "Display"
```

### Type-Safe Trait Wrappers

The `TraitWrapper` class provides type-safe methods for working with traits. By extending `TraitWrapper`, your trait classes get convenient static methods for type checking and conversion.

```typescript
import { trait } from '@rustable/trait';

@trait
class Display extends TraitWrapper {
  display(): string {
    return 'Display';
  }
}

// Type-safe trait checking
if (Display.hasTrait(someValue)) {
  // TypeScript knows someValue implements Display
  const display = Display.wrap(someValue);
  console.log(display.display());
}

// Throws if someValue doesn't implement Display
Display.validType(someValue);

// Type-safe wrapper with validation
const display = Display.wrap(someValue);
console.log(display.display());
```

## 📚 API Reference

### Core Decorators

- `@trait`: Marks a class as a trait
- `@derive`: Implements traits for a class

### Functions

- `implTrait(target, trait, implementation)`: Manually implement a trait
- `hasTrait(target, trait)`: Check if a value implements a trait
- `useTrait(target, trait)`: Get trait implementation
- `macroTrait(traitClass)`: Create a trait decorator

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © illuxiza
