---
template: post
title: PySpark - Thiếu thư viện Python trên Worker
date: "2016-09-08"
author: Van-Duyet Le
tags:
- Data Engineer
- Apache Spark
- Python
- Tutorials
- Javascript
- Spark
- Javascript
- note
- Big Data
- Thủ thuật
modified_time: '2018-09-01T22:32:19.537+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6733211340626561170
blogger_orig_url: https://blog.duyet.net/2016/09/pyspark-thieu-thu-vien-python-tren-worker.html
slug: /2016/09/pyspark-thieu-thu-vien-python-tren-worker.html
category: Data
description: Apache Spark chạy trên Cluster, với Java thì đơn giản. Với Python thì package python phải được cài trên từng Node của Worker. Nếu không bạn sẽ gặp phải lỗi thiếu thư viện.
fbCommentUrl: none
---

Apache Spark chạy trên Cluster, với Java thì đơn giản. Với Python thì package python phải được cài trên từng Node của Worker. Nếu không bạn sẽ gặp phải lỗi thiếu thư viện.

```
import hi 
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ImportError: No module named hi
```
Spark có chức năng ship thư viện đến từng máy trong Cluster, tương tự chức năng `addJars` với Spark Java hoặc Scala.

1. Nén toàn bộ dist-packages với các thư viện cần thiết thành file `py-package.zip`
2. Sử dụng Spark Submit kèm thêm tham số `--py-files <path/to/zip>`

```
./bin/spark-submit app.py --py-files=py-package.zip
```

Spark sẽ tự động load thư viện trong zip vào từng node con, công việc dễ thở hơn là cài vào từng máy.

Ngoài ra cũng có thể sử dụng hàm [sc.addPyFile](https://spark.apache.org/docs/latest/api/python/pyspark.html?highlight=addpyfile#pyspark.SparkContext.addPyFile)

Spark cũng hỗ trợ thư viện dạng file `.py` và `.egg`. Những thư viện nào sử dụng `setuptools` có thể dùng lệnh sau để đóng gói thành file `.egg`

```
python setup.py bdist_egg
```
