---
template: post
title: "Rust: indoc"
date: "2022-08-06"
author: Van-Duyet Le
category: Rust
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Crates
slug: /2022/08/rust-indoc.html
draft: false
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F08%2Frust-indoc.html
description: indoc là một crate nhỏ nhưng hữu ích giúp canh lề (indented documents). indoc!() macro nhận multiline string và un-indents lúc compile time, xoá tất cả khoảng trắng đầu tiên trên cách dòng dựa theo dòng đầu tiên.

---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>

[`indoc`] là một crate nhỏ nhưng hữu ích giúp canh lề (indented documents).
`indoc!()` macro nhận multiline string và un-indents lúc compile time,
xoá tất cả khoảng trắng đầu tiên trên cách dòng dựa theo dòng đầu tiên.


File: Cargo.toml

```toml
[dependencies]
indoc = "1"
```



Ví dụ:

```rust
use indoc::indoc;

fn main() {
    let testing = indoc! {"
        def hello():
            print('Hello, world!')

        hello()
    "};

    let expected = "def hello():\n    print('Hello, world!')\n\nhello()\n";
    assert_eq!(testing, expected);
}
```

[`indoc`] cũng hoạt động với raw string `r# ... #` và byte string `b" ... "`.

## References

- <https://rust-tieng-viet.github.io/crates/indoc.html>
- <https://docs.rs/indoc/latest/indoc/>
- <https://github.com/dtolnay/indoc>

[`indoc`]: https://github.com/dtolnay/indoc
