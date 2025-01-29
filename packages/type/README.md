# @rustable/type

A TypeScript implementation of Rust-like type system with generic support and runtime type information.

## Installation

```bash
npm install @rustable/type
# or
yarn add @rustable/type
# or
pnpm add @rustable/type
```

## Key Components

### Type System (`type.ts`)

Provides a comprehensive type management system with the following features:

#### Type Identification

- `typeId()`: Generate unique type identifiers
- Supports both class constructors and instances
- Handles generic type parameters
- Uses WeakMap for efficient caching and garbage collection

```typescript
import { typeId } from '@rustable/type';

// Basic type identification
class MyClass {}
const id = typeId(MyClass);

// Generic type identification
class Container<T> {}
const stringContainerId = typeId(Container, [String]);
const numberContainerId = typeId(Container, [Number]);
```

#### Type Information

- `typeName()`: Get the name of a type from constructor or instance
- `type()`: Get the constructor from a type or instance
- Handles both constructor functions and instances
- Throws error for null/undefined values

```typescript
import { typeName, type } from '@rustable/type';

class Point {
  constructor(public x: number, public y: number) {}
}

// Get type name
console.log(typeName(Point));           // "Point"
console.log(typeName(new Point(1, 2))); // "Point"

// Get constructor
const constructor1 = type(Point);           // Point constructor
const constructor2 = type(new Point(1, 2)); // Also Point constructor
console.log(constructor1 === constructor2);  // true

// Works with built-in types too
console.log(typeName("hello"));     // "String"
console.log(typeName(123));         // "Number"
console.log(type("hello") === String); // true
```

#### Generic Type Construction

- `Type()`: Create type-safe generic constructors
- Preserves static properties and prototype chain
- Supports constructor type parameters
- Maintains TypeScript type information

```typescript
import { Type } from '@rustable/type';

// Generic class definition
class Container<T> {
  constructor(public value: T) {}
}

// Create specific type constructors
const StringContainer = Type(Container, [String]);
const NumberContainer = Type(Container, [Number]);

// Type-safe instantiation
const strContainer = new StringContainer("hello"); // OK
const numContainer = new NumberContainer(42);      // OK
const error = new StringContainer(123);           // Type Error

// Advanced usage with constructor type parameters
class TypedMap<K, V> {
  constructor(keyType: Constructor<K>, valueType: Constructor<V>) {}
}

const StringNumberMap = Type(TypedMap, [String, Number], true);
new StringNumberMap(); // Constructor receives [String, Number]
```

#### Type Utilities

- `isGenericType()`: Check if a type is generic
- `named()`: Decorator for custom type names

```typescript
import { isGenericType, named } from '@rustable/type';

// Generic type checking
class Container<T> {}
const StringContainer = Type(Container, [String]);
console.log(isGenericType(Container));        // false
console.log(isGenericType(StringContainer));  // true

// Custom type naming
@named('CustomPoint')
class Point {
  constructor(public x: number, public y: number) {}
}
console.log(typeName(Point)); // "CustomPoint"
```

### Factory Creation (`factory.ts`)

- Creates class factories that work both with and without 'new' keyword
- Preserves static methods and properties
- Supports custom factory functions
- Type-safe implementation

```typescript
import { createFactory } from '@rustable/type';

class MyClass {
  static helper() { return 'help'; }
}

const Factory = createFactory(MyClass);
const instance1 = Factory();      // Works without 'new'
const instance2 = new Factory();  // Works with 'new'
Factory.helper();                 // Static methods preserved
```

### Common Types (`common.ts`)

- Provides fundamental type definitions
- Includes generic constructor types
- Type-safe base interfaces

```typescript
import { Constructor } from '@rustable/type';

interface MyGeneric<T> {
  new (...args: any[]): T;
  prototype: T;
}

class Factory<T> {
  constructor(private ctor: Constructor<T>) {}
  create(...args: any[]): T {
    return new this.ctor(...args);
  }
}
```

## License

MIT © illuxiza
