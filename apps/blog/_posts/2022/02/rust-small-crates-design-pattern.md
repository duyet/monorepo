---
title: 'Rust Design Pattern: Prefer Small Crates'
date: '2022-02-13'
author: Duyet
category: Rust
featured: true
series: Rust Design Patterns
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Design Patterns
  - Design Patterns
slug: /2022/02/rust-small-crates-design-pattern.html
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F02%2Frust-small-crates-design-pattern.html
description: Prefer small crates that do one thing well. Để có được sự hiệu quả, mọi crate phải được thiết kế tốt, lựa chọn dependencies kỹ càng và càng độc lập càng tốt.
---

Chuỗi bài viết [Rust Tiếng Việt](/tag/rust-tiếng-việt/) là một trong những nội dung nằm trong sách [**Rust Tiếng Việt**](https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet).

Prefer Small Crates là một trong [những pattern](/tag/rust-design-patterns) thuộc nhóm **[Structural Patterns](/tag/structural-patterns)**.

- Behavioural Patterns
- Creational Patterns
- Structural Patterns
  - [**Prefer Small Crates**](/2022/02/rust-small-crates-design-pattern.html)

Không hẳn là một Design pattern, mình thấy đây là một tư tưởng khi viết các project bằng Rust.

Cargo và [crates.io](http://crates.io/) giúp quản lý crate cực kỳ dễ dàng.
Hơn nữa, crate trên crates.io không thể sửa hoặc xóa được sau khi publish,
bất kỳ bản build nào đang hoạt động chắc chắn sẽ hoạt động được tiếp trong tương lai.
Điều này bắt buộc để có được sự hiệu quả, mọi crate phải được thiết kế tốt,
lựa chọn dependencies kỹ càng và càng nhỏ càng tốt.

> Prefer small crates that do one thing well.

# Ưu điểm

- Small crate sẽ giúp ta dễ hiểu và dễ sử dụng hơn, code dễ module hóa hơn.
- Đơn vị compilation nhỏ nhất của Rust là crate, tách nhỏ project thành nhiều crate giúp code build parallel.
- Crate giúp tái sử dụng giữa nhiều project khác nhau.
  - Ví dụ, crate `url` là một phần của Servo browser engine, nhưng được sử dụng cực kỳ rộng rãi ở các project khác, do nó độc lập và giải quyết một vấn đề cụ thể.
  - Ví dụ, [AWS SDK Rust](https://awslabs.github.io/aws-sdk-rust/) được tách thành rất nhiều crate nhỏ, và các crate nhỏ này được sử dụng ở khắp nơi không chỉ ở AWS SDK Rust.
    - `aws-sdk-*`
    - `aws-config`
    - `aws_smithy_client`
    - `aws_types`
- Tách nhỏ crate độc lập giúp việc chia tasks trong một project lớn của team hiệu quả hơn.

# Nhược điểm

- Có dễ dẫn đến “dependency hell”, một project depends vào cùng 1 crate nhưng version khác nhau cùng một lúc. Và các versions này xung đột nhau.
- Hai crate quá nhỏ có thể kém hiệu quả hơn một crate lớn, bởi vì compiler mặc định không thực hiện link-time optimization (LTO).

# Một số small crates điển hình

- [url](https://crates.io/crates/url): crate xử lý url.
- [ref_slice](https://crates.io/crates/ref_slice): crate giúp convert từ `&T` sang `&[T]`. Crate này [từng nằm trong standard library](https://github.com/rust-lang/rust/issues/27774#issuecomment-150058618) nhưng đã tách ra.
- [num_cpus](https://crates.io/crates/num_cpus): trả về số lượng cpu trên máy hiện tại.
- [rand](https://crates.io/crates/rand): random number generators.
