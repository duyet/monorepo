---
template: post
title: Good reasons to use ClickHouse 
date: "2021-08-29"
author: Van-Duyet Le
category: Data
tags:
 - Data
 - Data Engineer
 - Database
 - ClickHouse
thumbnail: https://1.bp.blogspot.com/-1a6QwQg9VgM/YStWOIv7gZI/AAAAAAACNVE/My9HF_PJ37c9-eVAmzJprUMUivZVwpOCwCLcBGAsYHQ/s0/clickhouse-good-reasons-to-use-0.gif
slug: /2021/08/good-reasons-to-use-clickhouse.html
draft: false
description: >
  More than 200+ companies are using ClickHouse today. 
  With many features support, it's equally powerful for both Analytics and Big Data service backend.
fbCommentUrl: none
---

More than 200+ companies are using ClickHouse today. 
With many features support, it's equally powerful for both Analytics and Big Data service backend.

![](/media/2021/08/clickhouse-good-reasons-to-use-0.gif)

# What is ClickHouse?


According the website, ClickHouse is an open-source column-oriented DBMS for online analytical processing.
ClickHouse was developed by Yandex for their Yandex.Metrica web analytics service.

For short, ClickHouse DBMS is:
- Column Store
- MPP
- Realtime
- SQL
- Open Source

![ClickHouse homepage](/media/2021/08/clickhouse-homepage.png)

# What makes ClickHouse different

ClickHouse is a column-store database, optimized for fast queries. It's fast because:
- Using column-oriented storage: avoid reading unnecessary columns (reduced disk IO, compression for each column, etc). Most of the queries for analytics only use some of columns for the queries.
- Spares indexes: keeps data structures in memory, not only used columns but only necessary row ranges of those columns
- Data compression. Storing different values of the same column together often leads to better compression ratios ([specialized codecs](https://clickhouse.tech/docs/en/sql-reference/statements/create/table/#create-query-specialized-codecs)).
- Algorithmic optimizations: MergeTree, locality of data on disk, etc.
- Low-level optimizations: What really makes ClickHouse stand out is attention to low-level details. e.g. vectorized query execution
- Specialization and attention to detail: for example, they have [30+ different algorithms](https://github.com/ClickHouse/ClickHouse/blob/master/src/Interpreters/Aggregator.h) for `GROUP BY`. Best one is selected for your query.


> ClickHouse works 100-1000x faster than traditional approaches


# Good reasons to use ClickHouse

## 1. Fast and Scalability

ClickHouse is blazing fast, linearly scalable, hardware efficient, highly reliable, and fun to operate in production.
There were many performance benchmarks and real-life use cases.

Performance comparison of analytical DBMS: 
- https://clickhouse.tech/benchmark/dbms
- https://altinity.com/benchmarks

![](/media/2021/08/clickhouse-good-reasons-to-use-1.png)

Thanks to vectorized execution and parallel processing, it's also used for all CPU cores in a single machine.
Able to scales horizontally and linearly scaling as well.

## 2. Integration

Connect to any other JDBC database and uses their tables as ClickHouse table. 

```sql
SELECT * 
FROM jdbc('mysql://localhost:3306/?user=root', 'schema', 'table');
```
Even it can connect to another ClickHouse cluster or a RESTful service.

```sql
# duyet_cluster_1
SELECT * FROM remote('duyet_cluster_2', 'db_name', 'table_name', 'user', 'passwd');

SELECT * FROM url('https://api.duyet.net/x/weather', CSV, 'col1 String col2 UInit32');
```

![](/media/2021/08/clickhouse-good-reasons-to-use-2.png)

Refer to the Table Engines for Integrations document here: https://clickhouse.tech/docs/en/engines/table-engines/integrations/


## 3. Partitioning

Each partition is stored separately in order to simplify manipulations of this data. 

```sql
CREATE TABLE logs (
  date_index Date,
  user_id String,
  log_level String,
  log_message String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date_index)  <--
ORDER BY user_id;
```

```sql
PARTITION BY (toMonday(date_index), log_level)
```

Each partition can be detached, attached or dropped instantly.

```sql
ALTER TABLE logs DETACH PARTITION 202101;
ALTER TABLE logs ATTACH PARTITION 202101;
ALTER TABLE logs DROP PARTITION 202101;
```

### 4. TTL

This is my favouris feature of ClickHouse. You can use TTL to automatically delete rows based on a conditions.

```sql
CREATE TABLE logs (
  date_index Date,
  user_id String,
  log_level String,
  log_message String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date_index) 
ORDER BY date_index
TTL date_index + INTERVAL 6 MONTH; -- deletes data after 6 months
```

The TTL clause can be set for the whole table and for each individual column.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Type of TTL rule may follow each TTL expression. It affects an action which is to be done once the expression is satisfied (reaches current time):

- `DELETE` - delete expired rows (default action);
- `RECOMPRESS` codec_name - recompress data part with the codec_name;
- `TO DISK 'aaa'` - move part to the disk aaa;
- `TO VOLUME 'bbb'` - move part to the disk bbb;
- `GROUP BY` - aggregate expired rows.

Some cases that you can do with TTL:
 - Moving old data to S3 after 6 months.
 - Using better compression for old data after 6 months.
 - Using better compression and move old data to HDD disk after 6 months.
 - etc

### 4. Materialized Views

[Materialized Views](https://clickhouse.tech/docs/en/sql-reference/statements/create/view/#materialized) can automatically aggregates data on inserts.
A materialized view is implemented as follows: when inserting data to the table specified in `SELECT`, 
part of the inserted data is converted by this `SELECT` query, and the result is inserted in the view.

### 5. REST Capabilities

The HTTP interface on the port 8123 by default lets you use ClickHouse on any platform from any programming language.

```bash
$ curl 'http://localhost:8123/'
Ok.
```

Web UI can be accessed here: http://localhost:8123/play.


![](/media/2021/08/clickhouse-good-reasons-to-use-3.png)

Refer to the [HTTP Interface document](https://clickhouse.tech/docs/en/interfaces/http/) for more example about using HTTP via curl.

![Query ClickHouse via curl POST](/media/2021/08/clickhouse-good-reasons-to-use-4.png)
![`JSONEachRow` output format](/media/2021/08/clickhouse-good-reasons-to-use-5.png)

The HTTP interface is more limited than the native interface, but it has better compatibility. 
You can quickly build an UI dashboard for data visualization or expose an API for other teams.

### 6. Better SQL

- `FORMAT` Clauses: ClickHouse can accept and return data in various formats.

```sql
SELECT EventDate, count() AS c 
FROM test.hits 
GROUP BY EventDate WITH TOTALS 
ORDER BY EventDate 
FORMAT TabSeparated
```

```
2014-03-17      1406958
2014-03-18      1383658
2014-03-19      1405797
2014-03-20      1353623
2014-03-21      1245779
2014-03-22      1031592
2014-03-23      1046491

1970-01-01      8873898

2014-03-17      1031592
2014-03-23      1406958
```

See the supported formats here: https://clickhouse.tech/docs/en/interfaces/formats/

![](/media/2021/08/clickhouse-good-reasons-to-use-6.png)


- [Great Functions](https://clickhouse.tech/docs/en/sql-reference/functions/): `topK`, `uniq`, `arrayJoin`, `countIf`, `sumIf`, ...
- [Lambda Function](https://clickhouse.tech/docs/en/sql-reference/functions/#higher-order-functions)

  ```sql
  SELECT arrayMap(x -> (x * 2), [1, 2, 3]);
  -- [2, 3, 6]

  SELECT arrayFilter(x -> x LIKE '%net%', ['google.com', 'duyet.net']);
  -- ['duyet.net']
  ```

- Resolving expression names

![](/media/2021/08/clickhouse-good-reasons-to-use-7.png)

# References

- https://clickhouse.tech/docs/en/faq/general/columnar-database/
- https://clickhouse.tech/docs/en/interfaces/http/ 
- https://clickhouse.tech/docs/en/interfaces/formats/
