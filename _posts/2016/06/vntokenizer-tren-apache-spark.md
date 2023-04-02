---
template: post
title: Chạy vnTokenizer trên môi trường Apache Spark
date: "2016-06-23"
author: Van-Duyet Le
tags:
- Apache Spark
- vnTokenizer
- Big Data
- Machine Learning
- Gán nhãn
- Tách từ
modified_time: '2018-09-10T17:20:36.889+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2035564334011840928
blogger_orig_url: https://blog.duyet.net/2016/06/vntokenizer-tren-apache-spark.html
slug: /2016/06/vntokenizer-tren-apache-spark.html
category: Machine Learning
description: vnTokenizer là công cụ chuyên dùng tách từ, gán nhãn từ loại cho tiếng Việt, của tác giả Lê Hồng Phương. vnTokenizer được viết bằng Java, có thể sử dụng như Tools Command Line hoặc Programming.
fbCommentUrl: http://blog.duyetdev.com/2016/06/vntokenizer-tren-apache-spark.html
---

[vnTokenizer](http://mim.hus.vnu.edu.vn/phuonglh/softwares/vnTokenizer) là công cụ chuyên dùng tách từ, gán nhãn từ loại cho tiếng Việt, của tác giả [Lê Hồng Phương](http://mim.hus.vnu.edu.vn/phuonglh/). vnTokenizer được viết bằng Java, có thể sử dụng như Tools Command Line hoặc Programming.

Nay vnTokenizer vừa ra mắt phiên bản 5.0 (tên là Vitk) hỗ trợ chạy trên Apache Spark, cho những ai xử lý Big Data hoặc cần xử lý một lượng lớn input.

## Chuẩn bị  ##
Yêu cần Ubuntu, cài đặt sẵn

- Java Development Kit ([JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)), version 7.0 hoặc mới hơn. 
- [Apache Maven](http://maven.apache.org/) version 3.0 hoặc mới hơn.

Download [Apache Spark](https://spark.apache.org/) bản prebuilt. Giải nén bỏ và đặt tại `~/spark`

```
cd ~ && wget http://d3kbcqa49mib13.cloudfront.net/spark-1.6.1-bin-hadoop2.6.tgz
tar xzvf spark-1.6.1-bin-hadoop2.6.tgz
mv spark-1.6.1-bin-hadoop2.6/ spark/ 
```

Clone project Vitk và build bằng Maven

```
git clone https://github.com/phuonglh/vn.vitk.git
cd vn.vitk 
mvn compile package
```

Sau khi build thành công, file `vn.vitk-2.0.jar` được đặt trong thư mục `target`

## Tách từ, gán nhãn từ loại ##
Vitk có chạy ở chế độ stand-alone cluster hoặc cluster thật. Ở chế độ cluster, mỗi máy cần truy cập đến thư mục chung chứa dữ liệu trong thư mục /dat của Vitk.

Sử dụng chức năng network file system (NFS) của Unix để mount thư mục /vi.vitk/dat và /export/dat
Ở chế độ stand-alone chỉ cần làm như sau

```
sudo mkdir -p /export/dat
sudo mount --bind ~/vn.vitk/dat /export/dat
```

Submit lên Spark để tiến hành tách từ

```
~/spark/bin/spark-submit --class=vn.vitk.Vitk ~/vn.vitk/target/vn.vitk-2.0.jar -i <input file> -o <output-file>
```

Danh sách tham số tham khảo [tại đây](https://github.com/phuonglh/vn.vitk/blob/master/WS.md#arguments).

Source code: [https://github.com/phuonglh/vn.vitk](https://github.com/phuonglh/vn.vitk)
