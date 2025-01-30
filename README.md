# Rustable

🦀 A TypeScript library that brings Rust's powerful features and patterns to TypeScript development. Rustable provides type-safe implementations of Rust's most valuable patterns while maintaining TypeScript's ease of use.

## ✨ Features

- 🎯 **Trait System** - Complete Rust-like trait system
- 🔒 **Type Safety** - Comprehensive type-safe implementations
- 🎭 **Error Handling** - Pattern matching and error handling
- 🧩 **Collections** - Efficient collections and traits
- 🔁 **Iterators** - Rich iterator utilities and adapters
- 📦 **Zero Deps** - No external runtime dependencies

## 📦 Installation

```bash
npm install rustable
# or
yarn add rustable
# or
pnpm add rustable
```

## 📚 Packages

### [@rustable/commons](https://github.com/illuxiza/ts-rustable/tree/main/packages/commons#readme)

🧩 Type-safe collections and common traits

- HashMap with efficient key-value storage
- Entry API for safe map manipulation
- HashSet for unique value storage
- Vec with Rust-like operations
- IdxVec with array-like index access
- Clone trait for deep cloning
- Eq trait for equality comparison
- From trait for type conversion

### [@rustable/enum](https://github.com/illuxiza/ts-rustable/tree/main/packages/enum#readme)

🎭 Enum support and pattern matching

- Option\<T> for null safety with rich combinators
- Result<T, E> for error handling with chainable operations
- Pattern matching with exhaustive checks
- Enum support with variant types
- Match expressions with guard clauses

### [@rustable/iter](https://github.com/illuxiza/ts-rustable/tree/main/packages/iter#readme)

🔁 Iterator utilities and lazy evaluation

- Rust-like iterator methods (map, filter, fold)
- Lazy evaluation and efficient chaining
- Specialized iterators (Range, Zip, Chain)
- Consuming operations (collect, reduce, find)
- Iterator adaptors (take, skip, enumerate)

### [@rustable/trait](https://github.com/illuxiza/ts-rustable/tree/main/packages/trait#readme)

🎯 Core trait system implementation

- Type-safe trait definitions with generics
- Runtime trait checking and verification
- Macro-based trait implementation
- Default implementations with overrides
- Trait composition and inheritance

### [@rustable/type](https://github.com/illuxiza/ts-rustable/tree/main/packages/type#readme)

🎨 Rust-like type system

- Generic type construction and management
- Runtime type identification (TypeId)
- Type-safe factory creation
- Type reflection and utilities
- Named type decorators

### [@rustable/utils](https://github.com/illuxiza/ts-rustable/tree/main/packages/utils#readme)

🛠️ Core utilities

- Deep cloning of objects and values
- String manipulation and serialization
- Value comparison and equality checks
- Pointer management (Ptr) for mutable references
- Value management (Val) for immutable references

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT © illuxiza
