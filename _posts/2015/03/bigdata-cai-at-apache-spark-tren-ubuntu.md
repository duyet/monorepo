---
template: post
title: BigData - Cài đặt Apache Spark trên Ubuntu 14.04
date: "2015-03-27"
author: Van-Duyet Le
tags:
- Apache
- Python
- Spark
- BigData
- Hadoop
modified_time: '2018-09-01T22:28:00.347+07:00'
thumbnail: https://1.bp.blogspot.com/-Ruz5XvIPJZo/VS5s2ElpdQI/AAAAAAAACQ0/G7LCMJ0klNk/s1600/download-spark.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3847908519775182747
blogger_orig_url: https://blog.duyet.net/2015/03/bigdata-cai-at-apache-spark-tren-ubuntu.html
slug: /2015/03/bigdata-cai-at-apache-spark-tren-ubuntu.html
category: BigData
description: Trong lúc tìm hiểu vài thứ về BigData cho một số dự án, mình quyết định chọn Apache Spark thay cho Hadoop. Theo như giới thiệu từ trang chủ của Apache Spark, thì tốc độ của nó cao hơn 100x so với Hadoop MapReduce khi chạy trên bộ nhớ, và nhanh hơn 10x lần khi chạy trên đĩa, tương thích hầu hết các CSDL phân tán (HDFS, HBase, Cassandra, ...). Ta có thể sử dụng Java, Scala hoặc Python để triển khai các thuật toán trên Spark.

---

Trong lúc tìm hiểu vài thứ về BigData cho một số dự án, mình quyết định chọn Apache Spark thay cho Hadoop. Theo như giới thiệu từ trang chủ của Apache Spark, thì tốc độ của nó cao hơn 100x so với Hadoop MapReduce khi chạy trên bộ nhớ, và nhanh hơn 10x lần khi chạy trên đĩa, tương thích hầu hết các CSDL phân tán (HDFS, HBase, Cassandra, ...). Ta có thể sử dụng Java, Scala hoặc Python để triển khai các thuật toán trên Spark.

Chú ý: Đây là bài viết hướng dẫn cách cài đặt từ Source. Bạn có thể cài bản standalone thông qua bản pre-built. [Xem bài viết hướng dẫn tại đây](https://blog.duyet.net/2017/05/cai-apache-spark-standalone-ban-pre.html).

Spark có nhiều phiên bản khác nhau, tương thích với Hadoop và hầu hết các loại CSDL mà Hadoop hỗ trợ. Bạn có thể truy cập vào trang Downloads của Spark để chọn download phiên bản tương ứng.

![](https://1.bp.blogspot.com/-Ruz5XvIPJZo/VS5s2ElpdQI/AAAAAAAACQ0/G7LCMJ0klNk/s1600/download-spark.png)

Sau đây mình sẽ hướng dẫn về các bước cần thiết để biên dịch, cài đặt và cấu hình Spark từ Source.

## Cài đặt Java ##
Để có thể chạy Spark trên ubuntu, cần phải có Java. Nếu chưa có thì cài đặt như sau, chạy các lệnh:

```shell
$ sudo apt-add-repository ppa:webupd8team/java
$ sudo apt-get update
$ sudo apt-get install oracle-java7-installer
```

Kiểm tra lại đã cài đặt thành công hay chưa 

```bash
$ java -version
```

Bạn sẽ thấy  
```
java version "1.7.0_76" Java(TM) SE Runtime Environment (build 1.7.0_76-b13) Java HotSpot(TM) 64-Bit Server VM (build 24.76-b04, mixed mode)
```

## Cài đặt Scala ##
Tiếp theo là cài đặt Scala, bạn có thể tìm hiểu thêm về Scala tại [trang chủ](http://www.scala-lang.org/index.html)

Tải bản Scala 2.11.6 tại đây: [http://www.scala-lang.org/download/](http://www.scala-lang.org/download/)
Giải nén, chép hết các file vào /usr/local/src/scala/. Ai lười thì lần lượt chạy các lệnh sau

```
$ cd ~/Downloads
$ wget http://www.scala-lang.org/files/archive/scala-2.11.6.tgz
$ sudo tar xvf ./scala-2.11.6.tgz
$ sudo mkdir /usr/local/src/scala
$ sudo cp scala-2.11.6 /usr/local/src/scala/
```

Mở file .bashrc và thêm 2 dòng sau vào cuối cùng

```
export SCALA_HOME=/usr/local/src/scala/scala-2.11.6
export PATH=$SCALA_HOME/bin:$PATH
```

Khởi động lại .bashrc để nạp lại các biến ENV

```
$ source .bashrc
```

Kiểm tra xem Scala đã cài đặt thành công hay chưa   

```
$ scala -version
```

Thấy giống giống thế này là Ok: 
`Scala code runner version 2.11.6 -- Copyright 2002-2013, LAMP/EPFL`

## Tải và cài đặt Apache Spark ##
Truy cập [http://spark.apache.org/downloads.html](http://spark.apache.org/downloads.html) và tải bản Spark mới nhất, hoặc làm theo cách dưới đây

```
$ cd ~/Downloads
$ wget http://mirrors.viethosting.vn/apache/spark/spark-1.3.0/spark-1.3.0.tgz
$ tar xvf spark-1.3.0.tgz 

```

## Biên dịch Spark ##
Trong source của Spark mới vừa tải về đã tích hợp sẵn SBT(Simple Build Tool), để biên dịch Spark, chạy các lệnh sau:

```
$ cd spark-1.3.0
$ sbt/sbt assembly
```

Ăn miếng nước, uống miếng bánh, đợi 1 vài (chục) phút để SBT build.

## Test thử ##
Sau thời gian chờ đợi, bạn đã có thể sử dụng. Test thử nào, sau đây là chương trình tính số Pi, tích hợp sẵn trong Spark

```
$ ./bin/run-example SparkPi 10
```

Kết quả 3.14634, hệ thống của bạn đã sẵn sàng chinh chiến.  

## Sử dụng spark-submit ##
Một khi bạn đã viết xong vài thuật toán nho nhỏ trên API của Spark, đây là lúc chạy trên Spark. Spark-Submit là một script (bin/spark-submit), giúp bạn submit chương trình của bạn lên Spark và chạy. Bạn có thể Submit file Jar nếu viết app bằng Java, đường dẫn file .py nếu viết bằng python, ...

Trong thư mục Spark mặc định có chứa nhiều file ví dụ trong thư mục examples, bằng ngôn cả ngôn ngữ Java, Scala và Python.

Thử nhé, submit thuật toán tính số PI

```
$ ./bin/spark-submit examples/src/main/python/pi.py
```

Cách Submit file .jar

```
./bin/spark-submit \
  --class <main-class>
  --master <master-url> \
  --deploy-mode <deploy-mode> \
  --conf <key>=<value> \
  ... # other options
  <application-jar> \
  [application-arguments]
```

Một số ví dụ về cách sử dụng Spark-Submit

```
# Chạy application trên máy đơn với 8 cores
./bin/spark-submit \
  --class org.apache.spark.examples.SparkPi \
  --master local[8] \
  /path/to/examples.jar \
  100

# Chạy Spark Standalone cluster ở chế độ deploy
./bin/spark-submit \
  --class org.apache.spark.examples.SparkPi \
  --master spark://207.184.161.138:7077 \
  --executor-memory 20G \
  --total-executor-cores 100 \
  /path/to/examples.jar \
  1000

# Chạy trên YARN cluster
export HADOOP_CONF_DIR=XXX
./bin/spark-submit \
  --class org.apache.spark.examples.SparkPi \
  --master yarn-cluster \  # can also be `yarn-client` for client mode
  --executor-memory 20G \
  --num-executors 50 \
  /path/to/examples.jar \
  1000

# Chạy application trên Spark ở chế độ Standalone
./bin/spark-submit \
  --master spark://207.184.161.138:7077 \
  examples/src/main/python/pi.py \
  1000 # tham số
```

## Sử dụng Spark Shell ##

Bạn có thể sử dụng Spark thông qua Scala Shell 

```
$ ./spark-shell
```

```
scala> val textFile = sc.textFile("README.md")
scala> textFile.count()
```

## Kết hợp Spark với Hadoop Filesystems (HDFS) ##
Ở trên mình hướng dẫn cách build từ source, cách này có cái hay là bạn có thể chạy Spark với bất kì phiên bản Hadoop nào. Bây giờ mình muốn sử dụng kết hợp với HDFS thì sao? thực hiện các bước sau

Dọn dẹp

```
$ sbt/sbt clean
```

Bạn có thể thay đổi phiên bản của SPARK_HADOOP_VERSION, ở đây mình dùng 2.0.0-cdh4.3.0  

```
$ SPARK_HADOOP_VERSION=2.0.0-mr1-cdh4.3.0 sbt/sbt assembly
```

Sau khi build thành công, bạn đã có thể đọc và ghi dữ liệu lên cdh4.3.0 clusters 

```
$ ./spark-shell
```

```
scala> var file = sc.textFile("hdfs://IP:8020/path/to/textfile.txt")
scala> file.flatMap(line => line.split(",")).map(word => (word, 1)).reduceByKey(_+_)
scala> count.saveAsTextFile("hdfs://IP:8020/path/to/ouput")
```

## Kết ##
Cách cấu hình Spark để chạy MultiNode trên YARN: [https://spark.apache.org/docs/1.2.0/running-on-yarn.html](https://spark.apache.org/docs/1.2.0/running-on-yarn.html)
Quick Start: [http://spark.apache.org/docs/1.1.1/quick-start.html](http://spark.apache.org/docs/1.1.1/quick-start.html)
