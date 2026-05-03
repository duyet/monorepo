---
title: 'Rust: Processing JSON with serde'
date: '2023-10-15'
featured: true
author: Duyet
category: Rust
tags:
  - Rust
  - Serde
slug: /2023/10/rust-json-serde.html
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2023%2F10%2Frust-json-serde.html
description: Serialize and deserialize JSON in Rust using serde and serde_json — derive macros, field attributes, enum representations, file I/O, dynamic values, and error handling.
---

<div class="toc">
  <p>Trong bài này:</p>
  <ul>
    <li><a href="#setup">Setup</a></li>
    <li><a href="#serialize--deserialize">Serialize & Deserialize</a></li>
    <li><a href="#field-attributes">Field Attributes</a>
      <ul>
        <li><a href="#rename--rename_all">rename / rename_all</a></li>
        <li><a href="#skip--skip_serializing">skip / skip_serializing</a></li>
        <li><a href="#default-values">default values</a></li>
      </ul>
    </li>
    <li><a href="#enum-representations">Enum Representations</a></li>
    <li><a href="#reading--writing-files">Reading & Writing Files</a></li>
    <li><a href="#dynamic-json-with-serde_jsonvalue">Dynamic JSON with serde_json::Value</a></li>
    <li><a href="#flatten-extra-fields">Flatten Extra Fields</a></li>
    <li><a href="#error-handling">Error Handling</a></li>
  </ul>
</div>

[`serde`] is Rust's de facto serialization framework. It separates the *data model* (your structs and enums) from the *data format* (JSON, YAML, TOML, bincode, ...). [`serde_json`] handles the JSON format layer. Together they give you typed, zero-cost JSON with minimal boilerplate.

# Setup

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

The `derive` feature enables `#[derive(Serialize, Deserialize)]` — without it you'd have to implement these traits by hand.

# Serialize & Deserialize

Define a struct, derive the traits, and use `serde_json::from_str` / `serde_json::to_string`:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    name: String,
    age: u32,
    email: String,
}

fn main() -> Result<(), serde_json::Error> {
    // Deserialize: JSON string → Rust struct
    let json = r#"{"name":"Alice","age":25,"email":"alice@example.com"}"#;
    let user: User = serde_json::from_str(json)?;
    println!("{:?}", user);
    // User { name: "Alice", age: 25, email: "alice@example.com" }

    // Serialize: Rust struct → JSON string
    let out = serde_json::to_string(&user)?;
    println!("{}", out);
    // {"name":"Alice","age":25,"email":"alice@example.com"}

    // Pretty-printed
    let pretty = serde_json::to_string_pretty(&user)?;
    println!("{}", pretty);

    Ok(())
}
```

That's the core loop. Everything else is controlling *how* the mapping works.

# Field Attributes

Serde provides `#[serde(...)]` attributes to customize serialization without changing your struct.

## rename / rename_all

When your Rust naming convention doesn't match the JSON keys:

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Person {
    first_name: String,  // → "firstName"
    last_name: String,   // → "lastName"
}
```

For a single field:

```rust
#[derive(Deserialize)]
struct Config {
    #[serde(rename = "type")]
    kind: String,  // JSON key is "type" (Rust reserved word)
}
```

`rename_all` supports: `lowercase`, `UPPERCASE`, `PascalCase`, `camelCase`, `snake_case`, `SCREAMING_SNAKE_CASE`, `kebab-case`, `SCREAMING-KEBAB-CASE`.

## skip / skip_serializing

Exclude fields from serialization, deserialization, or both:

```rust
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
struct Resource {
    name: String,

    #[serde(skip_serializing)]
    checksum: String,  // never written to JSON

    #[serde(skip_serializing_if = "HashMap::is_empty")]
    metadata: HashMap<String, String>,  // omitted when empty

    #[serde(skip)]
    cache: Vec<u8>,  // ignored both ways
}
```

`skip_serializing_if` takes a function pointer — the field is omitted from output when the function returns `true`. Deserialization still works normally.

## default values

Handle missing fields in JSON by providing defaults:

```rust
#[derive(Deserialize, Debug)]
struct Request {
    #[serde(default)]
    timeout: u32,  // defaults to 0

    #[serde(default = "default_path")]
    path: String,  // defaults to "/"
}

fn default_path() -> String {
    "/".to_string()
}

fn main() {
    let json = r#"{}"#;
    let req: Request = serde_json::from_str(json)?;
    // Request { timeout: 0, path: "/" }
}
```

`#[serde(default)]` uses the type's `Default` impl. `#[serde(default = "fn_name")]` calls the named function.

# Enum Representations

Serde supports four ways to map Rust enums to JSON. The default is **externally tagged**:

```rust
#[derive(Serialize, Deserialize)]
#[derive(Debug)]
enum Message {
    Request { id: String, method: String },
    Response { id: String, result: i32 },
}
```

```json
{"Request": {"id": "1", "method": "ping"}}
{"Response": {"id": "1", "result": 42}}
```

Most real-world APIs use **internally tagged** instead:

```rust
#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum Event {
    Push { repo: String },
    PullRequest { repo: String, number: u64 },
}
```

```json
{"type": "Push", "repo": "serde"}
{"type": "PullRequest", "repo": "serde", "number": 1234}
```

Other options: `#[serde(tag = "t", content = "c")]` for **adjacently tagged**, and `#[serde(untagged)]` for no tag at all (tries each variant in order).

Pick the representation that matches your JSON schema — don't transform the data to fit Rust.

# Reading & Writing Files

For file I/O, use `std::fs` with serde's typed API:

```rust
use std::fs;

fn read_config(path: &str) -> Result<Config, Box<dyn std::error::Error>> {
    let data = fs::read_to_string(path)?;
    let config: Config = serde_json::from_str(&data)?;
    Ok(config)
}

fn write_config(path: &str, config: &Config) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(config)?;
    fs::write(path, json)?;
    Ok(())
}
```

For large files, `serde_json::from_reader()` streams directly from a `Read` implementor without loading the whole string into memory first:

```rust
use std::fs::File;

fn read_large(path: &str) -> Result<Vec<User>, serde_json::Error> {
    let file = File::open(path)?;
    serde_json::from_reader(file)
}
```

# Dynamic JSON with `serde_json::Value`

When the schema is unknown or variable, use `serde_json::Value` — a dynamic JSON tree:

```rust
use serde_json::Value;

fn main() -> Result<(), serde_json::Error> {
    let json = r#"{"name":"Alice","scores":[95,87,72]}"#;
    let v: Value = serde_json::from_str(json)?;

    println!("{}", v["name"]);            // "Alice"
    println!("{}", v["scores"][0]);       // 95

    // Iterate an array
    if let Some(scores) = v["scores"].as_array() {
        for s in scores {
            println!("score: {}", s);
        }
    }

    Ok(())
}
```

`Value` is an enum: `Null`, `Bool(bool)`, `Number(...)`, `String(String)`, `Array(Vec<Value>)`, `Object(Map<String, Value>)`. Use it for exploratory parsing, then migrate to typed structs once the schema stabilizes.

# Flatten Extra Fields

Capture arbitrary JSON keys you didn't define in the struct:

```rust
use std::collections::HashMap;
use serde_json::Value;

#[derive(Serialize, Deserialize)]
struct Webhook {
    event: String,
    timestamp: u64,

    #[serde(flatten)]
    extra: HashMap<String, Value>,
}
```

Any key other than `event` and `timestamp` lands in `extra`. This is useful for pass-through proxies or logging unknown payloads without failing.

# Error Handling

`serde_json::Error` implements `std::error::Error`. It carries line/column info for deserialization failures:

```rust
fn main() {
    let bad = r#"{"name":}"#;

    match serde_json::from_str::<User>(bad) {
        Ok(user) => println!("{:?}", user),
        Err(e) => {
            // Error at line 1 column 10: ...
            eprintln!("parse failed: {}", e);
        }
    }
}
```

For APIs, wrap in your own error type using `thiserror`:

```rust
#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("invalid config: {0}")]
    Config(#[from] serde_json::Error),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}
```

The `?` operator converts `serde_json::Error` → `AppError::Config` automatically via the `From` impl.

---

Serde's attribute system covers more than what's shown here — custom serializers with `#[serde(serialize_with)]`, lifetime-based zero-copy deserialization with `&'a str`, and `#[serde(borrow)]` for avoiding allocations. See the [serde documentation](https://serde.rs/attributes.html) for the full reference.

[`serde`]: https://serde.rs/
[`serde_json`]: https://docs.rs/serde_json
