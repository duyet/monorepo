---
title: Bigdata - Columnar Database và Graph Database
date: '2016-02-03'
author: Duyet
tags:
  - Database
  - Graph Database
  - Big Data
modified_time: '2016-02-03T16:34:19.787+07:00'
thumbnail: https://1.bp.blogspot.com/-NNyJ44vDSBs/VrHI1EhZvvI/AAAAAAAAPD0/C_-Fxe4gF_k/s1600/example-graph.jpg
slug: /2016/02/columnar-database-va-graph-database.html
category: Data
description: Như đã nói về big data, chúng ta có các loại dữ liệu khác nhau và chúng ta cần lưu trữ trong database. Bigdata có thể xử lý và lưu trữ trên nhiều loại CSDL khác nhau. Sau đây tôi sẽ nói 1 ít về columnar Database và Graph Database.
---

> **Note:** This post was published in 2016. While the database concepts remain timeless and relevant in 2025, for current implementations see modern solutions like DuckDB, Apache Arrow (columnar), and Neo4j (graph databases).

Như đã nói về big data, chúng ta có các loại dữ liệu khác nhau và chúng ta cần lưu trữ trong database. Bigdata có thể xử lý và lưu trữ trên nhiều loại CSDL khác nhau. Sau đây tôi sẽ nói 1 ít về columnar Database và Graph Database.

![Example Graph Database](https://1.bp.blogspot.com/-NNyJ44vDSBs/VrHI1EhZvvI/AAAAAAAAPD0/C_-Fxe4gF_k/s640/example-graph.jpg)

**Source:** W3.org Graph Database Concepts

## Columnar Databases

CSDL quan hệ là row store database hoặc row oriented database. Columnar databases là column oriented or column store database.
Khi sử dụng columnar database, ta có thể thêm data bằng cách thêm 1 cột mới vào columnar database. HBase là 1 trong các columnar database phổ biến nhất. Nó dùng hệ thống tập tin Hadoop (HDFS) và MapReduce cho hệ thống lưu trữ dữ liệu. Tuy nhiên, nhớ rằng đây không phải là sự lựa chọn tốt cho mọi ứng dụng. Columnar Databases có lợi cho các CSDL có khối lượng dữ liệu lớn (volume) được thu thập và xử lý.

## Graph Databases

Graph database được ưu tiên sư dụng với dữ liệu được liên kết chặt chẽ ở mức cao. CSDL này có cấu trúc quan hệ node. Các nodes và các relationships chứa 1 Key Value Pair nơi dữ liệu được lưu trữ.

Điều thuận lợi nhất của CSDL này là hỗ trợ điều hướng nhanh hơn giữa các các mối quan hệ (relationship).

Ví dụ, Facebook dùng CSDL graph để liệt kê và minh họa các mỗi quan hệ khác nhau giữa những người dùng. Neo4j là 1 trong các CSDL graph nguồn mở phổ biến nhất. Một trong các điểm bất lợi của CSDL Graph là nó không thể tự tham chiếu (self joins trong RDBMS).
