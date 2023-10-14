---
title: 'Rust: Trait'
date: '2022-02-13'
author: Van-Duyet Le
category: Rust 🦀
tags:
  - Rust
  - Vietnamese
  - Rust Tiếng Việt
  - Rust Basic
slug: /2022/02/rust-trait.html
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F02%2Frust-trait.html
thumbnail: https://i.imgur.com/ZKHSRQK.png
description: Rust Trait là gì? Rust có nhiều loại data types như primitives (i8, i32, str, ...), struct, enum và các loại kết hợp (aggregate) như tuples và array. Mọi types không có mối liên hệ nào với nhau. Các data types có các phương thức (methods) để tính toán hay convert từ loại này sang loại khác, nhưng chỉ để cho tiện lợi hơn, method chỉ là các function. Trait trong Rust giúp chúng ta thực hiện những điều này.
---

<div class="noti">Chuỗi bài viết <a href="/tag/rust-tiếng-việt/">Rust Tiếng Việt</a> là một trong những nội dung nằm trong sách <a href="https://rust-tieng-viet.github.io/?utm_source=blog.duyet.net&utm_medium=post&utm_campaign=launch_rust_tieng_viet" target="_blank"><strong>Rust Tiếng Việt</strong></a></div>

<div class="toc">
  <p>Trong bài này:</p>
  <ul>
    <li><a href="#trait-l%C3%A0-g%C3%AC">Trait là gì?</a></li>
    <li><a href="#%C4%91%E1%BB%8Bnh-ngh%C4%A9a-m%E1%BB%99t-trait">Định nghĩa một Trait</a></li>
    <li><a href="#implement-trait-cho-m%E1%BB%99t-type">Implement Trait cho một Type</a></li>
    <li><a href="#default-implementations">Default Implementations </a></li>
    <li><a href="#traits-as-parameters">Traits as Parameters</a></li>
    <li><a href="#trait-bound">Trait Bound</a></li>
    <li><a href="#specifying-multiple-trait-bounds-with-the--syntax">Specifying Multiple Trait Bounds with the + Syntax</a></li>
    <li><a href="#where-clauses">where Clauses</a></li>
    <li><a href="#returning-types-that-implement-traits">Returning Types that Implement Traits</a></li>
    <li><a href="#using-trait-bounds-to-conditionally-implement-methods">Using Trait Bounds to Conditionally Implement Methods</a></li>
    <li><a href="#blanket-implementations">Blanket implementations</a></li>
    <li><a href="#trait-inheritance">Trait Inheritance</a></li>
    <li><a href="#k%E1%BA%BFt">Kết</a></li>
  </ul>
</div>

Rust có nhiều loại data types như primitives (`i8`, `i32`, `str`, ...), struct, enum và các loại kết hợp (aggregate) như tuples và array. Mọi types không có mối liên hệ nào với nhau. Các data types có các phương thức (methods) để tính toán hay convert từ loại này sang loại khác, nhưng chỉ để cho tiện lợi hơn, method chỉ là các function. Bạn sẽ làm gì nếu một tham số là nhiều loại kiểu dữ liệu? Một số ngôn ngữ như Typescript hay Python sẽ có cách sử dụng Union type như thế này:

```typescript
function notify(data: string | number) {
  if (typeof data == 'number') {
    // ...
  } else if (typeof data == 'number') {
    // ...
  }
}
```

Còn trong Rust thì sao?

![Trait implementations for Display](https://i.imgur.com/ZKHSRQK.png)

# Trait là gì?

Có thể bạn đã thấy qua trait rồi: `Debug`, `Copy`, `Clone`, ... là các trait.

Trait là một cơ chế abstract để thêm các tính năng (functionality) hay hành vi (behavior)
khác nhau vào các kiểu dữ liệu (types) và tạo nên các mối quan hệ giữa chúng.

Trait thường đóng 2 vai trò:

1. Giống như là interfaces trong Java hay C# (fun fact: lần đầu tiên nó được gọi là `interface`). Ta có thể kế thừa (inheritance) interface, nhưng không kế thừa được implementation của interface*.* Cái này giúp Rust có thể hỗ trợ [OOP](https://stevedonovan.github.io/rust-gentle-intro/object-orientation.html). Nhưng có một chút khác biệt, nó không hẳn là interface.
2. Vai trò này phổ biến hơn, trait đóng vai trò là generic constraints. Dễ hiểu hơn, ví dụ, bạn định nghĩa một function, tham số là một _kiểu dữ liệu bất kỳ_ nào đó, không quan tâm, miễn sau kiểu dữ liệu đó phải có phương thức `method_this()`, `method_that()` nào đó cho tui. _Kiểu dữ liệu nào đó_ gọi là _genetic type_. Function có chứa tham số generic type đó được gọi là _generic function_. Và việc ràng buộc phải có `method_this()`, `method_that()` , ... gọi là _generic constraints_. Mình sẽ giải thích rõ cùng với các ví dụ sau dưới đây.

Để gắn một trait vào một type, bạn cần implement nó.
Bởi vì `Debug` hay `Copy` quá phổ biến, nên Rust có attribute để tự động implement:

```rust
#[derive(Debug)]
struct MyStruct {
  number: usize,
}
```

Nhưng một số trait phức tạp hơn bạn cần định nghĩa cụ thể
bằng cách `impl` nó. Ví dụ bạn có trait `Add`
([std::ops::Add](https://doc.rust-lang.org/std/ops/trait.Add.html#implementors))
để add 2 type lại với nhau. Nhưng Rust sẽ không biết cách bạn add 2
type đó lại như thế nào, bạn cần phải tự định nghĩa:

```rust
use std::ops::Add;

struct MyStruct {
  number: usize,
}

impl Add for MyStruct {    // <-- here
  type Output = Self;
  fn add(self, other: Self) -> Self {
    Self { number: self.number + other.number }
  }
}

fn main() {
  let a1 = MyStruct { number: 1 };
  let a2 = MyStruct { number: 2 };
  let a3 = MyStruct { number: 3 };

  assert_eq!(a1 + a2, a3);
}
```

Note: Mình sẽ gọi **Define Trait** là việc định nghĩa,
khai báo một trait mới trong Rust (`trait Add`).
**Implement Trait** là việc khai báo nội dung của function được
liệu kê trong Trait cho một kiểu dữ liệu cụ thể nào đó (`impl Add for MyStruct`).

# Định nghĩa một Trait

Nhắc lại là Trait định nghĩa các hành vi (behavior).
Các types khác nhau có thể chia sẻ cùng cá hành vi.
Định nghĩa một trait giúp **nhóm** các hành vi để làm một việc gì đó.

Theo ví dụ của Rust Book, ví dụ ta các struct chứa nhiều loại text:

- `NewsArticle` struct chứa news story, và
- `Tweet` struct có thể chứa tối đa 280 characters cùng với metadata.

Bây giờ chúng ta cần viết 1 crate name có tên là `aggregator`
có thể hiển thị summaries của data có thể store trên `NewsArticle`
hoặc `Tweet` instance. Chúng ta cần định nghĩa method `summarize`
trên mỗi instance. Để định nghĩa một trait, ta dùng `trait` theo sau
là trait name; dùng keyword `pub` nếu định nghĩa một public trait.

```rust
pub trait Summary {
  fn summarize(&self) -> String;
}
```

Trong ngoặc, ta định nghĩa các method signatures để định nghĩa hành vi:
`fn summarize(&self) -> String`. Ta có thể định nghĩa nội dung của function.
Hoặc không, ta dùng `;` kết thúc method signature, để bắt buộc type nào
implement `trait Summary` đều phải định nghĩa riêng cho nó,
bởi vì mỗi type (`NewsArticle` hay `Tweet`) đều có cách riêng để `summarize`. Mỗi trait có thể có nhiều method.

# Implement Trait cho một Type

Bây giờ ta định implement các method của trait Summary cho từng type.
Ví dụ dưới đây ta có `struct NewsArticle` và `struct Tweet`,
và ta định nghĩa `summarize` cho 2 struct này.

```rust
pub trait Summary {
  fn summarize(&self) -> String;
}

pub struct NewsArticle {
  pub headline: String,
  pub location: String,
  pub author: String,
  pub content: String,
}

impl Summary for NewsArticle {
  fn summarize(&self) -> String {
    format!("{}, by {} ({})", self.headline, self.author, self.location)
  }
}

pub struct Tweet {
  pub username: String,
  pub content: String,
  pub reply: bool,
  pub retweet: bool,
}

impl Summary for Tweet {
  fn summarize(&self) -> String {
    format!("{}: {}", self.username, self.content)
  }
}
```

Implement trait cho type giống như `impl` bình thường,
chỉ có khác là ta thêm **trait name** và keyword `for` sau `impl`.
Bây giờ Summary đã được implement cho `NewsArticle` và `Tweet`,
người sử dụng crate đã có thể sử dụng các phương thức của trait như các method function bình thường.
Chỉ một điều khác biệt là bạn cần mang trait đó vào cùng scope hiện tại cùng với type để có thể sử dụng.
Ví dụ:

```rust
use aggregator::{Summary, Tweet}; // <-- same scope

fn main() {
  let tweet = Tweet {
    username: String::from("horse_ebooks"),
    content: String::from("of course, as you probably already know, people"),
    reply: false,
    retweet: false,
  };

  println!("1 new tweet: {}", tweet.summarize());
  // 1 new tweet: horse_ebooks: of course, as you probably already know, people
}
```

Rust Playground: [https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=dc563051aecebae4344776c06fb1b49d](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=dc563051aecebae4344776c06fb1b49d)

Chúng ta có thể implement trait cho mọi type khác bất kỳ, ví dụ implement `Summary` cho `Vec<T>` trong scope của crate hiện tại.

```rust
pub trait Summary {
  fn summarize(&self) -> String;
}

impl<T> Summary for Vec<T> {    // <-- local scope
  fn summarize(&self) -> String {
    format!("There are {} items in vec", self.len())
  }
}

fn main() {
  let vec = vec![1i32, 2i32];
  println!("{}", vec.summarize());
  // There are 2 items in vec
}
```

Rust Playground: [https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=dcaa812fab222ec0c713a38b066bda20](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=dcaa812fab222ec0c713a38b066bda20)

Bạn sẽ không thể implement external traits trên external types.
Ví dụ ta không thể implement `Display` cho `Vec<T>` bởi vì
`Display` và `Vec<T>` được định nghĩa trong standard library,
trong trong crate hiện tại. Rule này giúp tránh chống chéo và chắc chắn
rằng không ai có thể break code của người khác và ngược lại.

# Default Implementations

Đôi khi bạn cần có default behavior mà không cần phải implement content cho từng type mỗi khi cần sử dụng:

```rust
pub trait Summary {
  fn summarize(&self) -> String {
    String::from("(Read more...)")
  }
}

pub struct NewsArticle {
  pub headline: String,
  pub location: String,
  pub author: String,
  pub content: String,
}

impl Summary for NewsArticle {}; // <-- sử dụng {}

fn main() {
  let article = NewsArticle { ... };
  println!("New article: {}", article.summarize());
  // New article: (Read more...)
}
```

# Traits as Parameters

Trở lại ví dụ Typescript ở đầu tiên, với Trait bạn đã có thể define
một function chấp nhận tham số là nhiều kiểu dữ liệu khác nhau.
Nói theo một cách khác, bạn không cần biết kiểu dữ liệu,
bạn cần biết kiểu dữ liệu đó mang các behavior nào thì đúng hơn.

```rust
fn notify(data: &impl Summary) {
  println!("News: {}", data.summarize());
}

fn main() {
  let news = NewsArticle {};
  notify(news);
}
```

Ở đây, thay vì cần biết `data` là type nào (`NewsArticle` hay `Tweet`?),
ta chỉ cần cho Rust compiler biết là `notify` sẽ chấp nhận mọi
**type có implement** `trait Summary`, mà trait Summary có behavior `.summarize()`,
do đó ta có thể sử dụng method `.summary()` bên trong function.

# Trait Bound

Một syntax sugar khác mà ta có thể sử dụng thay cho `&impl Summary` ở trên,
gọi là _trait bound_, bạn sẽ bắt gặp nhiều trong Rust document:

```rust
pub fn notify<T: Summary>(item: &T) {
  println!("News: {}", item.summarize());
}
```

Đầu tiên chúng ta định nghĩa trait bound bằng cách định nghĩa
một generic type parameter trước, sau đó là `:` trong ngoặc `<` và `>`.
Ta có thể đọc là: `item` có kiểu generic là `T` và `T` phải được `impl Summary`.

- `notify<T>(` khai báo generic type `T`
- `notify<T: Summary>(` generic type được implement `trait Summary`

Cú pháp này có thể dài hơn và không dễ đọc như `&impl Summary`, nhưng hãy xem ví dụ dưới đây:

```rust
pub fn notify(item1: &impl Summary, item2: &impl Summary) {}  // (1)
pub fn notify<T: Summary>(item1: &T, item2: &T) {}            // (2)
```

Dùng _trait bound_ giúp ta tái sử dụng lại `T`,
mà còn giúp force `item1` và `item2` có cùng kiểu dữ liệu,
đây là cách duy nhất (cả 2 đều là `NewsArticle` hoặc cả 2 đều là `Tweet`) mà (1) không thể.

# Specifying Multiple Trait Bounds with the + Syntax

Ta có cú pháp `+` nếu muốn generic `T` có được impl nhiều trait khác nhau.
Ví dụ ta muốn `item` phải có cả `Summary` lẫn `Display`

```rust
pub fn notify(item: &(impl Summary + Display)) {}
pub fn notify<T: Summary + Display>(item: &T) {}
```

# `where` Clauses

Đôi khi bạn sẽ có nhiều genenic type, mỗi generic type lại có nhiều trait bound,
khiến code khó đọc. Rust có một cú pháp `where` cho phép định nghĩa trait bound
phía sau function signature. Ví dụ:

```rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {
```

Với `where` clause:

```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
	  U: Clone + Debug,
{
```

# Returning Types that Implement Traits

Chúng ta cũng có thể sử dụng `impl Trait` cho giá trị được trả về của function.

```rust
fn returns_summarizable() -> impl Summary {
    Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("ahihi"),
        reply: false,
        retweet: false,
    }
}
```

Được đọc là: function `returns_summarizable()` trả về bất kỳ kiểu dữ liệu nào có `impl Summary`.
Tuy nhiên bạn chỉ có thể return về hoặc `Tweet`
hoặc `NewsArticle` do cách implement của compiler. Code sau sẽ có lỗi:

```rust
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch { NewsArticle {} }
		else { Tweet {} }
}
```

Rust Book có một chương riêng để xử lý vấn đề này: [Chapter 17: Using Trait Objects That Allow for Values of Different Types](https://doc.rust-lang.org/book/ch17-02-trait-objects.html#using-trait-objects-that-allow-for-values-of-different-types)

# Using Trait Bounds to Conditionally Implement Methods

Ta có thể implement 1 method có điều kiện cho bất kỳ type nào
có implement một trait khác cụ thể. Ví dụ để dễ hiểu hơn dưới đây:

```rust
use std::fmt::Display;

struct Pair<T> {
  x: T,
  y: T,
}

impl<T> Pair<T> {
  fn new(x: T, y: T) -> Self {
    Self { x, y }
  }
}

impl<T: Display + PartialOrd> Pair<T> {
  fn cmp_display(&self) {
    if self.x >= self.y {
      println!("The largest member is x = {}", self.x);
    } else {
      println!("The largest member is y = {}", self.y);
    }
  }
}
```

`impl<T> Pair<T>` implement function `new` trả về kiểu dữ liệu `Pair<T>` với `T` là generic (bất kỳ kiểu dữ liệu nào.

`impl<T: Display + PartialOrd> Pair<T>` implement function `cmp_display`
cho mọi generic `T` với `T` đã được implement `Display + PartialOrd`
trước đó rồi (do đó mới có thể sử dụng các behavior của
`Display` (`println!("{}")`) và `PartialOrd` (`>`, `<`, ...) được.

# Blanket implementations

Ta cũng có thể implement 1 trait có điều kiện cho bất kỳ kiểu dữ liệu
nào có implement một trait khác rồi. Implementation của một trait cho
1 kiểu dữ liệu khác thỏa mãn trait bound được gọi là _blanket implementations_
và được sử dụng rộng rãi trong Rust standard library.
Hơi xoắn não nhưng hãy xem ví dụ dưới đây.

Ví dụ: `ToString` trait trong
[Rust standard library](https://doc.rust-lang.org/src/alloc/string.rs.html#2390),
nó được implement cho mọi kiểu dữ liệu nào có được implement `Display` trait.

```rust
impl<T: Display> ToString for T {
  // --snip--
}
```

Có nghĩa là, với mọi type có `impl Display`, ta có hiển nhiên thể sử dụng được các thuộc tính của `trait ToString`.

```rust
let s = 3.to_string(); // do 3 thoaỏa manãn Display
```

Do `3` thỏa mãn điều kiện là đã được `impl Display for i32`.
([https://doc.rust-lang.org/std/fmt/trait.Display.html#impl-Display-11](https://doc.rust-lang.org/std/fmt/trait.Display.html#impl-Display-11))

# Trait Inheritance

```rust
pub trait B: A {}
```

Cái này không hẳn gọi là _Trait Inheritance_, cái này đúng hơn gọi là "cái nào implement cái `B` thì cũng nên implement cái `A`". `A` và `B` vẫn là 2 trait độc lập nên vẫn phải implemenet cả 2.

```rust
impl B for Z {}
impl A for Z {}
```

Inheritance thì không được khuyến khích sử dụng.

# Kết

Compiler sử dụng trait bound để kiểm tra các kiểu dữ liệu được sử dụng trong code có đúng behavior không.
Trong Python hay các ngôn ngữ dynamic typed khác, ta sẽ gặp lỗi lúc runtime nếu chúng ta gọi các method mà
kiểu dữ liệu đó không có hoặc không được định nghĩa.

Bạn có chắc chắn là `a` dưới đây có method `summarize()` hay không?
Nhớ rằng typing hint của Python3 chỉ có tác dụng là nhắc nhở cho lập trình viên thôi.

```python
# Python
func print_it(a: Union[NewsArticle, Tweet]):
  print(a.summarize())

print_it(1)
print_it("what")
```

Do đó Rust bắt được mọi lỗi lúc compile time và force chúng ta phải fix hết trước khi chương trình chạy.
Do đó chúng ta không cần phải viết thêm code để kiểm tra behavior (hay sự tồn tại của method)
trước khi sử dụng lúc runtime nữa, tăng cường được performance mà không phải từ bỏ tính flexibility của generics.

Xem tiếp về [Struct](/2022/02/rust-struct.html).
