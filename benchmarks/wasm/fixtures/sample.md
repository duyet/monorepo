# Benchmark Markdown Document

This is a comprehensive markdown document for benchmarking purposes. It contains
various GFM features including tables, code blocks, math expressions, and more.

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Code Examples

### TypeScript

```typescript
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

function createUser(data: Omit<User, 'id' | 'createdAt'>): User {
  return {
    id: Math.random().toString(36).substring(2, 9),
    ...data,
    createdAt: new Date(),
  }
}

const users: User[] = [
  createUser({ name: 'Alice', email: 'alice@example.com' }),
  createUser({ name: 'Bob', email: 'bob@example.com' }),
]
```

### Rust

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: u64,
    name: String,
    email: String,
    created_at: String,
}

fn create_user(name: &str, email: &str) -> User {
    User {
        id: rand::random(),
        name: name.to_string(),
        email: email.to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    }
}
```

## Data Table

| Language | Paradigm         | Typing    | Performance | Ecosystem |
| -------- | ---------------- | --------- | ----------- | --------- |
| Rust     | Systems          | Static    | Excellent   | Growing   |
| Go       | Concurrent       | Static    | Very Good   | Mature    |
| Python   | Multi-paradigm   | Dynamic   | Moderate    | Vast      |
| TypeScript | Multi-paradigm | Static    | Good        | Massive   |
| C++      | Systems          | Static    | Excellent   | Massive   |
| Java     | OOP              | Static    | Very Good   | Enterprise |
| Haskell  | Functional       | Static    | Good        | Niche     |
| Elixir   | Functional       | Dynamic   | Good        | Growing   |

## Task List

- [x] Design benchmark harness
- [x] Create test fixtures
- [ ] Implement WASM modules
- [ ] Run benchmarks
- [ ] Analyze results

## Math

Inline math: $E = mc^2$ and $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$

Block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}
$$

## Quotes and Lists

> "The best way to predict the future is to invent it."
> -- Alan Kay

### Ordered List

1. First item with some text
2. Second item with **bold text**
3. Third item with *italic text*
4. Fourth item with `inline code`
5. Fifth item with [a link](https://example.com)

### Unordered List

- Node.js runtime environment
  - V8 JavaScript engine
  - libuv event loop
  - npm package manager
- Deno runtime alternative
  - Rust-based
  - TypeScript native
  - Secure by default
- Bun runtime newcomer
  - Zig-based
  - Fast startup
  - npm compatible

## Links

Visit [GitHub](https://github.com) for code hosting. Check out the
[MDN Web Docs](https://developer.mozilla.org) for web development resources.

## Strikethrough and Emphasis

~~This text is crossed out~~ but **this is important** and *this is emphasized*.
We also support ***bold italic*** text.

## Nested Structure

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

###### Heading Level 6

## Final Paragraph

This document serves as a realistic test fixture for markdown parsing benchmarks.
It includes headers, code blocks, tables, math, lists, links, and various inline
formatting. The total size is approximately 4KB of markdown source text which
exercises the full range of CommonMark and GFM features.

---

*End of benchmark document.*
