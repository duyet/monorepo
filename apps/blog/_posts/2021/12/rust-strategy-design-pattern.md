---
title: 'Rust Design Pattern: Strategy Pattern'
date: '2021-12-19'
author: Duyet
category: Rust 🦀
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Design Patterns
slug: /2021/12/rust-strategy-design-pattern.html
description: Strategy design pattern là một technique nhằm mục đích phân tách nhiều vấn đề, tách software modules thông qua Dependency Inversion.
---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>

<div class="toc">
  <p>Stragery là một trong <a href="/tag/rust-design-patterns">những pattern</a> thuộc nhóm <strong><a href="/tag/behavioural-patterns">Behavioural Patterns<a/></strong></p>
  <ul>
    <li>
      <a href="/tag/behavioural-patterns">Behavioural Patterns</a>
      <ul>
        <li><a href="/2021/12/rust-strategy-design-pattern.html"><strong>Strategy Design Pattern</strong></a></li>
        <li><a href="/2022/02/rust-command-design-pattern.html">Command Design Pattern</a></li>
      </ul>
    </li>
    <li>
      <a href="/tag/creational-patterns">Creational Patterns</a>
    </li>
    <li>
      <a href="/tag/structural-patterns">Structural Patterns</a>
    </li>
  </ul>
  </ul>
</div>

[Strategy design pattern](https://en.wikipedia.org/wiki/Strategy_pattern) là một technique nhằm mục đích phân tách nhiều vấn đề,
tách software modules thông qua [Dependency Inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle).
Ý tưởng cơ bản của Strategy pattern là chỉ cần define skeleton ở abstract level, chúng ta tách biệt phần implementation
của logic thành nhiều phần. Client sử dụng có thể tự implement 1 số method theo cách riêng của nó nhưng vẫn giữ được
cấu trúc của logic workflow gốc. Abstract class không không phụ thuộc vào implementation của lớp dẫn xuất (derived class),
nhưng implementation của lớp dẫn xuất phải tuân thủ theo đặc tả của lớp abstract. Cho nên chúng có tên gọi là Dependency Inversion.

Một thứ mình thấy rõ là các project Rust rất hay sử dụng Strategy Design Pattern này.

Ví dụ, chúng ta có 1 `struct Data` và implement một số phương thức để generate ra
nhiều dạng format khác nhau (ví dụ `JSON`, `YAML`, `Plain Text`, ...).
Ta gọi mỗi format ở đây là một strategy.

```rust
use std::collections::HashMap;

type Data = HashMap<String, u32>;

impl Data {
  fn generate(&self, format: &str) {
    match format {
      "json" => { ... }
      "yaml" => { ... }
      "text" => { ... }
      _      => { ... }
    }
  }
}
```

Mọi thứ thay đổi theo thời gian, và khó đoán được trong tương lai chương trình
của chúng ta có thể sửa đổi hoặc bổ sung thêm các loại format nào nữa
trong tương lai hay không (ví dụ `JSONLine`, `CSV`, `Parquet`, ...)

Nếu thiết kế sử dụng Strategy Pattern:

```rust
use std::collections::HashMap;

// Data
type Data = HashMap<String, u32>;
impl Data {
  // f: T chap nhan moi struct co impl Formatter
  fn generate<T: Formatter>(f: T) -> String {
    f.format(&self)
  }
}

// Formatter
trait Formatter {
  fn format(&self, data: &Data) -> String;
}

// Formatter -> Json
struct Json;
impl Formatter for Json {
  fn format(&self, data: &Data) -> String {
    // res = { "a": 1, "b": 2. /// }
    res
  }
}

// Formatter -> Text
struct Text;
impl Formatter for Text {
  fn format(&self, data: &Data) -> String {
    // res = "a = 1, b = 2, ..."
    res
  }
}

fn main() {
  let mut data = Data::new();
  data.insert("a".to_string(), 1);
  data.insert("b".to_string(), 2);

  let s = data.generate(Text);
  assert!(s.contains("a = b, b = 2"));

  let s = data.generate(Json);
  assert!(s.contains(r#"{"a":1, "b":2}"#));
}
```

Theo chúng ta có thể thấy, `Data::generate` có thể không cần quan tâm implementation
của `f: T`. Chỉ cần biết nó là một dẫn xuất của `trait Formatter` và có method `format`.

**Nhược điểm** là mỗi strategy cần được implement ít nhất một module,
vì thế số lượng module có thể tăng cùng với số lượng strategy.
Có quá nhiều strategy đòi hỏi user phải biết sự khác nhau giữa các strategy để sử dụng.

**Ưu điểm** là chúng ta có thể tách việc xử lý `Json`, `Text`, ... ra thành nhiều bài toán (strategy) nhỏ hơn theo như ví dụ trên.

Ở ví dụ trên các strategy được đặt chung ở một file,
thực tế người ta thưởng đặt ở nhiều module khác nhau hoặc mỗi strategy một file
(`formatter::json`, `formatter::csv`, ...). Việc tách này còn cho phép sử dụng compiler feature flags.

Còn nếu chúng ta đang implement một `crate`, thì `crate` ở ví dụ trên user có thể dễ dàng custom một `Formatter` mới:

```rust
use crate::example::{Data, Formatter};

struct CustomFormatter;

impl Formatter for CustomFormatter {
  fn format(&self, data: &Data) -> String {
    ...
  }
}
```

`serde` là một ví dụ hay của `Strategy` pattern, serde cho phép
[full customization](https://serde.rs/custom-serialization.html) serialization
behavior bằng cách implement `Serialize` và `Deserialize` traits cho kiểu dữ liệu riêng của chúng ta.
