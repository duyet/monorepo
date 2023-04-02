---
template: post
title: Cài Apache Spark standalone bản pre-built
date: "2017-05-31"
author: Van-Duyet Le
tags:
- Data Engineer
- Apache Spark
- Python
- Javascript
- PySpark
- Spark
- Big Data
modified_time: '2018-09-01T22:32:19.019+07:00'
thumbnail: https://4.bp.blogspot.com/-5hwfzlugnac/WS7b6rg8cQI/AAAAAAAAlDg/Rgpp6oj-lGQludEAlYo9YtOrGCeudR0zgCLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-02-05.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1909662732383119873
blogger_orig_url: https://blog.duyet.net/2017/05/cai-apache-spark-standalone-ban-pre.html
slug: /2017/05/cai-apache-spark-standalone-ban-pre.html
category: Data
description: Mình nhận được nhiều phản hồi từ bài viết BigData - Cài đặt Apache Spark trên Ubuntu 14.04 rằng sao cài khó và phức tạp thế. Thực ra bài viết đó mình hướng dẫn cách build và install từ source.
fbCommentUrl: none
---

Mình nhận được nhiều phản hồi từ bài viết [BigData - Cài đặt Apache Spark trên Ubuntu 14.04](https://blog.duyet.net/2015/03/bigdata-cai-at-apache-spark-tren-ubuntu.html#.WS7ZxXaGP_g) rằng sao cài khó và phức tạp thế. Thực ra bài viết đó mình hướng dẫn cách build và install từ source.

Thực tế, Spark còn hỗ trợ cho ta nhiều phiên bản pre-built cùng với Hadoop. Pre-build tức Spark đã được build sẵn và chỉ cần sử dụng thôi. Cách làm như sau.

![](https://4.bp.blogspot.com/-5hwfzlugnac/WS7b6rg8cQI/AAAAAAAAlDg/Rgpp6oj-lGQludEAlYo9YtOrGCeudR0zgCLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-02-05.png)

## 1. Cài đặt Java ##
Nếu chưa cài thì bạn cài theo cách sau:

```
$ sudo apt-add-repository ppa:webupd8team/java
$ sudo apt-get update
$ sudo apt-get install oracle-java7-installer
```

## 2. Tải Apache Spark bản pre-built ##
Chọn phiên bản thích hợp và tải Apache Spark từ Website: [https://spark.apache.org/downloads.html](https://spark.apache.org/downloads.html)
Nhớ chọn dòng "Pre-built for Apache Hadoop ...."

[![](https://4.bp.blogspot.com/-NsecZC23D1I/WS7d1VcWZgI/AAAAAAAAlDs/pHrYRZlYba4PLUgYwZTItH9ryyxAmNkPACLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-14-14.png)](https://4.bp.blogspot.com/-NsecZC23D1I/WS7d1VcWZgI/AAAAAAAAlDs/pHrYRZlYba4PLUgYwZTItH9ryyxAmNkPACLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-14-14.png)

## 3. Sử dụng ##
Giải nén và mở terminal tại thư mục spark, và sử dụng thôi.

Test thuật toán tính số PI.

```
$ ./bin/run-example SparkPi 10
...
Pi is roughly 3.139484
```

[![](https://1.bp.blogspot.com/-6QnKO578d2M/WS7eoiVNlZI/AAAAAAAAlD0/3zfTpus0o30F4jvCGmQWWs00YBA_HzHLACLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-17-25.png)](https://1.bp.blogspot.com/-6QnKO578d2M/WS7eoiVNlZI/AAAAAAAAlD0/3zfTpus0o30F4jvCGmQWWs00YBA_HzHLACLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-17-25.png)

Nếu bạn nào dùng PySpark có thể mở thử PySpark Shell để kiểm tra bài toán WordCount:

[![](https://3.bp.blogspot.com/-jnKjDm9Jvic/WS7kD3uIGKI/AAAAAAAAlEU/RBD0sgo5RkA_YlbCKSl4tfkc_Iof1UrDwCLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-40-48.png)](https://3.bp.blogspot.com/-jnKjDm9Jvic/WS7kD3uIGKI/AAAAAAAAlEU/RBD0sgo5RkA_YlbCKSl4tfkc_Iof1UrDwCLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-40-48.png)

Mở PySpark Shell bằng lệnh:

```
$ ./bin/pyspark
```

Kết quả của WordCount:

![](https://3.bp.blogspot.com/-IuNqKmg-HLE/WS7kTDVehrI/AAAAAAAAlEY/cN3SXy3DU9YYvFYkgV64NhNynB-xwHD1wCLcB/s1600/Screenshot%2Bfrom%2B2017-05-31%2B22-41-48.png)

Bạn đã cài đặt xong Apache Spark với 3 bước siêu đơn giản. Bạn có thể tham khảo thêm phần [Sử dụng spark-submit](https://blog.duyet.net/2015/03/bigdata-cai-at-apache-spark-tren-ubuntu.html#Sdngspark-submit) ở bài viết cũ trước đây: [BigData - Cài đặt Apache Spark trên Ubuntu 14.04](https://blog.duyet.net/2015/03/bigdata-cai-at-apache-spark-tren-ubuntu.html#Sdngspark-submit)

Chúc bạn thành công.
