---
template: post
title: "Rust: Copy & Clone Trait"
date: "2022-02-13 11:00.000+07:00"
author: Van-Duyet Le
category: Rust
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Basic
slug: /2022/02/rust-copy-clone-trait.html
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F02%2Frust-copy-clone-trait.html
thumbnail: https://i.imgur.com/shjfLWK.png
description: "Có một số kiểu dữ liệu trong Rust rất đơn giản (simple types), bao gồm integers, floats, booleans (true và false), và char. Các simple types này nằm trên stack bởi vì complier biết chính xác size của nó. Chúng được gọi là copy types. Bởi vì nó simple và nhỏ gọn nên dễ dàng để copy, do đó compiler luôn copy nếu bạn bỏ nó vào function."
---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>

Có một số kiểu dữ liệu trong Rust rất đơn giản (simple types),
bao gồm integers, floats, booleans (`true` và `false`), và `char`.
Các simple types này nằm trên stack bởi vì complier biết chính xác size của nó.
Chúng được gọi là **copy types**. Bởi vì nó simple và nhỏ gọn nên dễ dàng để copy,
do đó compiler luôn copy nếu bạn bỏ nó vào function.

Làm sao để biết đọc một kiểu dữ liệu có được **implement Copy** hay không.
Bạn có thể xem trong Rust document. Ví dụ `char`:
[https://doc.rust-lang.org/std/primitive.char.html](https://doc.rust-lang.org/std/primitive.char.html)

![](/media/2022/02/duyet-copy-trait.png)

Nếu bạn thấy:

- **Copy**: được copy nếu bạn bỏ nó vào function.
- **Display:** bạn có thể sử dụng `{}` để print.
- **Debug:** bạn có thể sử udnjg `{:?}` để print.

```rust
fn prints_number(number: i32) {
  println!("{}", number);
}

fn main() {
  let my_number = 8;
  prints_number(my_number); // Prints 8. prints_number gets a copy of my_number
  prints_number(my_number); // Prints 8 again.
                            // No problem, because my_number is copy type!
}
```

Do `i32` được Copy nên chúng ta có thể sử dụng `my_number` nhiều lần mà không cần borrow `&` như struct.

# Clone trait

Nếu bạn đọc document của String: [https://doc.rust-lang.org/std/string/struct.String.html](https://doc.rust-lang.org/std/string/struct.String.html)

![](/media/2022/02/duyet-clone-trait.png)

String không được implement **Copy**, thay vào đó là **Clone**. Clone cũng giúp copy giá trị nhưng sẽ cần rất nhiều memory, và ta phải tự gọi method `.clone()` chứ Rust sẽ không tự Clone.

```rust
fn prints_country(country_name: String) {
  println!("{}", country_name);
}

fn main() {
  let country = String::from("Duyet");
  prints_country(country);
  prints_country(country); // ⚠️
}
```

[(Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=61da0fb8c407d364a61520a22eacea40)

Sẽ báo lỗi, theo như compiler giải thích rằng `country` là `String` và không được implement `Copy` nên country bị move vào trong function. Do đó ta không thể sử dụng `country` được nữa.

```rust
error[E0382]: use of moved value: `country`
 --> src/main.rs:8:20
  |
6 | let country = String::from("Duyet");
  |     ------- move occurs because `country` has type `String`, which does not implement the `Copy` trait
7 | prints_country(country);
  |                ------- value moved here
8 | prints_country(country); // ⚠️
  |                ^^^^^^^ value used here after move

For more information about this error, try `rustc --explain E0382`.
```

Có hai cách:

### (1) Sử dụng `.clone()`

```rust
fn prints_country(country_name: String) {
  println!("{}", country_name);
}

fn main() {
  let country = String::from("Duyet");
  prints_country(country.clone()); // <-- clone
  prints_country(country);
}
```

[(Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=f14599c873454b103cf461f692d11c59)

String rất lớn, do đó `.copy()` sẽ tốn rất nhiều bộ nhớ. Sử dụng `&` để reference sẽ nhanh hơn, nếu có thể.

### (2) Sử dụng `&` reference

```rust
fn prints_country(country_name: &String) {
  println!("{}", country_name);
}

fn main() {
  let country = String::from("Duyet");
  prints_country(&country);
  prints_country(&country);
}
```

[(Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=1d812389e8c3f1b365263441ef96c227)

# Bonus: String và &str

Nếu bạn có một `String` và `&` reference, Rust sẽ convert nó thành `&str` khi bạn cần.

```rust
fn prints_country(country_name: &str) {
  println!("{}", country_name);
}

fn main() {
  let country = String::from("Duyet");
  prints_country(&country);
  prints_country(&country);
}
```

`&str` là một kiểu hơi phức tạp. 
Nó có thể vừa là String literals `let s = "I am &str";`. Trường hợp này `s` có kiểu `&'static` bởi vì nó được ghi trực tiếp vào binary. `&str` cũng có thể là borrowed của `str` hoặc `String`.

# Bonus: uninitialized variable

Variable mà không có giá trị được gọi là uninitialized variable.

```rust
fn main() {
  let my_variable; // ⚠️
}
```

Rust sẽ không compile và bạn sẽ không thể sử dụng cho đến khi `my_variable` được gán giá trị nào đó. Ta có thể lợi dụng điều này:

- Khai báo uninitialized variable.
- Gán giá trị cho nó trong 1 scope khác
- Vẫn giữ được giá trị của của variable đó khi ra khỏi scope.

```rust
fn main() {
  let my_number;
  {
    my_number = 100;
  }

  println!("{}", my_number);
}
```

Hoặc phức tạp hơn

```rust
fn loop_then_return(mut counter: i32) -> i32 {
  loop {
    counter += 1;
    if counter % 50 == 0 {
      break;
    }
  }
  counter
}

fn main() {
  let my_number;

  {
    // Pretend we need to have this code block
    let number = {
      // Pretend there is code here to make a number
      // Lots of code, and finally:
      57
    };

    my_number = loop_then_return(number);
  }

  println!("{}", my_number); // 100
}
```

[(Rust Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=7bc5309e397696c56cb0637caea005f2)
