---
template: post
title: 'Rust: Why ? is good'
date: '2022-09-24'
author: Van-Duyet Le
category: Rust
tags:
  - Rust
  - Cargo
slug: /2022/09/rust-question-mark-operator.html
draft: false
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F09%2Frust-question-mark-operator.html
description: In Rust, the question mark (?) operator is used as an alternate error propagation method for functions that yield Result or Option types. The ? operator is a shortcut that minimizes the amount of code required in a function to quickly return Err or None from the types Result<T, Err>, or Option.

---

# What is the question mark (?) operator?

In Rust, the question mark (`?`) operator is used as an alternate error propagation method for functions that yield `Result` or `Option` types. The `?` operator is a shortcut that minimizes the amount of code required in a function to quickly return `Err` or `None` from the types `Result<T, Err>`, or `Option`.

Error propagation is the process of "propagating," spreading up, or returning error information identified in code that is often triggered by a caller function in order for the caller function to resolve the problem correctly.

Let's have a look at how error propagation works in code using the example below:

```rust
fn main() -> Result<()> {
  let i = match halves_if_even(i) {
    Ok(i) => i,
    Err(e) => return Err(e),
  };

  println!("halves of i = {}", i);

  match submit_number(i) {
    Ok(_) => {
      println!("Successfully");
      Ok(())
    },
    Err(e) => return Err(e),
  }
}

fn halves_if_even(i: i32) -> Result<i32, Error> {
  if i % 2 == 0 {
    Ok(i / 2)
  } else {
    Err(/* something */)
  }
}

fn submit_number(i: i32) -> Result<(), Error> {
	// ...
}
```

However, in that it is very verbose. This is where the question mark operator `?` comes in.

```rust
fn main() -> Result<()> {
  let i = 35;
  let i = halves_if_even(i)?;
  println!("halves of i = {}", i);
  submit_number(i)?;
  Ok(())
}

fn halves_if_even(i: i32) -> Result<i32, Error> {
  // ...
}

fn submit_number(i: i32) -> Result<(), Error> {
  // ...
}
```

What `?` does here is equivalent to the `match` statement above with an addition. This operator desugars into a pattern match.

The nice thing about this code is that one can easily see and audit potential errors: for example, I can see that `halves_if_even` may result in an error, and a keen-eyed reviewer may see the potential data loss.

Even better, in the event of an error, I can do some type of recovery by opting to match rather than forward the error.

```rust
fn main() -> Result<()> {
  let i = 35;
  let i = halves_if_even(i)?;

  match submit_number(i) {
    Ok(_) => Ok(()),
    Err(err) => recover_from_error(err),
  }
}
```

# References

- [https://doc.rust-lang.org/rust-by-example/std/result/question_mark.html](https://doc.rust-lang.org/rust-by-example/std/result/question_mark.html)
- [Recoverable Errors with `Result`](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html#recoverable-errors-with-result)


[`Option`]: https://doc.rust-lang.org/std/option/index.html
[`Result`]: https://doc.rust-lang.org/std/result/index.html
[`Err`]: https://doc.rust-lang.org/std/result/enum.Result.html#variant.Err
