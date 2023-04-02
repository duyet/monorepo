---
template: post
title: "Cargo: workspace inheritance"
date: "2022-09-24"
author: Van-Duyet Le
category: Rust
tags:
  - Rust
  - Cargo
slug: /2022/09/cargo-workspace-inheritance.html
draft: false
thumbnail: https://i.imgur.com/JRrTxzC.png 
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F09%2Fcargo-workspace-inheritance.html
description: Since 1.64.0, Cargo now supports workspace inheritance, so you can avoid duplicating similar field values between crates while working within a workspace. Workspace inheritance can include things like shared version numbers, repository URLs, or rust-version. 

---

Since [1.64.0](https://blog.rust-lang.org/2022/09/22/Rust-1.64.0.html), Cargo now supports workspace inheritance, so you can avoid duplicating similar field values between crates while working within a workspace. Workspace inheritance can include things like shared `version` numbers, `repository` URLs, or `rust-version`.

This also helps keep these values in sync between crates when updating them. This makes it easier to handle large workspaces.

![Cargo workspace inheritance](/media/2022/09/cargo-workspace-inheritance.png)

File: [ROOT]/Cargo.toml

```toml
[workspace]
members = ["a", "b"]

[workspace.package]
version = "1.2.3"

[workspace.dependencies]
serde = "1.0.145"
anyhow = "1.0.65"
```

File: [ROOT]/a/Cargo.toml

```toml
[package]
name = "a"

# use the package version from [ROOT]/Cargo.toml
version.workspace = true

[dependencies]
# use `serde` version from [ROOT]/Cargo.toml
serde = { workspace = true }
# use `anyhow` version from [ROOT]/Cargo.toml
anyhow.workspace = true
```

For more details, see [`workspace.package`](https://doc.rust-lang.org/cargo/reference/workspaces.html#the-package-table),
[`workspace.dependencies`](https://doc.rust-lang.org/cargo/reference/workspaces.html#the-dependencies-table),
and ["inheriting a dependency from a workspace"](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html#inheriting-a-dependency-from-a-workspace).

## References

- [Inheriting a dependency from a workspace - The Cargo Book](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html#inheriting-a-dependency-from-a-workspace)
- [Cargo improvements: workspace inheritance and multi-target builds](https://blog.rust-lang.org/2022/09/22/Rust-1.64.0.html#cargo-improvements-workspace-inheritance-and-multi-target-builds)
