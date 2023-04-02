---
template: post
title: Postgres Full Text Search
date: "2021-07-04"
author: Van-Duyet Le
category: Data
tags:
 - Data
 - Data Engineer
 - Database
 - Postgres
thumbnail: https://1.bp.blogspot.com/-myVyO9v0lXQ/YOHlrpMnfFI/AAAAAAACIJ8/YfkgH_rMiRMqxhoI0rNTOeC61w8XGaLCACLcBGAsYHQ/s0/pg-full-text-duyet.png
slug: /2021/07/postgres-full-text-search.html
draft: false
description: Postgres has built-in functions to handle Full Text Search queries. This is like a "search engine" within Postgres.
fbCommentUrl: none
---

Postgres has built-in functions to handle Full Text Search queries. This is like a "search engine" within Postgres.

# to_tsvector()

Converts your data into searchable "tokens". `to_tsvector()` stands for "to text search vector". For example:

```sql
select to_tsvector("the green eggs and ham")
-- Returns 'egg':2 'green':1 'ham':4


select to_tsvector("the green egg and ham")
-- Returns 'egg':2 'green':1 'ham':4
```

Collectively these tokens are called a _document_ which Postgres can use for comparisons,
where every token is a lexeme (unit of lexical meaning). The stopwords (_and_, _or_, _the_, ...)
are conveniently omitted. As you can see, the `eggs` will be normalized as a lexeme in English: `egg`.

# to_tsquery()

`to_tsquery()`, which accepts a list of words that will be checked against
the normalized vector we created with `to_tsvector()`.

The `@@` operator to check if `tsquery` matches `tsvector`, it's returns true (`t`) if matched,
otherwise returns false (`f`).

Let's see some queries below:

```sql
select to_tsvector("the green eggs and ham") @@ to_tsquery("egg")
```

```
?column?
--------
t
```


```sql
select to_tsvector("the green eggs and ham") @@ to_tsquery("eggs")
```

```
?column?
--------
t
```

Use `&` for **AND** in the search query:

```sql
select to_tsvector("the green eggs and ham") @@ to_tsquery("eggs & red")
```

```
?column?
--------
f
```

Use `|` for **OR** in the search query:


```sql
select to_tsvector("the green eggs and ham") @@ to_tsquery("eggs | red")
```

```
?column?
--------
t
```

Use the proximity symbol `<->` for searching for terms that are a certain "distance" apart.
For example, search the phase `green egg`, `green` is followed immediately by a match for `egg`.

```sql
select to_tsvector("the green eggs and ham") @@ to_tsquery("green <-> egg")
```

```
?column?
--------
t
```

For example, search for the phase `egg [1 word] ham`, find `egg` and `ham` within 2 words of each other:

```sql
select to_tsvector("the green eggs and ham") @@ to_tsquery("egg <1> ham")
```

```
?column?
--------
t
```

Use the negation symbol `!` to find phrases which **don't** contain a search term.
For example, search for the phase that have `egg` but not `ham`:


```sql
select to_tsvector("the green eggs and ham") @@ to_tsquery("egg & !ham")
```

```
?column?
--------
f
```

# References

- https://supabase.io/docs/guides/database/full-text-search
- https://www.compose.com/articles/mastering-postgresql-tools-full-text-search-and-phrase-search/
- https://www.postgresql.org/docs/9.5/textsearch.html
