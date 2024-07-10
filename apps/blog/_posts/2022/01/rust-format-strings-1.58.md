---
title: 'Rust: Format Strings in 1.58'
date: '2022-01-18'
author: Duyet
category: Rust 🦀
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Basic
slug: /2022/01/rust-format-strings-1.58.html
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F01%2Frust-turbofish.html
thumbnail: https://i.imgur.com/OrkBRwV.png
description: Bản cập nhật `Rust 1.58.0` vừa bổ sung một số tính năng mình thấy khá hay về format string.
---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>

![](https://i.imgur.com/OrkBRwV.png)

Bản cập nhật `Rust 1.58.0` vừa bổ sung một số tính năng mình thấy khá hay về format string.

Nó cho phép bạn đặt variables bên ngoài scope vào string format bằng cách sử dụng `{ident}` trong format string.

```rust
let x = "world";
println!("Hello {x}!");

// Hello world!
```

Một ví dụ với debug output:

```rust
let items = vec![10, 20, 30];
println!("{items:?}")
// [10, 20, 30]

println!("{items:#?}")
// [
//    10,
//    20,
//    30,
// ]
```

Bạn cũng có thể format string với minimum width, cú pháp là `:[width]`

```rust
let items = ["these", "words", "are", "different", "sizes"];
let column1 = "item";
let column2 = "iter";
println!("{column1:10}| {column2}");
println!("----------------");
for (i, item) in items.iter().enumerate() {
    println!("{item:10}: {i}");
}

// item      | iter
// ----------------
// these     : 0
// words     : 1
// are       : 2
// different : 3
// sizes     : 4
```

Canh giữa:

```rust
println!("----------------");
for (i, item) in items.iter().enumerate() {
    println!("{item:^10}: {i}");
}

// ----------------
//    these   : 0
//    words   : 1
//     are    : 2
//  different : 3
//    sizes   : 4
```

Canh phải:

```rust
println!("----------------");
for (i, item) in items.iter().enumerate() {
    println!("{item:>10}: {i}");
}

// ----------------
//      these: 0
//      words: 1
//        are: 2
//  different: 3
//      sizes: 4
```

Sử dụng một biến i32 thì chỉ cần đặt `$` phía sau variable name.

```rust

let spaces = 10;
println!("hello {x:spaces$}!");

// "hello world     !"
```

Điền vào khoảng trống với bất kì ký tự nào

```rust
println!("right aligned: hello{x:->7}!");
println!("left aligned: hello{x:-<7}!");
println!("center aligned: hello{x:-^7}!");

// right aligned: hello--world!
// left aligned: helloworld--!
// center aligned: hello-world-!
```

Để escape dấu ngoặc

```rust
println!("Sometimes I need to print {{ or }} too!")
// Sometimes I need to print { or } too!
```

## References

- [Format Strings in Rust 1.58](https://www.rustnote.com/blog/format_strings.html#format-strings-in-rust-158)
- [Announcing Rust 1.58.0](https://www.rustnote.com/blog/format_strings.html)
