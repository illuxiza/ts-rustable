# @rustable/trait

A TypeScript library that implements Rust-like traits with compile-time type checking and runtime verification.

## 📦 Installation

```bash
npm install @rustable/trait
# or
yarn add @rustable/trait
# or
pnpm add @rustable/trait
```

## ✨ Features

- 🔒 Type-safe trait definitions and implementations
- 🎯 Support for generic traits
- 🔄 Instance and static method implementations
- 🔗 Trait-to-trait implementations
- 💾 Memory-efficient using WeakMap for garbage collection
- ⚡ Performance optimized with parent trait caching

## 📖 Usage

### 🎨 Defining a Trait

```typescript
import { Trait, macroTrait } from '@rustable/trait';

// Define a trait
class DisplayTrait extends Trait {
  display(): string {
    return 'default';
  }
}

// Create a trait decorator
const Display = macroTrait(DisplayTrait);
```

### 🔧 Implementing a Trait

There are several ways to implement a trait:

1. Using the `@derive` decorator with default implementation:

```typescript
@derive([Display])
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

// The display method will use the default implementation from DisplayTrait
```

2. Using `implFor` method with custom implementation:

```typescript
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

DisplayTrait.implFor(Point, {
  display() {
    return `(${this.x}, ${this.y})`;
  },
});
```

### 🚀 Using Traits

Once a trait is implemented, you can use it in several ways:

```typescript
const point = new Point(1, 2);

// Method 1: Using wrap
const display = DisplayTrait.wrap(point);
console.log(display.display()); // "(1, 2)"

// Method 2: Checking implementation
if (DisplayTrait.isImplFor(point)) {
  const display = DisplayTrait.wrap(point);
  console.log(display.display());
}
```

### ⚙️ Static Trait Methods

Traits can also include static methods:

```typescript
class FromStrTrait extends Trait {
  static fromStr(s: string): any {
    throw new Error('Not implemented');
  }
}

const FromStr = macroTrait(FromStrTrait);

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

// Implement static methods using implFor
FromStr.implFor(Point, {
  static: {
    fromStr(s: string): Point {
      const [x, y] = s.split(',').map(Number);
      return new Point(x, y);
    },
  },
});

// Use static trait methods
const point = FromStrTrait.staticWrap(Point).fromStr('1,2');
```

## 📚 API Reference

### 🛠️ Core Functions

#### macroTrait

Creates a trait decorator for implementing traits at compile time.

```typescript
const Display = macroTrait(DisplayTrait);
const FromStr = macroTrait(FromStrTrait);

@derive([Display, FromStr])
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

// Implement custom behavior using implFor
DisplayTrait.implFor(Point, {
  display() {
    return `(${this.x}, ${this.y})`;
  },
});

FromStrTrait.implFor(Point, {
  static: {
    fromStr(s: string): Point {
      const [x, y] = s.split(',').map(Number);
      return new Point(x, y);
    },
  },
});
```

### 🔍 Trait Class Methods

The `Trait` class provides several static methods for trait operations:

#### isImplFor

Checks if a value implements the trait.

```typescript
if (DisplayTrait.isImplFor(point)) {
  // point implements DisplayTrait
  const display = DisplayTrait.wrap(point);
  console.log(display.display());
}
```

#### validFor

Validates that a value implements the trait. Throws if validation fails.

```typescript
// Throws if point doesn't implement DisplayTrait
DisplayTrait.validFor(point);
```

#### wrap

Wraps a value as a trait instance. Supports both instance and constructor wrapping.

```typescript
// Wrap instance
const point = new Point(1, 2);
const display = DisplayTrait.wrap(point);
console.log(display.display());

// Wrap constructor
const PointDisplay = DisplayTrait.wrap(Point);
const newPoint = new PointDisplay(3, 4);
```

#### staticWrap

Wraps a class to access static trait methods.

```typescript
// Wrap Point's static methods
const PointFromStr = FromStrTrait.staticWrap(Point);
const point = PointFromStr.fromStr('1,2');
```

#### implFor

Implements a trait for a target class.

```typescript
DisplayTrait.implFor(Point, {
  display() {
    return `(${this.x}, ${this.y})`;
  },
});
```

#### tryImplFor

Similar to `implFor`, but doesn't throw if the trait is already implemented.

```typescript
DisplayTrait.tryImplFor(Point, {
  display() {
    return `(${this.x}, ${this.y})`;
  },
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © illuxiza
