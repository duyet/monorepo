---
template: post
title: Graph Database
date: "2016-02-03"
author: Van-Duyet Le
tags:
- Database
- Neo4j
- BigData
- Graph Database
- Big Data
modified_time: '2016-02-03T17:14:05.023+07:00'
thumbnail: https://2.bp.blogspot.com/-Wq61rnHCVQk/VrHL_XD9alI/AAAAAAAAPEE/8DjlqxdZ5dE/s1600/Wikipedia_multilingual_network_graph_July_2013.svg.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7510024669515769815
blogger_orig_url: https://blog.duyet.net/2016/02/graph-database.html
slug: /2016/02/graph-database.html
category: Data
description: Bài trước tôi có nói về Columnar Database và Graph Database. Mục đích là so sánh và đi sâu vào Graph Database. Tiếp đến là xử lý Graph Database với Big Data.
fbCommentUrl: none
---

[Bài trước](https://blog.duyet.net/2016/02/columnar-database-va-graph-database.html) tôi có nói về Columnar Database và Graph Database. Mục đích là so sánh và đi sâu vào Graph Database. Tiếp đến là xử lý Graph Database với Big Data.

![](https://2.bp.blogspot.com/-Wq61rnHCVQk/VrHL_XD9alI/AAAAAAAAPEE/8DjlqxdZ5dE/s400/Wikipedia_multilingual_network_graph_July_2013.svg.png)

## Graph (đồ thị)  ##
Đồ thị là một tập các đối tượng gọi là đỉnh nối với nhau bởi các cạnh. Thông thường, đồ thị được vẽ dưới dạng một tập các điểm (đỉnh, nút) nối với nhau bởi các đoạn thẳng (cạnh). Tùy theo ứng dụng mà một số cạnh có thể có hướng. ([Wikipedia](https://vi.wikipedia.org/wiki/%C4%90%E1%BB%93_th%E1%BB%8B_(l%C3%BD_thuy%E1%BA%BFt_%C4%91%E1%BB%93_th%E1%BB%8B))).

## Graph Database ##
Graph Database mô tả và lưu trữ dữ liệu dưới dạng đồ thị, một cách trực quan và dễ dàng truy vấn.
Dĩ nhiên Graph Database cũng sẽ có những ưu, khuyết điểm, những trường hợp nên và không nên sử dụng.

## Khi nào sử dụng Graph Database ##

Quay lại CSDL quan hệ, chúng ta đã quá quen với cách biểu diễn theo từng quan hệ truyền thống, nhưng với những bài toán cần nhiều quan hệ việc sử dụng Relation Database để lưu trữ không phải là một giải pháp hay vì :

- Việc biểu diễn quan hệ dưới dạng bảng không phải là một cách làm trực quan.
- Các phép kết bảng thường tốn rất nhiều chi phí, nhất là với lượng dữ liệu phức tạp, lớn hoặc cực lớn.

Graph Database liên kết trực tiếp giữa các thực thể (các đỉnh). Do đó Graph giúp trả lời rất nhiều câu hỏi liên quan đến truy vấn dữ liệu một cách hiệu quả hơn so với Relation Database, đồng thời khả năng trực quan hoá dữ liệu của Graph so với Relation Database cũng tốt hơn rất nhiều.

![](https://4.bp.blogspot.com/-fjwcIPd8oCM/VrHNkZLzGMI/AAAAAAAAPEQ/Fu4htLwQhN0/s400/friend-rd.png)

Giả sử ta có một cơ sở dữ liệu quan hệ lưu trữ thông tin người dùng và các bạn bè của họ. Rất phức tạp và tốn nhiều chi phí nếu muốn trả lời các câu hỏi sau:

- Ai là bạn của bạn Alice.
- Ai là bạn chung của Alice và Bob.
- Giả sử Alice không quen Bob, vậy họ phải thông qua những ai để có thể làm quen với nhau một cách nhanh nhất.

Tuy nhiên Graph Database trả lời câu hỏi trên một cách rất trực tiếp và đơn giản!

## Neo4j ##

Neo4j là một trong những Graph Database phổ biển nhất hiện nay.

![](https://3.bp.blogspot.com/-0eUtOmtDumg/VrHSmZ1ejwI/AAAAAAAAPEg/ZZZ0x6kuGTE/s400/neo4j-logo-2015.png)

Quy ước:

- Đỉnh trong Neo4j

- được ký hiệu là (A)
- có thể có nhiều thuộc tính dưới dạng key:value
- có thể có một hoặc nhiều nhãn (B: Person) : B có nhãn là Person

- Cạnh trong Neo4j

- được ký hiệu là -[rel]-
- có thể có nhiều thuộc tính dưới dạng key:value
- có duy nhất một kiểu của cạnh : (a)-[rel:KNOW]-(b) mô tả a và b được liên kết với nhau bởi cạnh rel có kiểu là KNOW
- có thể có hướng : (a)-[rel:KNOW]->(b)

### Cài đặt Neo4j ###

Download Neo4j bản mới nhất tại trang chủ: [http://www.neo4j.org](http://www.neo4j.org/)

Khởi chạy Neo4j bằng lệnh bin/neo4j start

Truy cập: http://localhost:7474 để sử dụng và truy vấn.

## Neo4j trong môi trường Big Data ##

Lưu trữ graph bằng Neo4j thì toàn bộ graph phải nằm trên một máy duy nhất. Đây là nhược điểm rất lớn của Neo4j, điều này khiến việc lưu trữ một big graph bao gồm rất nhiều đỉnh và cạnh bằng Neo4j là rất khó khăn.

Tuy nhiên vào năm 2010 Google có publish một bài báo về [Pregel](http://kowshik.github.io/JPregel/pregel_paper.pdf) một mô hình hiệu quả cho việc xử lý big graph. Sau đó hai năm, apache đưa ra thư viện mã nguồn mở mới cài đặt mô hình Pregel là [Apache Giraph](https://giraph.apache.org/) trên hệ sinh thái Hadoop.

Đây chính là giải pháp cho việc lưu trữ và xử lý cho các bài toán liên quan đến big graph.

Giraph tôi sẽ trình bày trong những bài sau.
