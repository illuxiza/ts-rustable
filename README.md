# Rustable

A TypeScript library that brings Rust's powerful features and patterns to TypeScript development. Rustable provides type-safe implementations of Rust's most valuable patterns while maintaining TypeScript's ease of use.

## Installation

```bash
npm install rustable
# or
yarn add rustable
# or
pnpm add rustable
```

## Features

- 🎯 Complete Rust-like trait system
- 🔒 Type-safe implementations
- 🎭 Pattern matching and error handling
- 🧩 Efficient collections and traits
- 🔁 Iterator utilities
- 📦 Zero dependencies

## Packages

### [@rustable/commons](https://github.com/illuxiza/ts-rustable/tree/main/packages/commons#readme)

🧩 Type-safe collections and common traits

- HashMap with efficient key-value storage
- HashSet for unique value storage
- Vec with Rust-like operations
- Clone trait for deep cloning
- Eq trait for equality comparison
- From trait for type conversion
- Entry API for safe map manipulation

### [@rustable/enum](https://github.com/illuxiza/ts-rustable/tree/main/packages/enum#readme)

🎭 Enum support and pattern matching

- Option\<T> for null safety
- Result\<T, E> for error handling
- Enum support with pattern matching
- Rich combinators (map, andThen, unwrapOr)

### [@rustable/iter](https://github.com/illuxiza/ts-rustable/tree/main/packages/iter#readme)

🔁 Iterator utilities and lazy evaluation

- Rust-like iterator methods
- Lazy evaluation of collections
- Powerful transformation and filtering
- Chaining and composition of iterators
- Performance-optimized iterator operations

### [@rustable/trait](https://github.com/illuxiza/ts-rustable/tree/main/packages/trait#readme)

🎯 Core trait system implementation

- Type-safe trait definitions
- Runtime trait checking
- Decorator-based API
- Default implementations

### [@rustable/utils](https://github.com/illuxiza/ts-rustable/tree/main/packages/utils#readme)

🛠️ Core utilities

- Type identification system
- Object cloning utilities
- Hash function implementations
- Equality comparison

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

MIT © illuxiza
