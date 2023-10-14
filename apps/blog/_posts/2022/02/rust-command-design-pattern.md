---
title: 'Rust Design Pattern: Command Pattern'
date: '2022-02-13'
author: Van-Duyet Le
category: Rust 🦀
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Design Patterns
  - Behavioural Patterns
slug: /2022/02/rust-command-design-pattern.html
description: Ý tưởng cơ bản của Command Pattern là tách các actions thành các object riêng và gọi chúng thông qua parameters.
---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>

<div class="toc">
  <p>Stragery là một trong <a href="/tag/rust-design-patterns">những pattern</a> thuộc nhóm <strong><a href="/tag/behavioural-patterns">Behavioural Patterns<a/></strong></p>
  <ul>
    <li>
      <a href="/tag/behavioural-patterns">Behavioural Patterns</a>
      <ul>
        <li><a href="/2021/12/rust-strategy-design-pattern.html">Strategy Design Pattern</a></li>
        <li><a href="/2022/02/rust-command-design-pattern.html"><strong>Command Design Pattern</strong></a></li>
      </ul>
    </li>
    <li>
      <a href="/tag/creational-patterns">Creational Patterns</a>
    </li>
    <li>
      <a href="/tag/structural-patterns">Structural Patterns</a>
    </li>
  </ul>
</div>

Ý tưởng cơ bản của [Command Pattern](https://en.wikipedia.org/wiki/Command_pattern)
là tách các actions thành các object riêng và gọi chúng thông qua parameters.

# Khi nào dùng

Giả sử ta có một chuỗi các actions hoặc transactions.
Chúng ta muốn các actions hoặc commands được thực thi theo thứ tự khác nhau.
Các commands có thể được trigger bởi kết quả của một event nào đó.
Ví dụ, khi user nhấn 1 nút, hoặc khi nhận được 1 data event nào đó.
Ngoài ra thì các commands này có thể khôi phục (undo).
Ví dụ như ta store các chuỗi thực thi (executed) của các commands,
khi hệ thống gặp vấn đề ta có thể phục hồi lại bằng cách chạy lại từng commands một.

# Ví dụ

Ta define hai database operations `create table` và `add field`.
Mỗi operation là một command. Các command này có thể undo được, ví dụ `drop table`, `drop field`.

Khi user invoke database migration, mỗi command được thực thi theo thứ tự,
khi user muốn rollback, tất cả command được undo theo thứ tự ngược lại.

# Cách 1: sử dụng trait objects

Chúng ta định nghĩa một common trait cho command
với hai operation là `exec` và `rollback`.
Các struct command phải được implement trait này.

```rust
pub trait Migration {
  fn execute(&self) -> &str;
  fn rollback(&self) -> &str;
}

pub struct CreateTable;
impl Migration for CreateTable {
  fn execute(&self) -> &str {
    "create table"
  }
  fn rollback(&self) -> &str {
    "drop table"
  }
}

pub struct AddField;
impl Migration for AddField {
  fn execute(&self) -> &str {
    "add field"
  }
  fn rollback(&self) -> &str {
    "remove field"
  }
}

struct Schema {
  commands: Vec<Box<dyn Migration>>,
}

impl Schema {
  fn new() -> Self {
    Self { commands: vec![] }
  }

  fn add_migration(&mut self, cmd: Box<dyn Migration>) {
    self.commands.push(cmd);
  }

  fn execute(&self) -> Vec<&str> {
    self.commands.iter().map(|cmd| cmd.execute()).collect()
  }
  fn rollback(&self) -> Vec<&str> {
    self.commands
      .iter()
      .rev() // reverse iterator's direction
      .map(|cmd| cmd.rollback())
      .collect()
  }
}

fn main() {
  let mut schema = Schema::new();

  let cmd = Box::new(CreateTable);
  schema.add_migration(cmd);
  let cmd = Box::new(AddField);
  schema.add_migration(cmd);

  assert_eq!(vec!["create table", "add field"], schema.execute());
  assert_eq!(vec!["remove field", "drop table"], schema.rollback());
}
```

# Cách 2: sử dụng function pointers

Chúng ta có thể thực hiện theo một cách khác là tách mỗi
command thành một function và lưu lại function pointer để thực thi sau.

```rust
type FnPtr = fn() -> String;

struct Command {
  execute: FnPtr,
  rollback: FnPtr,
}

struct Schema {
  commands: Vec<Command>,
}

impl Schema {
  fn new() -> Self {
    Self { commands: vec![] }
  }
  fn add_migration(&mut self, execute: FnPtr, rollback: FnPtr) {
    self.commands.push(Command { execute, rollback });
  }
  fn execute(&self) -> Vec<String> {
    self.commands.iter().map(|cmd| (cmd.execute)()).collect()
  }
  fn rollback(&self) -> Vec<String> {
    self.commands
      .iter()
      .rev()
      .map(|cmd| (cmd.rollback)())
      .collect()
  }
}

fn add_field() -> String {
  "add field".to_string()
}

fn remove_field() -> String {
  "remove field".to_string()
}

fn main() {
  let mut schema = Schema::new();
  schema.add_migration(|| "create table".to_string(), || "drop table".to_string());
  schema.add_migration(add_field, remove_field);

  assert_eq!(vec!["create table", "add field"], schema.execute());
  assert_eq!(vec!["remove field", "drop table"], schema.rollback());
}
```

# Cách 3: sử dụng `Fn` trait objects

Thay vì định nghĩa một command trait theo cách 1,
ta có thể lưu tất cả command được implement `trait Fn` trong một vector.

```rust
type Migration<'a> = Box<dyn Fn() -> &'a str>;

struct Schema<'a> {
  executes: Vec<Migration<'a>>,
  rollbacks: Vec<Migration<'a>>,
}

impl<'a> Schema<'a> {
  fn new() -> Self {
    Self {
        executes: vec![],
        rollbacks: vec![],
    }
  }

  fn add_migration<E, R>(&mut self, execute: E, rollback: R)
  where
    E: Fn() -> &'a str + 'static,
    R: Fn() -> &'a str + 'static,
  {
    self.executes.push(Box::new(execute));
    self.rollbacks.push(Box::new(rollback));
  }

  fn execute(&self) -> Vec<&str> {
    self.executes.iter().map(|cmd| cmd()).collect()
  }

  fn rollback(&self) -> Vec<&str> {
    self.rollbacks.iter().rev().map(|cmd| cmd()).collect()
  }
}

fn add_field() -> &'static str {
  "add field"
}

fn remove_field() -> &'static str {
  "remove field"
}

fn main() {
  let mut schema = Schema::new();
  schema.add_migration(|| "create table", || "drop table");
  schema.add_migration(add_field, remove_field);

  assert_eq!(vec!["create table", "add field"], schema.execute());
  assert_eq!(vec!["remove field", "drop table"], schema.rollback());
}
```

# Thảo luận

Trong các ví dụ trên thì command của chúng ta khá nhỏ,
nên thường được define dưới dạng function hoặc closure
rồi bỏ thẳng function pointer vào Vec, rồi thực thi theo thứ tự.
Trong thực tế các command có thể phức tạp hơn,
có thể là một struct với hàng loạt các function và variable
trong các module khác nhau, việc sử dụng `trait` và `Box` ở cách 1 sẽ hiệu quả hơn.

# References

- [https://en.wikipedia.org/wiki/Command_pattern](https://en.wikipedia.org/wiki/Command_pattern)
- [https://web.archive.org/web/20210223131236/https://chercher.tech/rust/command-design-pattern-rust](https://web.archive.org/web/20210223131236/https://chercher.tech/rust/command-design-pattern-rust)
