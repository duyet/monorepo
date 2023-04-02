---
template: post
title: 'Cargo: Patch Dependencies'
date: '2022-09-24'
author: Van-Duyet Le
category: Rust
tags:
  - Rust
  - Cargo
slug: /2022/09/cargo-patch-deps.html
draft: false
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F09%2Fcargo-patch-deps.html
description: There are several scenarios when you will need to override or patch upstream dependencies. Like testing a bugfix of your crates before pushing to crates.io, a non-working upstream crate has a new feature or a bug fix on the master branch of its git repository that you'd want to try, etc. In these cases, the [patch] section of Cargo.toml might be useful.

---

There are several scenarios when you will need to override or patch upstream dependencies.

- Testing a bugfix of your crates before pushing to crates.io
- A non-working upstream crate has a new feature or a bug fix on the master branch of its git repository that you'd want to try.
- You've submitted a fix to an upstream crate for a bug you discovered, but you'd like your application to start using the fixed version of the crate immediately instead of waiting for the bug fix to be merged.

In these cases, the [`[patch]`](https://doc.rust-lang.org/cargo/reference/overriding-dependencies.html#the-patch-section)
section of `Cargo.toml` might be useful.

# Patch dependencies from local

Let's say you're working with the [`uuid` crate](https://crates.io/crates/uuid)
but while you're working on it you discover a bug. You decide to try to fix the bug. 
Originally your `Cargo.toml` manifest will look like this:

```toml
[package]
name = "my-library"
version = "0.1.0"

[dependencies]
uuid = "1.0"
```

First thing we'll do is to clone the [`uuid` repository](https://github.com/uuid-rs/uuid) locally via:

```toml
$ git clone https://github.com/uuid-rs/uuid
```

Next we'll edit the `Cargo.toml` of `my-library` to contain:

```toml
[package]
name = "my-library"
version = "0.1.0"

[dependencies]
uuid = "1.0"

[patch.crates-io]
uuid = { path = "../path/to/uuid" }
```

Here we declare that we're *patching* the source `crates-io` with a new dependency.
This will effectively add the local checked out version of `uuid` to the crates.io 
registry for our local package.

In any case, typically all you need to do now is:

```bash
$ cargo build
   Compiling uuid v1.0.0 (.../uuid)
   Compiling my-library v0.1.0 (.../my-library)
    Finished dev [unoptimized + debuginfo] target(s) in 0.32 secs
```

# Patch dependencies from your Github

Once you've fixed the bug you originally found the next thing you'll want to do is to likely submit that as a pull request to the `uuid` crate itself. Nevertheless, while you wait for your PR to be merged, you may begin using your patch by pushing it to your git repo and updating the `[patch]` section.:

```toml
[patch.crates-io]
uuid = { git = 'https://github.com/duyet/uuid-patched' }
```

# Overriding repository URL

In case the dependency you want to override isn't loaded from `crates.io`, you'll have to change a bit how you use `[patch]`. For example, if the dependency is a git dependency, you can override it to a local path or another git dependency:

```toml
[dependencies]
uuid = { git = 'https://github.com/uuid-rs/uuid' }

[patch.'https://github.com/uuid-rs/uuid']
uuid = { git = "https://github.com/duyet/uuid-patched", branch = "2.0.0" }
```

You can also patch your lib from git dependency with the local folder:

```toml
[dependencies]
my-library = { git = 'https://github.com/duyet/mylib-rs' }

[patch.'https://github.com/duyet/mylib-rs']
my-library = { path = "../local/mylib" }
```

# References

- [Overriding Dependencies - The Cargo Book](https://doc.rust-lang.org/cargo/reference/overriding-dependencies.html#overriding-dependencies)
