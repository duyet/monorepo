---
template: post
title: 'Data Engineering Tools written in Rust'
date: '2023-01-22'
author: Van-Duyet Le
category: Data
tags:
- Data
- Data Engineer
- Rust
slug: /2023/01/data-engineering-rust-tools.html
draft: false
fbCommentUrl: none
thumbnail: https://i.imgur.com/qjUwEpo.png
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2023%2F01%2Fdata-engineering-rust-tools.html
description: This blog post will provide an overview of the data engineering tools available in Rust, their advantages and benefits, as well as a discussion on why Rust is a great choice for data engineering. 

---

Python is a popular language for data engineers, but it is not the most robust or secure. Data engineering is an essential part of modern software development, and Rust is an increasingly popular programming language for this task. Rust is an efficient language, providing fast computation and low-latency responses with a high level of safety and security. Additionally, it offers a unique set of features and capabilities that make it an ideal [choice for data engineering](https://blog.duyet.net/2021/11/rust-data-engineering.html) ?!.

Rust also now offers more and more of libraries and frameworks for data engineering. These libraries provide a variety of features and tools, such as data analysis, data visualization, and machine learning, which can make data engineering easier and more efficient.

This blog post will provide an overview of the data engineering tools available in Rust, their advantages and benefits, as well as a discussion on why Rust is a great choice for data engineering.

<div class="toc">
  <p>Table of Contents</p>
  <ul>
    <li><a href="#datafusion">DataFusion</a></li>
    <li><a href="#polars">Polars</a></li>
    <li><a href="#delta-lake-rust">Delta Lake Rust</a></li>
    <li><a href="#vectordev">Vector.dev</a></li>
    <li><a href="#roapi">ROAPI</a></li>
    <li><a href="#cube">Cube</a></li>
    <li><a href="#databend">Databend</a></li>
    <li><a href="#surrealdb">SurrealDB</a></li>
    <li><a href="#greptimedb">GreptimeDB</a></li>
  </ul>
</div>


# DataFusion

![DataFusion](/media/2023/01/data-engineering-rust-tools/datafusion.png)

[DataFusion](https://github.com/apache/arrow-datafusion), based on [Apache Arrow](https://arrow.apache.org/), is an SQL query engine that provides the same functionality as [Apache Spark](https://spark.apache.org/) and other similar query engines. It provides an efficient way to process data quickly and accurately, by leveraging the power of Arrow as its backbone. DataFusion offers a range of features that enable developers to build advanced applications that can query millions of records at once, as well as to quickly and easily process complex data. In addition, DataFusion provides support for a wide variety of data sources, allowing developers to access the data they need from anywhere.

**Highlight features:**

- Feature-rich [SQL support](https://arrow.apache.org/datafusion/user-guide/sql/index.html) & [DataFrame API](https://arrow.apache.org/datafusion/user-guide/dataframe.html).
- Blazingly fast, vectorized, multi-threaded, streaming exec engine.
- Native support for Parquet, CSV, JSON & Avro.
- Extension points: user-defined functions, custom plan & exec nodes. Streaming, async. IO from object stores.

```rust
use datafusion::prelude::*;

#[tokio::main]
async fn main() -> datafusion::error::Result<()> {
	// create the dataframe
	let ctx = SessionContext::new();
	let df = ctx.read_csv("tests/example.csv", CsvReadOptions::new()).await?;
	
	let df = df.filter(col("a").lt_eq(col("b")))?
	  .aggregate(vec![col("a")], vec![min(col("b"))])?
	  .limit(0, Some(100))?;
	
	// execute and print results
	df.show().await?;
	Ok(())
}
```

```
+---+--------+
| a | MIN(b) |
+---+--------+
| 1 | 2      |
+---+--------+
```

# Polars

![Polars](/media/2023/01/data-engineering-rust-tools/polars.png)

[Polars](https://github.com/pola-rs/polars) is a blazingly fast DataFrames library implemented in Rust which takes advantage of the [Apache Arrow Columnar Format](https://arrow.apache.org/docs/format/Columnar.html) for memory management. It's a faster [Pandas](https://pandas.pydata.org/). You can see at the [h2oai's db-benchmark](https://h2oai.github.io/db-benchmark/).

This format allows for high-performance data processing, allowing Polars to process data at an impressive speed. With the combination of Rust's performance capabilities and the Apache Arrow Columnar Format, Polars is an ideal choice for data scientists looking for an efficient and powerful DataFrames library.

```rust
use polars::prelude::*;

let df = LazyCsvReader::new("reddit.csv")
	.has_header(true)
	.with_delimiter(b',')
	.finish()?
	.groupby([col("comment_karma")])
	.agg([
		col("name").n_unique().alias("unique_names"), 
		col("link_karma").max()
	])
	.fetch(100)?;
```

**Highlight features:**

- Lazy | eager execution
- Multi-threaded
- SIMD
- Query optimization
- Powerful expression API
- Hybrid Streaming (larger than RAM datasets)
- Rust | Python | NodeJS | ...

# Delta Lake Rust

![Delta Lake Rust](/media/2023/01/data-engineering-rust-tools/delta-lake.png)

[Delta Lake](https://github.com/delta-io/delta-rs) provides a native interface in Rust that gives low-level access to Delta tables. This interface can be used with data processing frameworks such as [datafusion](https://github.com/apache/arrow-datafusion), [ballista](https://github.com/apache/arrow-datafusion/tree/master/ballista), [polars](https://github.com/pola-rs/polars), [vega](https://github.com/rajasekarv/vega), etc. Additionally, bindings to higher-level languages like Python and Ruby are also available.

# Vector.dev

![Vector](/media/2023/01/data-engineering-rust-tools/vector.png)

A high-performance observability data pipeline for pulling system data (logs, metadata).

[Vector](https://github.com/vectordotdev/vector) is an end-to-end observability data pipeline that puts you in control. It offers high-performance collection, transformation, and routing of your logs, metrics, and traces to any vendor you choose. Vector helps reduce costs, enrich data, and ensure data security. It is up to 10 times faster than other solutions and is open source.

Vector can be deployed as many topologies to collect and forward data: Distributed, Centralized or Stream based.

![Vector](/media/2023/01/data-engineering-rust-tools/vector-2.png)

To get started, follow our [quickstart guide](https://vector.dev/docs/setup/quickstart/) or [install Vector](https://vector.dev/docs/setup/installation/).

Create a configuration file called `vector.toml` with the following information to help Vector understand how to collect, transform, and sink data.

```toml
[sources.generate_syslog]
type = "demo_logs"
format = "syslog"
count = 100

[transforms.remap_syslog]
inputs = [ "generate_syslog"]
type = "remap"
source = '''
  structured = parse_syslog!(.message)
  . = merge(., structured)
'''

[sinks.emit_syslog]
inputs = ["remap_syslog"]
type = "console"
encoding.codec = "json"
```

# **ROAPI**

[ROAPI](https://github.com/roapi/roapi) automatically spins up read-only APIs for static datasets without requiring you to write a single line of code. It builds on top of [Apache Arrow](https://github.com/apache/arrow) and [Datafusion](https://github.com/apache/arrow-datafusion). The core of its design can be boiled down to the following:

- [Query frontends](https://roapi.github.io/docs/api/query/index.html) to translate SQL, GraphQL and REST API queries into Datafusion plans.
- Datafusion for query plan execution.
- [Data layer](https://roapi.github.io/docs/config/dataset-formats/index.html) to load datasets from a variety of sources and formats with automatic schema inference.
- [Response encoding layer](https://roapi.github.io/docs/api/response.html) to serialize intermediate Arrow record batch into various formats requested by client.

![ROAPI](/media/2023/01/data-engineering-rust-tools/roapi.png)

For example, to spin up APIs for `test_data/uk_cities_with_headers.csv` and `test_data/spacex_launches.json`:

```bash
roapi \
  --table "uk_cities=test_data/uk_cities_with_headers.csv" \
  --table "test_data/spacex_launches.json"
```

After that, we can query tables using SQL, GraphQL or REST:

```bash
curl -X POST -d "SELECT city, lat, lng FROM uk_cities LIMIT 2" localhost:8080/api/sql
curl -X POST -d "query { uk_cities(limit: 2) {city, lat, lng} }" localhost:8080/api/graphql
curl "localhost:8080/api/tables/uk_cities?columns=city,lat,lng&limit=2"
```

# Cube

**[Cube](https://github.com/cube-js/cube.js) is a headless business intelligence platform.** It enables data engineers and application developers to access data from modern data stores, organize it into consistent definitions, and deliver it to any application.

![Cube](/media/2023/01/data-engineering-rust-tools/cube.png)

Cube is designed to work with all SQL-enabled data sources, such as cloud data warehouses like Snowflake or Google BigQuery, query engines like Presto or Amazon Athena, and application databases like Postgres. It has a built-in relational caching engine that provides sub-second latency and high concurrency for API requests.

# Databend

[Databend](https://github.com/datafuselabs/databend) ([https://databend.rs](https://databend.rs/)) is an open-source, Elastic and Workload-Aware modern cloud data warehouse that focuses on low cost and low complexity for your massive-scale analytics needs.

Databend uses the latest techniques in vectorized query processing to allow you to do blazing-fast data analytics on object storage: ([S3](https://aws.amazon.com/s3/), [Azure Blob](https://azure.microsoft.com/en-us/services/storage/blobs/), [Google Cloud Storage](https://cloud.google.com/storage/), [Alibaba Cloud OSS](https://www.alibabacloud.com/product/object-storage-service), [Tencent Cloud COS](https://www.tencentcloud.com/products/cos), [Huawei Cloud OBS](https://www.huaweicloud.com/intl/en-us/product/obs.html), [Cloudflare R2](https://www.cloudflare.com/products/r2/), [Wasabi](https://wasabi.com/) or [MinIO](https://min.io/)).

Here is the architecture of [Databend](https://github.com/datafuselabs/databend)

![Databend](/media/2023/01/data-engineering-rust-tools/databend.png)

# SurrealDB

[SurrealDB](https://github.com/surrealdb/surrealdb) is a cloud native database for web, mobile, serverless, Jamstack, backend, and traditional apps. It simplifies your database & API stack, removing server-side components and allowing you to build secure, performant apps faster & cheaper. Features include SQL querying, GraphQL, ACID transactions, WebSocket connections, structured/unstructured data, graph querying, full-text indexing, geospatial querying & row-by-row permissions access. Can run as single server or distributed mode.

![Databend](/media/2023/01/data-engineering-rust-tools/surrealdb.png)

View the [features](https://surrealdb.com/features), the latest [releases](https://surrealdb.com/releases), the product [roadmap](https://surrealdb.com/roadmap), and [documentation](https://surrealdb.com/docs).

# GreptimeDB

![GreptimeDB](/media/2023/01/data-engineering-rust-tools/greptimedb.png)

[GreptimeDB](https://github.com/GreptimeTeam/greptimedb) is an open-source, next-generation hybrid timeseries/analytics processing database in the cloud. It is designed to provide scalability, analytics, and efficiency in modern cloud infrastructure, offering users the advantages of elasticity and cost-effective storage.

# Conclusion

There are many more options such as [Meilisearch](https://github.com/meilisearch/meilisearch), [Tantivy](https://github.com/quickwit-oss/tantivy), [PRQL](https://github.com/prql/prql), [Dozer](https://github.com/getdozer/dozer), [Neon](https://github.com/neondatabase/neon), etc. These may be relatively new, but you should give them a try.

At first glance, Rust may seem like an over-engineered choice for data engineering. However, its unique features and capabilities may make it the ideal choice for some data engineering tasks. Rust offers fast computation, low-latency responses, and a high level of safety and security. Additionally, it offers libraries and frameworks for data analysis, data visualization, and machine learning, making data engineering easier and more efficient. With its increasing popularity, Rust is becoming an increasingly attractive option for data engineers.
