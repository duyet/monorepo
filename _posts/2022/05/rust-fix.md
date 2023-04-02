---
template: post
title: Rust automatically upgrade to a new edition 
date: "2022-05-14"
author: Van-Duyet Le
category: Rust
tags:
 - Rust
slug: /2022/05/rust-cargo-fix.html
draft: false
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F05%2Frust-cargo-fix.html
linkedInCommentUrl: 
description: Every two or three years, the Rust team produces a new Rust edition. Each edition contains a lot of changes. Each edition brings together the features that have landed into a clear package with fully updated documentation and tooling.

---

Every two or three years, the Rust team produces a new Rust edition. Each edition contains a lot of changes. Each edition brings together the features that have landed into a clear package with fully updated documentation and tooling.

The `edition` key in `Cargo.toml` indicates which edition the compiler should use for your code. If the key doesn’t exist, Rust uses **2015** as the edition value for backward compatibility reasons. 

Most features will be available on all editions. Developers using any Rust edition will continue to see improvements as new stable releases are made. However, in some cases, mainly when new keywords are added, some new features might only be available in later editions. You will need to switch editions if you want to take advantage of such features.

You can use the `cargo fix` command to transition your code between different Rust editions. It will update your source code so that it is compatible with the next edition. You might need to set the `edition` field to the next edition in your `Cargo.toml` first.

```bash
$ cargo fix
```

For example from 
[The edition book](https://doc.rust-lang.org/edition-guide/editions/transitioning-an-existing-project-to-a-new-edition.html), transitioning from the 2015 edition to the 2018 edition. This code bellow uses an anonymous parameter, that `i32`,  This is [not supported in Rust 2018](https://doc.rust-lang.org/edition-guide/rust-2018/trait-fn-parameters.html), so this would fail to compile. 


```rust
trait Foo {
    fn foo(&self, i32);
}
```

After run the `cargo fix`:

```rust
trait Foo {
    fn foo(&self, _: i32);
}
```
