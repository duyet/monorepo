---
template: post
title: 'Rust Data Engineering: Processing Dataframes with Polars'
date: '2023-02-19'
author: Van-Duyet Le
category: Rust
tags:
  - Data
  - Data Engineer
  - Rust
slug: /2023/02/rust-polars.html
draft: false
fbCommentUrl: none
thumbnail: https://i.imgur.com/9yixw8K.png
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2023%2F02%2Frust-polars.html
description: If you're interested in data engineering with Rust, you might want to check out Polars, a Rust DataFrame library with Pandas-like API.
---

Rust is a fast and safe systems programming language with a growing ecosystem of libraries and tools for various use cases, including data engineering.
If you're interested in [data engineering with Rust](https://blog.duyet.net/2021/11/rust-data-engineering.html), you might want to check out Polars, a Rust DataFrame library with a Pandas-like API.

This post will use an example from one of my related repositories, namely https://github.com/duyet/git-insights-rs.
The repository contains two crates, namely [`numstat_parser`](https://github.com/duyet/git-insights-rs/tree/master/numstat-parser) which parses the results of `git logs --all --numstat`, and [`insights-cli`](https://github.com/duyet/git-insights-rs/tree/master/insights-cli) which contains the [`main.rs`](https://github.com/duyet/git-insights-rs/blob/master/insights-cli/src/main.rs) file that uses polars to construct a dataframe and then uses the dataframe to query for insights.

# Using Polars

To use Polars in a Rust project, you need to add it as a dependency in your `Cargo.toml` file:

```toml
[dependencies]
polars = "0.24.3"
```

Or just using the `cargo add`:

```bash
$ cargo add polars
```

Polars provides many feature flags that can be enabled during installation to enable additional functionality.
To use these flags with `cargo`:

```bash
$ cargo add polars --features=lazy,random,strings,is_in
```

# Create a DataFrame

There are many ways to construct a Polars DataFrame, like using Reader or construct manually. See more at [the documentation](https://docs.rs/polars/latest/polars/docs/eager/index.html).

Example of using macro `df![]`:

```rust
use polars::prelude::*;
use polars::df;

fn main() -> Result<()> {
  // use macro
  let df = df! [
      "names" => ["a", "b", "c"],
      "values" => [1, 2, 3],
      "values_nulls" => [Some(1), None, Some(3)]
  ]?;

  println!("{:?}", df);

  Ok(())
}
```

Example of using CsvReader:

```rust
use polars::prelude::*;

fn main() -> Result<()> {
  // read from path
  let df = CsvReader::from_path("iris_csv")?
              .infer_schema(None)
              .has_header(true)
              .finish()?;

  println!("{:?}", df);

  Ok(())
}
```

# Preparing a DataFrame

Let's start by creating a simple DataFrame with some sample data. I will using my `numstat_parser` crate to parse the path to `Vec<Numstat>`.

`rayon` is the great crate will help speed up by convert iter to parallel processing, just to replace the `.iter()` to `.par_iter()`.

```rust
use anyhow::{bail, Context, Result};
use numstat_parser::{parse_from_path, Numstat};
use polars::frame::row::Row;
use polars::prelude::*;
use rayon::prelude::*;

fn main() -> Result<()> {
  let path = "https://github.com/duyet/git-insights-rs.git";

  let result: Vec<Numstat> = parse_from_path(&path)?;

  // Map result to Vec<Row>
  let rows = result
      .par_iter()
      .flat_map(|n| {
          n.stats
              .par_iter()
              .map(|f| {
                  Row::new(vec![
                      AnyValue::Utf8(&n.commit),
                      AnyValue::Datetime(
                          n.date.timestamp_micros(),
                          TimeUnit::Microseconds,
                          &None,
                      ),
                      AnyValue::Utf8(&n.author.name),
                      AnyValue::Utf8(&n.author.email),
                      AnyValue::Utf8(&f.path),
                      AnyValue::Utf8(&f.extension),
                      AnyValue::UInt32(f.added),
                      AnyValue::UInt32(f.deleted),
                  ])
              })
              .collect::<Vec<Row>>()
      })
      .collect::<Vec<Row>>();

  let df = DataFrame::from_rows(&rows)?;

  println("{}", df);

  Ok(())
}
```

# Querying a DataFrame

Now that we have a DataFrame, let's explore how to query it. Polars provides a Pandas-like API for working with DataFrames in Rust.

For example, to filter rows based on a condition, you can use the `filter` method:

```rust
let mut df = DataFrame::from_rows(&rows)?;

let years = vec!["2022", "2023"];

let filterd_df = df.filter(
    col("date")
      .dt()
      .year()
      .is_in(lit(Series::from_iter(years)))
  );
```

To query **how many lines of code were added per author?**, we will use `groupby()` and `agg()` to count distinct:

```rust
let result = df.groupby([col("author_name")])
              .agg([col("commit").n_unique()])
              .sort_by_exprs(&[col("commit")], [true], false)
              .collect()?;

println!("{}", result);
```

You should see the following output:

```text
shape: (2, 2)
┌─────────────┬────────┐
│ author_name ┆ commit │
╞═════════════╪════════╡
│ Duyet Le    ┆ 30     │
├╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│ duyetbot    ┆ 13     │
└─────────────┴────────┘
```

Another example, to query to 5 languages with `.limit(5)`:

```rust
let result = df
    .with_column(col("date").dt().weekday().alias("n"))
    .with_column(col("date").dt().strftime("%A").alias("weekday"))
    .groupby([col("n"), col("weekday")])
    .agg([col("commit").n_unique()])
    .sort_by_exprs(&[col("n")], [false], false)
    .collect()?;

println!("{}", result);
```

The `with_column` allows you to add a new column to an existing DataFrame.

You should see the following output:

```text
shape: (5, 2)
┌──────────┬────────┐
│ language ┆ commit │
╞══════════╪════════╡
│ md       ┆ 20     │
├╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│ rs       ┆ 16     │
├╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│ yaml     ┆ 14     │
├╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│ toml     ┆ 9      │
├╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│ sh       ┆ 3      │
└──────────┴────────┘
```

# Summary

Polars is a powerful Rust library for data engineering and analysis. With its intuitive DataFrame API and efficient query engine, it makes working with large datasets in Rust much easier and more efficient. 

In this blog post, I have demonstrated how to install and use Polars to process data, query a DataFrame, and visualize data using simple examples.


I hope this blog post has been helpful in introducing you to Polars and giving you some ideas on how to use it in your own data engineering projects. For more document of usage you can see at some links below:

- https://github.com/duyet/git-insights-rs/tree/master
- https://docs.rs/polars/latest/polars/index.html
