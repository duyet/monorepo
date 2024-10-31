---
title: 'Rust Design Pattern: Builder Pattern'
date: '2022-02-13'
author: Duyet
category: Rust 🦀
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Design Patterns
  - Design Patterns
slug: /2022/02/rust-builder-design-pattern.html
description: Builder được sử dụng cực kỳ phổ biến trong Rust so với các ngôn ngữ khác, bởi vì Rust không có overloading.
---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>

<div class="toc">
  <p>Builder là một trong <a href="/tag/rust-design-patterns">những pattern</a> thuộc nhóm <strong><a href="/tag/creational-patterns">Creational Patterns<a/></strong></p>
  <ul>
    <li>
      <a href="/tag/behavioural-patterns">Behavioural Patterns</a>
    </li>
    <li>
      <a href="/tag/creational-patterns">Creational Patterns</a>
      <ul>
        <li><a href="/2022/02/rust-builder-design-pattern.html"><strong>Builder Design Pattern</strong></a></li>
      </ul>
    </li>
    <li>
      <a href="/tag/structural-patterns">Structural Patterns</a>
    </li>
  </ul>
</div>

# Rust Builder Design Pattern

Rust không có overloading, do đó bạn cần phải viết nhiều construct
cho tất cả các trường hợp có thể có, với các method name khác nhau.
Việc này sẽ cực kỳ mất thời gian nếu struct có quá nhiều _fields_ hoặc _constructor_ phức tạp.

```rust
impl Foo {
  pub fn new(a: String) -> Self {}
  pub fn new(a: String, b: String) -> Self {} // <-- không thể
  pub fn new(a: i32) -> Self {} // <-- không thể
}

// Thay vào đó
impl Foo {
  pub fn new(a: String) -> Self {}
  pub fn new_from_two(a: String, b: String) -> Self {}
  pub fn new_from_int(a: i32) -> Self {}
}
```

Do đó, **builder** được sử dụng cực kỳ phổ biến trong Rust so với các ngôn ngữ khác.

Builder cho phép construct một object bằng cách gọi `build()`.

# Ví dụ

```rust
#[derive(Debug, PartialEq)]
pub struct Foo {
  // Lots of complicated fields.
  bar: String,
}

impl Foo {
  // This method will help users to discover the builder
  pub fn builder() -> FooBuilder {
    FooBuilder::default()
  }
}

#[derive(Default)]
pub struct FooBuilder {
  // Probably lots of optional fields.
  bar: String,
}

impl FooBuilder {
  pub fn new(/* ... */) -> FooBuilder {
    // Set the minimally required fields of Foo.
    FooBuilder {
      bar: "x".to_string(),
    }
  }

  pub fn name(mut self, bar: String) -> FooBuilder {
    // Set the name on the builder itself, and return the builder by value.
    self.bar = bar;
    self
  }

  // If we can get away with not consuming the Builder here, that is an
  // advantage. It means we can use the FooBuilder as a template for constructing
  // many Foos.
  pub fn build(self) -> Foo {
    // Create a Foo from the FooBuilder, applying all settings in FooBuilder
    // to Foo.
    Foo { bar: self.bar }
  }
}

#[test]
fn builder_test() {
  let foo = Foo { bar: "y".to_string() };
  let foo_from_builder = FooBuilder::new().name("y".to_string()).build();

  assert_eq!(foo, foo_from_builder);
}
```

# Khi nào dùng

Hữu ích khi bạn muốn có nhiều loại constructors khác nhau hoặc khi constructor có side effects.

# Ưu điểm

- Tách biệt các methods của builder và các method khác của object.
- Không cần phải viết quá nhiều constructor nếu struct có quá nhiều fields hoặc quá nhiều cách để khởi tạo một object.
- One-liner initialization: `FooBuilder::new().a().b().c().build()`

# Nhược điểm

Phức tạp hơn so với việc init object trực tiếp, hoặc so với object có constructor đơn giản.

# References

- [https://doc.rust-lang.org/1.0.0/style/ownership/builders.html](https://doc.rust-lang.org/1.0.0/style/ownership/builders.html)
- [derive_builder](https://crates.io/crates/derive_builder), một crate cho phép tự động tạo builder.
- [Builder pattern (wikipedia)](https://en.wikipedia.org/wiki/Builder_pattern)
