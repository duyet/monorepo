---
title: Fossil Data Platform Rewritten in Rust 🦀
date: '2023-06-18'
author: Duyet, Hieu
category: Data
tags:
  - Data
  - Data Engineering
  - Rust
slug: /2023/06/fossil-data-platform-written-rust.html
thumbnail: /media/2023/06/fossil-data-platform-written-rust/bench-2.png
description: My data engineering team at Fossil recently released some of Rust-based components of our Data Platform after faced performance and maintenance challenges of the old Python codebase. I would like to share the insights and lessons learned during the process of migrating Fossil's Data Platform from Python to Rust.
---

[Duyet]: https://github.com/duyet
[Hieu]: https://github.com/therealhieu
[Khanh]: https://github.com/DuyKhanhVu
[Hung]: https://github.com/hungtg7
[Duong]: https://github.com/lethanhduong

My data engineering team at Fossil recently released some of Rust-based components of our Data Platform after faced performance and maintenance challenges of the old Python codebase. I would like to share the insights and lessons learned during the process of migrating Fossil's Data Platform from Python to Rust.

**Authors: [Duyet], [Hieu]**

# The Need for Change

With the Fossil Data Platform handling approximately *1.2 billion records* daily in near-real time, our existing Python codebase started showing signs of strain. We had been using Python for years and encountered issues such as duplicated code, deprecated components, hardcoded elements, and a lack of comprehensive reviews. This situation prompted a critical evaluation of our options:

1. **Continuing with Python:** We contemplated rewriting the platform while sticking with Python. However, considering our data engineering requirements, we recognized the need for a language more suitable for the task.
2. Rewrite into data-engineering-friendly language like **Java or Scala**, given their popularity in the data engineering domain.
3. **Exploring other compiled languages**

After careful consideration, I decided to adopt **Rust** as the language of choice for rewriting our Data Platform. While Rust was relatively new at the time, it demonstrated significant potential, especially as a way to escape from the JVM ecosystem.

**No one had experience with Rust at all.** However, I viewed it as an opportunity for both the team and the project to grow and learn. There were many promising aspects, and even if I were to fail, my teammates and I would still learn valuable lessons.

# Why Rust is chosen?

All programming languages cannot solve all problems on their own. We should choose a language based on its unique features, design choices, and how it can help us address challenges we faced in the past.

In the deliberation between Rust and Golang for our next Data Platform, we weighed the advantages of both languages while working with a sizable Python codebase and encountering difficulties. Here are the key reasons why Rust emerged as the preferred choice:

- **Excellent tooling.** No need to struggling with Python virtual environment, pip dependencies management, `PYTHONPATH` or deployment anymore. With **`cargo`**, a powerful package manager, these tasks become streamlined and simplified. Having `cargo fmt`, `cargo clippy`, and `cargo test` Rust's [approach to testing](https://doc.rust-lang.org/rustdoc/documentation-tests.html) all built into the language with well-established community standards means that it's that much easier.
- Rust follows a strict approach, ensuring that even with suboptimal design, compiled code will function correctly, provided you have comprehensive test coverage. Even you don’t have a good design, your code will always works if it compiled.
- **The compiler is your best friend.** The error output is very detailed, a lot of contexts, it tells you what causes the error and where you can find the cause. In many cases, it even provides a fix for the error.
- **Unique approach** to memory management, which guarantees memory safety without the overhead of a garbage collector, resulting in a smaller memory footprint and predictable performance, critical factors in data-intensive applications like our Data Platform.
- You can learn some more at this post [https://blog.duyet.net/2021/11/rust-data-engineering.html](https://blog.duyet.net/2021/11/rust-data-engineering.html)

## The Drawbacks of Using Rust

**Steep Learning Curve**

Rust's advanced features and strict adherence to memory safety principles can result in a steep learning curve for developers.

You will say: Wtf is [From](https://doc.rust-lang.org/std/convert/trait.From.html), [TryFrom](https://doc.rust-lang.org/std/convert/trait.TryFrom.html), [AsRef](https://doc.rust-lang.org/std/convert/trait.AsRef.html), [Arc](https://doc.rust-lang.org/std/sync/struct.Arc.html), [Pin](https://doc.rust-lang.org/std/pin/struct.Pin.html), [Feature](https://doc.rust-lang.org/std/future/trait.Future.html), …

To become proficient, you need to learn the complex language syntax, common idioms, and libraries. This could take weeks or even months of frequent practice. I started with some small projects like [athena-rs](https://github.com/duyet/athena-rs), [grant-rs](https://github.com/duyet/grant-rs), or [glossary-rs](https://github.com/duyet/glossary-rs) at first, and keep learning by building micro project like that until now. 

**Development Speed**

Languages like Python and Go make you feel productive from day one, but Rust slows down development speed due to the extra complexity of memory safety. While Rust crates like [serde](https://serde.rs/), [polars](https://www.pola.rs/), and [ballista](https://github.com/apache/arrow-ballista) provide good support for data engineering, they might not offer the same level of maturity and feature completeness as more established languages. This may require additional effort to work around limitations or implement missing functionality.

**Long Compile Times**

Rust is known for having relatively longer compile times, especially for larger projects. Current full project compilations can take 30 minutes, which can slow down the development feedback loop. This longer compilation duration can make it more challenging to iterate quickly and test changes. However, there are techniques available to optimize Rust's compilation speed, such as those mentioned in resources like "[Fast Rust Builds](https://matklad.github.io/2021/09/04/fast-rust-builds.html)", “[Stupidly effective ways to optimize Rust compile time](https://xxchan.me/cs/2023/02/17/optimize-rust-comptime-en.html)” or "[Delete Cargo Integration Tests](https://matklad.github.io/2021/02/27/delete-cargo-integration-tests.html)."

# The plan

My plan revolved around taking an exploratory approach to determine the feasibility and effectiveness of Rust for our Data Platform

1. **Initial Prototype**: I took the initiative to delve into Rust and develop a first runnable prototype that would be evaluated against a predefined set of criteria. This prototype aimed to showcase Rust's capabilities and assess its potential in solving our existing problems.
2. **Evaluation and Team Involvement**: Once I can proved with the team the initial prototype is promising, we intended to involve additional team members in the development process. Their expertise and perspectives would help validate the viability of Rust for our Data Platform.
3. **Become the mainstream**: As the project gained momentum, our plan was to gradually transition the entire team to Rust. This shift would allow us to leverage the distinctive features and advantages of Rust effectively, enabling us to tackle the challenges we had faced.

# The First Benchmark

My first version took three months to rewrite and has shown excellent performance even **without** optimization, the memory [`.clone()`](https://doc.rust-lang.org/std/clone/trait.Clone.html) everywhere. I conducted some benchmarks including `cargo bench` and transforming the real data files as well.

Despite the lack of fine-tuning and potential areas for optimization, Rust demonstrated its inherent efficiency and ability to handle our data processing requirements effectively:

![](/media/2023/06/fossil-data-platform-written-rust/bench-1.png)

After comparing the two components in the real  environment, Rust processes messages faster and consumes more messages than Python.

![](/media/2023/06/fossil-data-platform-written-rust/bench-2.png)

![](/media/2023/06/fossil-data-platform-written-rust/bench-3.png)

![](/media/2023/06/fossil-data-platform-written-rust/bench-4.png)

The image above displays the recent benchmark results by Hieu of **Data Platform v3 (Python)** vs **v4 (Rust)** in terms of processing time and memory usage. Rust outperformed Python by achieving a **490% faster processing time** while maintaining the same memory usage. It's worth noting that Arrow was used as the data layout format during the benchmark. Based on this benchmark, the team started optimizing memory usage to further improve the performance of the Data Platform.

Moving forward, our focus shifted to further optimizing the code, eliminating unnecessary memory clones, and leveraging Rust's advanced features to unlock even greater efficiency.

The need to ensure backward compatibility with the previous Python-based inline transformation without disrupting the current configuration. I will need FFI to interact with Python (thanks to [PyO3](https://github.com/PyO3/pyo3)) which decreased the performance, but this trade-off is acceptable.

```yaml
# example config.yaml
...
source_field: properties
target_field: config_value
transformations:
    - name: custom_code
      language: python
      code: |
        year = datetime.now().strftime("%Y")
        return source_field.get("config_name").lower()
```



# Team involvement

The decision to adopt Rust for our Data Platform has resulted in the entire team actively engaging with the language. The rest of the team is starting to learn and build with Rust. [Hieu], Uyen, [Khanh], [Hung] and [Duong] are starting to build or rewrite more key components of the Data Platform include the data ingestion API, data transformation workers, [athena-rs](https://github.com/duyet/athena-rs) (AWS Athena Schema Management), [grant-rs](https://github.com/duyet/grant-rs) (Manage Redshift/Postgres privileges in GitOps style), the Kafka configurations management, ...

[http://rust-tieng-viet.github.io](http://rust-tieng-viet.github.io/) is one of the documents I could provide for the team at first.

However, there have been some changes, and the migration is progressing slowly due to other priorities.

![Data Engineering Team 2022](/media/2023/06/fossil-data-platform-written-rust/data-team-2022.png)

*Data Engineering Team 2022*

# Well, what's next?

We need to have continued our efforts to optimize and refine its performance. Furthermore, we are exploring opportunities to leverage the Rust-based Data Platform alongside Apache Spark for batch processing. Investigating the integration possibilities between the Rust-based platform and Apache Spark opens up new avenues for expanding our data engineering capabilities.

In parallel, we are actively working on ensuring backward compatibility with our previous Python-based Data Platform. This involves rigorous testing of the new Rust-based components with the existing configuration files and datasets.

After all, [Hieu](https://github.com/therealhieu) is leading the rewrite effort based on his experience from the first version and is implementing best practices. He plans to create partially open-source components that are backward compatible with Python, refactor the configuration, use Polars and DuckDB, enable parallel processing on the Tokio runtime, and carefully benchmark resource consumption. Hieu may provide detailed information and lessons learned at a later time through a highlighting article.

![](/media/2023/06/fossil-data-platform-written-rust/whats-next.png)

# The feature of Rust for Data Engineering

Despite being [the most loved language for seven consecutive years](https://survey.stackoverflow.co/2022/#section-most-loved-dreaded-and-wanted-programming-scripting-and-markup-languages), Rust may still be considered relatively less popular in certain domains. However, I believe that Rust holds tremendous potential, especially for Data Engineering, and can emerge as a new trend in the field.

**More and more data-sensitive and data pipelines application and framework in Rust nowaday.** Let me tell you a few names:

- [apache/arrow-datafusion](https://github.com/apache/arrow-datafusion): Apache Arrow DataFusion SQL Query Engine
- [TimelyDataflow/timely-dataflow](https://github.com/TimelyDataflow/timely-dataflow): A modular implementation of timely dataflow in Rust
- [vectordotdev/vector](https://github.com/vectordotdev/vector): A high-performance observability data pipeline
- [pola-rs/polars](https://github.com/pola-rs/polars): Fast multi-threaded, hybrid-out-of-core DataFrame library in Rust | Python | Node.js
- [tokio-rs/tokio](https://github.com/tokio-rs/tokio): A runtime for asynchronous applications provides I/O, networking, scheduling, timers, ...
- [launchbadge/sqlx](https://github.com/launchbadge/sqlx): 🧰 The Rust SQL Toolkit. An async, pure Rust SQL crate featuring compile-time checked queries without a DSL. Supports PostgreSQL, MySQL, SQLite, and MSSQL.

I have discussed the future with my team, and I bet and considered the possibility of Rust becoming the new trend in Data Engineering. 
We could proud to have been one of the first teams to use Rust in building a Data Platform.
However, even though Rust might become the standard when the platform is stable, it may still be difficult to hire new Rust developers, especially in Vietnam.

We chose Rust for developing many of our applications due to its high level of security for concurrent processing, as well as its focus on correctness and performance. Rust's compiler is an excellent tool for identifying bugs, but ultimately, it is important to measure the running code and identify bottlenecks in order to solve them.

**References**

- [Will Rust Take over Data Engineering? 🦀](https://airbyte.com/blog/rust-for-data-engineering)
- [Rust is for Big Data (#rust2018) - Andy Grove](https://andygrove.io/2018/01/rust-is-for-big-data/)
- [Rust và Data Engineering? 🤔](https://blog.duyet.net/2021/11/rust-data-engineering.html)

# Where to start?

If you're considering diving into Rust for your own projects or migrating an existing codebase, I highly recommend starting with the [**Rust By Example**](https://doc.rust-lang.org/rust-by-example/) book. 

In addition, there are other valuable resources available to aid your learning and exploration of Rust. Here are a couple of links you may find helpful:

- [Rust 101](https://misfit.jira.com/wiki/spaces/CYC/pages/3104342445)
- [Learning Rust · Rust Programming Language Tutorials](https://learning-rust.github.io/)
- [Introduction - Rust By Example](https://doc.rust-lang.org/rust-by-example/)
- [The Rust Programming Language - The Rust Programming Language](https://doc.rust-lang.org/book/)
- [Introduction - Rust Design Patterns](https://rust-unofficial.github.io/patterns/intro.html)
- [What is rustdoc? - The rustdoc book](https://doc.rust-lang.org/rustdoc/what-is-rustdoc.html)
- [Introduction - The Rust Performance Book](https://nnethercote.github.io/perf-book/introduction.html)
- [GitHub - Dhghomon/easy_rust: Rust explained using easy English](https://github.com/Dhghomon/easy_rust)
- [Developing the Library’s Functionality with Test Driven Development - The Rust Programming Language](https://doc.rust-lang.org/book/ch12-04-testing-the-librarys-functionality.html)
- [Introduction - Rust Tiếng Việt](https://rust-tieng-viet.github.io/)
