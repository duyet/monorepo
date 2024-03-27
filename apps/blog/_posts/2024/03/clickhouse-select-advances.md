---
title: ClickHouse SELECT Advances
date: '2024-03-26'
author: Duyet
category: Data
tags:
  - Data
  - ClickHouse
  - ClickHouse on Kubernetes
slug: /2024/03/clickhouse-select-advances.html
thumbnail: /media/2024/03/clickhouse-select-advances/query.png
description: Dynamic column selection (also known as a `COLUMNS` expression) allows you to match some columns in a result with a re2 regular expression.
---

Dynamic column selection (also known as a `COLUMNS` expression) allows you to match some columns in a result with a [re2](<https://en.wikipedia.org/wiki/RE2_(software)>) regular expression.

# Matchers

Select all columns:

```sql
SELECT * FROM hits;
```

Select only specific subset of columns:

```sql
SELECT COLUMNS('URL.*ID') FROM hits;

┌─URLCategoryID─┬─URLRegionID─┐
│         15664 │         216 │
│             0 │           0 │
│             0 │           0 │
│             0 │           0 │
│             0 │           0 │
└───────────────┴─────────────┘
```

```sql
SELECT COLUMNS(WatchID, UserID) FROM hits;

┌─────────────WatchID─┬───────────────UserID─┐
│ 5365534025466744368 │ 2213399965098237040  │
│ 5287559196528052048 │ 2213399965098237040  │
│ 9057961221679572813 │ 2213399965098237040  │
│ 5520508008786474572 │ 9141107111321352513  │
```

# Column transformers

Apply transformations for selected columns or remove some columns from selections:

**APPLY**: Allows you to invoke some function for each row returned by an outer table expression of a query.

```sql
SELECT * APPLY toString FROM hits;
SELECT COLUMNS('URL.*ID') APPLY toString FROM hits;
SELECT COLUMNS('URL.*ID') APPLY x -> toString(x) FROM hits;

┌─toString(URLCategoryID)─┬─toString(URLRegionID)─┐
│ 15664                   │ 216                   │
│ 0                       │ 0                     │
│ 0                       │ 0                     │
│ 0                       │ 0                     │
│ 0                       │ 0                     │
└─────────────────────────┴───────────────────────┘
```

**EXCEPT**: exclude one or more columns from the result.

```sql
SELECT * EXCEPT (UserID, URLRegionID) FROM hits;
SELECT COLUMNS('URL.*ID') EXCEPT URLCategoryID FROM hits;

┌─URLRegionID─┐
│         216 │
│           0 │
│           0 │
│           0 │
│           0 │
└─────────────┘
```

**REPLACE**: Specifies one or more [expression aliases](https://clickhouse.com/docs/en/sql-reference/syntax#syntax-expression_aliases)

```sql
SELECT COLUMNS('URL.*ID') REPLACE (URLCategoryID * 10 AS URLCategoryID)
FROM hits;

┌─URLCategoryID─┬─URLRegionID─┐
│        156640 │         216 │
│             0 │           0 │
│             0 │           0 │
│             0 │           0 │
│             0 │           0 │
└───────────────┴─────────────┘

SELECT COLUMNS('URL.*ID') REPLACE (leftPad(toString(URLRegionID), 10, '*') AS URLRegionID)
FROM hits;

┌─URLCategoryID─┬─URLRegionID─┐
│         15664 │ *******216  │
│             0 │ *********0  │
│             0 │ *********0  │
│             0 │ *********0  │
│             0 │ *********0  │
└───────────────┴─────────────┘
```

We can also combine them:

```sql
SELECT COLUMNS('URL.*ID') APPLY(toString) APPLY(length) APPLY(max) FROM hits;

┌─max(length(toString(URLCategoryID)))─┬─max(length(toString(URLRegionID)))─┐
│                                    5 │                                  5 │
└──────────────────────────────────────┴────────────────────────────────────┘
```

# Select from multiple tables

[`merge()`](https://clickhouse.com/docs/en/sql-reference/table-functions/merge) create a temporary [Merge](https://clickhouse.com/docs/en/engines/table-engines/special/merge) table with structure is taken from the first table encountered that matches the regular expression.

When upgrading ClickHouse usually rename system table if schema changed in a new release: `system.query_log`, `system.query_log_0`, `system.query_log_1`, ... The query below help querying from all them:

```sql
SELECT * FROM merge(system, '^query_log')
```

---

# ClickHouse Series

 - [ClickHouse on Kubernetes](https://blog.duyet.net/2024/03/clickhouse-on-kubernetes.html)
 - [ClickHouse SELECT Advances](https://blog.duyet.net/2024/03/clickhouse-select-advances.html)
 - [Monitoring ClickHouse on Kubernetes](https://blog.duyet.net/2024/03/monitoring-clickhouse.html)
