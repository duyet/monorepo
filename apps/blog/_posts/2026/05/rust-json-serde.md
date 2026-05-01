---
title: 'Rust: Processing JSON with serde'
date: '2026-05-01'
featured: true
author: Duyet
category: Rust
tags:
  - Rust
  - Serde
slug: /2026/05/rust-json-serde.html
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2026%2F05%2Frust-json-serde.html
description: How to process JSON in Rust using serde and serde_json for serialization and deserialization with minimal boilerplate.
---

JSON is a popular data format for exchanging information on the web, but it can
be tricky to work with in Rust because of its dynamic nature. Luckily, [`serde`]
makes it easy to serialize and deserialize JSON data with minimal boilerplate
code.

First, add `serde` and `serde_json` as dependencies in `Cargo.toml`:

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

Next, define a struct that represents the JSON data you want to process. For
this example, use a simple user profile with a name, age, and email:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    name: String,
    age: u32,
    email: String,
}
```

Now you can use `serde_json::from_str()` to parse a JSON string into a `User`.
The `main` function returns `Result` so the `?` operator can return any JSON
parsing error to the caller:

```rust
fn main() -> Result<(), serde_json::Error> {
    let json = r#"
    {
        "name": "Alice",
        "age": 25,
        "email": "alice@example.com"
    }
    "#;

    let user: User = serde_json::from_str(json)?;
    println!(
        "Name: {}, Age: {}, Email: {}",
        user.name, user.age, user.email
    );

    Ok(())
}
```

You can also use `serde_json::to_string()` to convert a `User` instance back
into a JSON string:

```rust
fn main() -> Result<(), serde_json::Error> {
    let user = User {
        name: "Bob".to_string(),
        age: 30,
        email: "bob@example.com".to_string(),
    };

    let json = serde_json::to_string(&user)?;
    println!("{}", json);

    Ok(())
}
```

For pretty-printed output, use `serde_json::to_string_pretty()`:

```rust
let json = serde_json::to_string_pretty(&user)?;
println!("{}", json);
```

[`serde`]: https://serde.rs/
