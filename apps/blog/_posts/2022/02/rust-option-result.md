---
title: 'Rust: Option & Result'
date: '2022-02-15'
author: Van-Duyet Le
category: Rust 🦀
tags:
  - Rust
  - Rust Tiếng Việt
  - Rust Basic
slug: /2022/02/rust-option-result.html
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F02%2Frust-option-result.html
description: Rust giới thiệu hai generic enums Option và Result để giải quyết các vấn đề null pointer exceptions, exception data leak, ...
---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>
<div class="toc">
  <p>Trong bài này:</p>
  <ul>
    <li>
      <a href="#1-option">1. Option</a>
      <ul>
        <li><a href="#cách-sử-dụng-option">Cách sử dụng Option</a></li>
        <li><a href="#unwrap">.unwrap()</a></li>
        <li><a href="#expect">.expect()</a></li>
        <li><a href="#expect_or">.unwrap_or()</a></li>
        <li><a href="#unwrap_or_default">.unwrap_or_default()</a></li>
        <li><a href="#ok_or">.ok_or()</a></li>
        <li><a href="#match">match</a></li>
      </ul>
    </li>
    <li>
      <a href="#2-result">2. Result</a>
      <ul>
        <li><a href="#unwrap-1">.unwrap()</a></li>
        <li><a href="#expect-1">.expect()</a></li>
      </ul>
    </li>
    <li>
      <a href="#3-convert-result-sang-option">3. Convert Result sang Option</a>
    </li>
    <li>
      <a href="#4-toán-tử-">4. Toán tử ?</a>
    </li>
  </ul>
</div>

Nhiều ngôn ngữ sử dụng kiểu dữ liệu `null` hoặc `nil` hoặc `undefined` để đại diện cho các giá trị rỗng hoặc không tồn tại, và sử dụng `Exception` để xử lý lỗi. Rust bỏ qua hai khái niệm này, để tránh gặp phải các lỗi phổ biến như **null pointer exceptions,** hay **lộ thông tin nhạy cảm thông qua exceptions,** ... Thay vào đó, Rust giới thiệu hai generic enums `Option` và `Result` để giải quyết các vấn đề trên.

# 1. Option

Trong hầu hết các ngôn ngữ họ C (C, C#, Java, ...), để xác định một cái gì đó failed hay không tìm được giá trị thỏa mãn, chúng ta thường trả về một giá trị _“đặc biệt”_ nào đó. Ví dụ `indexOf()` của Javascript scan một phần tử trong mảng, trả về vị trí của phần tử đó trong mảng. Và trả về `-1` nếu không tìm thấy.

Dẫn đến, ta sẽ thường thấy một số đoạn code như sau đây:

```typescript
let sentence = 'The fox jumps over the dog';
let index = sentence.indexOf('fox');

if (index > -1) {
  let result = sentence.substr(index);
  console.log(result);
}
```

Như bạn thấy `-1` là một trường hợp đặc biệt cần xử lý. Có khi nào bạn đã từng mắc lỗi ngớ ngẫn vì tưởng giá trị đặc biệt đó là `0` chưa?

```typescript
if (index > 0) {
  // 3000 days of debugging
}
```

`""` hay `null` hay `None` cũng là một trong những trường hợp đặc biệt đó. Bạn đã từng nghe đến \***\*[Null References: The Billion Dollar Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/)\*\***?

Lý do cơ bản là không có gì chắc chắn và có thể ngăn bạn lại việc ... **quên**
xử lý mọi trường hợp giá trị đặc biệt, hoặc do chương trình trả về các giá trị đặc biệt không như mong đợi.
Có nghĩa là ta có thể _vô tình_ làm crash chương trình với một lỗi nhỏ ở bất kỳ đâu, ở bất kỳ thời điểm nào.

Rust làm điều này tốt hơn, chỉ với `Option`.

Một giá trị optional có thể mang một giá trị nào đó **Some(something)** hoặc không mang giá trị nào cả (**None**).

```rust
// An output can have either Some value or no value/ None.
enum Option<T> { // T is a generic and it can contain any type of value.
  Some(T),
  None,
}
```

Theo thiết kế, mặc định bạn sẽ không bao giờ lấy được giá trị bạn cần nếu không xử lý
các trường hợp có thể xảy ra với `Option`, là `None` chẳng hạn.
Điều này được bắt buộc bởi compiler lúc compile code, có nghĩa là nếu bạn quên check, code sẽ không bao giờ được compile.

```rust
let sentence = "The fox jumps over the dog";
let index = sentence.find("fox");

if let Some(fox) = index {
  let words_after_fox = &sentence[fox..];
  println!("{}", words_after_fox);
}
```

[(Rust Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=8d3d53cae73b642797337b6e1b01e58b)

## **Cách sử dụng Option**

Option là standard library, do đã được [preludes](https://learning-rust.github.io/docs/d7.std_primitives_and_preludes.html#Preludes) nên chúng ta không cần khai báo trước khi sử dụng. Ngoài enum [Option](https://doc.rust-lang.org/std/option/enum.Option.html) thì các variant của nó cũng đã được preludes sẵn như [Some](https://doc.rust-lang.org/std/option/enum.Option.html#variant.Some) và [None](https://doc.rust-lang.org/std/option/enum.Option.html#variant.None).

Ví dụ, ta có một function tính giá trị chia hai số, đôi khi sẽ không tìm ra được kết quả, ta sử dụng Some nhu sau:

```rust
fn divide(numerator: f64, denominator: f64) -> Option<f64> {
  if denominator == 0.0 {
    None
  } else {
    Some(numerator / denominator)
  }
}

fn main() {
  // The return value of the function is an option
  let result = divide(2.0, 3.0);

  // Pattern match to retrieve the value
  match result {
    // The division was valid
    Some(x) => println!("Result: {}", x),
    // The division was invalid
    None    => println!("Cannot divide by 0"),
  }
}
```

Ta thường sử dụng `match` để bắt giá trị trả về (`Some` hoặc `None`).

Bạn sẽ bắt gặp rất rất nhiều method khác nhau để xử lý giá trị của `Option`

Option method overview: [https://doc.rust-lang.org/std/option/#method-overview](https://doc.rust-lang.org/std/option/#method-overview)

### `.unwrap()`

Trả về giá trị nằm trong `Some`. Nếu giá trị là None có thể dẫn đến panic chương trình.

```rust
let x = Some("air");
assert_eq!(x.unwrap(), "air");

let x: Option<&str> = None;
assert_eq!(x.unwrap(), "air"); // panic!
```

### `.expect()`

Giống `.unwrap()`, nhưng nếu panic thì Rust sẽ kèm theo message

```rust
let x: Option<&str> = None;
x.expect("fruits are healthy"); // panics: `fruits are healthy`
```

### `.unwrap_or()`

Trả về giá trị nằm trong `Some`, nếu không trả về giá trị nằm trong `or`

```rust
assert_eq!(Some("car").unwrap_or("bike"), "car");
```

### `.unwrap_or_default()`

Trả về giá trị nằm trong `Some`, nếu không trả về giá [default](https://doc.rust-lang.org/std/default/trait.Default.html#tymethod.default).

```rust
let good_year_from_input = "1909";
let bad_year_from_input = "190blarg";
let good_year = good_year_from_input.parse().ok().unwrap_or_default();
let bad_year = bad_year_from_input.parse().ok().unwrap_or_default();

assert_eq!(1909, good_year);
assert_eq!(0, bad_year);
```

### `.ok_or()`

Convert `Option<T>` sang [`Result<T, E>`](https://doc.rust-lang.org/std/result/enum.Result.html),
mapping [`Some(v)`](https://doc.rust-lang.org/std/option/enum.Option.html#variant.Some)
thành [`Ok(v)`](https://doc.rust-lang.org/std/result/enum.Result.html#variant.Ok)
và [`None`](https://doc.rust-lang.org/std/option/enum.Option.html#variant.None)
sang [`Err(err)`](https://doc.rust-lang.org/std/result/enum.Result.html#variant.Err).

```rust
let x = Some("foo");
assert_eq!(x.ok_or(0), Ok("foo"));
```

### `match`

Chúng ta có thể sử dụng pattern matching để code dễ đọc hơn

```rust
fn get_name(who: Option<String>) -> String {
  match who {
    Some(name) => format!("Hello {}", name),
    None       => "Who are you?".to_string(),
  }
}

get_name(Some("duyet"));
```

# 2. Result

Tương tự như `Option`. Một kết quả trả về (**`Result`**) của một function thường sẽ có hai trường hợp:

- thành công (**`Ok`**) và trả về kết quả
- hoặc lỗi (**`Err`**) và trả về thông tin lỗi.

```rust
enum Result<T, E> {
  Ok(T),
  Err(E),
}
```

Ví dụ

```rust
fn get_age(who: &str) -> Result<i8, &str> {
  if who == "duyet" {
    Ok(18)
  } else {
    Err("unknown")
  }
}

fn main() -> Result<(), &'static str> {
  let who = "duyet";

  match get_age(who) {
    Ok(age)  => println!("{} is {}", who, age),
    Err(err) => println!("Err: {}", err),
  }

  Ok(())
}
```

[(Rust Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=3628b261807f0c18481f516f82e8694e)

Như bạn thấy thì `main()` cũng có thể return về `Result<(), &'static str>`

### `.unwrap()`

Ví dụ trên nhưng sử dụng `.unwrap()` , chủ động panic (crash) dừng chương trình nếu gặp lỗi.

```rust
fn main() -> Result<(), &'static str> {
  let who = "duyet";
  let age = get_age(who).unwrap();
  println!("{} is {}", who, age);

  Ok(())
}
```

[(Rust Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=c93551e94e040369d5874672495e3fc9)

### `.expect()`

Giống như `unwrap()`: chủ động panic (crash) dừng chương trình nếu gặp lỗi và kèm theo message. Sẽ rất có ích, nhất là khi có quá nhiều unwrap, bạn sẽ không biết nó panic ở đâu.

```rust
fn main() -> Result<(), &'static str> {
  let who = "ngan";
  let age = get_age(who).expect("could not get age");
  println!("{} is {}", who, age);

  Ok(())
}
```

[(Rust Playground)](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=1be3f135f1abeb6bc29d2bba5a99ccda)

Xem thêm mọi method khác của Result [tại đây](https://doc.rust-lang.org/std/result/enum.Result.html).

# 3. Convert `Result` sang `Option`

Đôi khi bạn sẽ cần convert từ `Ok(v)` sang `Some(v)` hoặc `Err(e)` sang `Some(e)`

```rust
// .ok(v) = Some(v)
let x: Result<u32, &str> = Ok(2);
assert_eq!(x.ok(), Some(2));

let x: Result<u32, &str> = Err("Nothing here");
assert_eq!(x.ok(), None);

// .err()
let x: Result<u32, &str> = Ok(2);
assert_eq!(x.err(), None);

let x: Result<u32, &str> = Err("Nothing here");
assert_eq!(x.err(), Some("Nothing here"));
```

# 4. Toán tử `?`

Khi viết code mà có quá nhiều functions trả về [Result](https://doc.rust-lang.org/std/result/enum.Result.html), việc handle Err sẽ khá nhàm chán. Toán tử chấm hỏi [?](https://doc.rust-lang.org/std/ops/trait.Try.html) cho phép dừng function tại vị trí đó và return cho function cha nếu [Result](https://doc.rust-lang.org/std/result/enum.Result.html) ở vị trí đó là Err.

Nó sẽ thay thế đoạn code sau:

```rust
use std::fs::File;
use std::io::prelude::*;
use std::io;

struct Info {
  name: String,
  age: i32,
  rating: i32,
}

fn write_info(info: &Info) -> io::Result<()> {
  // Early return on error
  let mut file = match File::create("my_best_friends.txt") {
    Err(e) => return Err(e),
    Ok(f) => f,
  };
  if let Err(e) = file.write_all(format!("name: {}\n", info.name).as_bytes()) {
    return Err(e)
  }
  if let Err(e) = file.write_all(format!("age: {}\n", info.age).as_bytes()) {
    return Err(e)
  }
  if let Err(e) = file.write_all(format!("rating: {}\n", info.rating).as_bytes()) {
    return Err(e)
  }
  Ok(())
}
```

thành

```rust
use std::fs::File;
use std::io::prelude::*;
use std::io;

struct Info {
  name: String,
  age: i32,
  rating: i32,
}

fn write_info(info: &Info) -> io::Result<()> {
  let mut file = File::create("my_best_friends.txt")?;
  // Early return on error
  file.write_all(format!("name: {}\n", info.name).as_bytes())?;
  file.write_all(format!("age: {}\n", info.age).as_bytes())?;
  file.write_all(format!("rating: {}\n", info.rating).as_bytes())?;
  Ok(())
}
```

Gọn đẹp hơn rất nhiều.

Toán tử `?` sẽ unwrap giá trị `Ok`, hoặc return giá trị `Err` ở vị trí gần toán tử đó.

`?` chỉ có thể được dùng trong function có kiểu dữ liệu trả về là [Result](https://doc.rust-lang.org/std/result/enum.Result.html).
