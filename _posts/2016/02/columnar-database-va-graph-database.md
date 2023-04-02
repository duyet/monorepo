---
template: post
title: Bigdata -  Columnar Database và Graph Database
date: "2016-02-03"
author: Van-Duyet Le
tags:
- Database
- Graph
- BigData
- Graph Database
- Big Data
modified_time: '2016-02-03T16:34:19.787+07:00'
thumbnail: https://1.bp.blogspot.com/-NNyJ44vDSBs/VrHI1EhZvvI/AAAAAAAAPD0/C_-Fxe4gF_k/s1600/example-graph.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-607367745608184844
blogger_orig_url: https://blog.duyet.net/2016/02/columnar-database-va-graph-database.html
slug: /2016/02/columnar-database-va-graph-database.html
category: Data
description: Như đã nói về big data, chúng ta có các loại dữ liệu khác nhau và chúng ta cần lưu trữ trong database. Bigdata có thể xử lý và lưu trữ trên nhiều loại CSDL khác nhau. Sau đây tôi sẽ nói 1 ít về columnar Database và Graph Database.
fbCommentUrl: none
---

Như đã nói về big data, chúng ta có các loại dữ liệu khác nhau và chúng ta cần lưu trữ trong database. Bigdata có thể xử lý và lưu trữ trên nhiều loại CSDL khác nhau. Sau đây tôi sẽ nói 1 ít về columnar Database và Graph Database.

[![](https://1.bp.blogspot.com/-NNyJ44vDSBs/VrHI1EhZvvI/AAAAAAAAPD0/C_-Fxe4gF_k/s640/example-graph.jpg)](https://blog.duyet.net/2016/02/columnar-database-va-graph-database.html#.VrHJjOx97Qo)
Ảnh: W3.Org

## Columnar Databases ##
CSDL quan hệ là row store database hoặc row oriented database. Columnar databases là column oriented or column store database.
Khi sử dụng columnar database, ta có thể thêm data bằng cách thêm 1 cột mới vào columnar database. HBase là 1 trong các columnar database phổ biến nhất. Nó dùng hệ thống tập tin Hadoop (HDFS) và MapReduce cho hệ thống lưu trữ dữ liệu. Tuy nhiên, nhớ rằng đây không phải là sự lựa chọn tốt cho mọi ứng dụng. Columnar Databases có lợi cho các CSDL có khối lượng dữ liệu lớn (volume) được thu thập và xử lý.

## Graph Databases ##
Graph database được ưu tiên sư dụng với dữ liệu được liên kết chặt chẽ ở mức cao. CSDL này có cấu trúc quan hệ node. Các nodes và các relationships chứa 1 Key Value Pair nơi dữ liệu được lưu trữ.

Điều thuận lợi nhất của CSDL này là hỗ trợ điều hướng nhanh hơn giữa các các mối quan hệ (relationship).

Ví dụ, Facebook dùng CSDL graph để liệt kê và minh họa các mỗi quan hệ khác nhau giữa những người dùng. Neo4j là 1 trong các CSDL graph nguồn mở phổ biến nhất. Một trong các điểm bất lợi của CSDL Graph là nó không thể tự tham chiếu (self joins trong RDBMS).
