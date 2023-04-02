---
template: post
title: Chạy Apache Spark với Jupyter Notebook
date: "2016-09-20"
author: Van-Duyet Le
tags:
- Data Engineer
- Jupyter
- Apache Spark
- IPython
- Python
- Javascript
- PySpark
- Spark
- Machine Learning
modified_time: '2018-09-10T17:20:37.518+07:00'
thumbnail: https://1.bp.blogspot.com/-IbzOyRw7mkM/V-Dm-cyXE9I/AAAAAAAAd-I/nGA92fFap4MM4uqKErB7g2H-t6T7CD1RQCLcB/s1600/Selection_006.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6884070140617008733
blogger_orig_url: https://blog.duyet.net/2016/09/chay-apache-spark-voi-jupyter-notebook.html
slug: /2016/09/chay-apache-spark-voi-jupyter-notebook.html
category: Data
description: IPython Notebook là một công cụ tiện lợi cho Python. Ta có thể Debug chương trình PySpark Line-by-line trên IPython Notebook một cách dễ dàng, tiết kiệm được nhiều thời gian.
fbCommentUrl: http://blog.duyetdev.com/2016/09/chay-apache-spark-voi-jupiter-notebook.html
---

IPython Notebook là một công cụ tiện lợi cho Python. Ta có thể Debug chương trình PySpark Line-by-line trên IPython Notebook một cách dễ dàng, tiết kiệm được nhiều thời gian.

![](https://1.bp.blogspot.com/-IbzOyRw7mkM/V-Dm-cyXE9I/AAAAAAAAd-I/nGA92fFap4MM4uqKErB7g2H-t6T7CD1RQCLcB/s1600/Selection_006.png)

## 1. Cài đặt Spark ##
Truy cập trang chủ ([https://spark.apache.org/downloads.html](https://spark.apache.org/downloads.html)), tải về bản Spark phù hợp (ở đây tôi tải bản Apache Spark 1.6.2).

```bash
wget http://d3kbcqa49mib13.cloudfront.net/spark-1.6.2-bin-hadoop2.6.tgz
```

Giải nén và khởi động Spark Standard Alone (hoặc Cluster).

```bash
tar -xzvf spark-1.6.2-bin-hadoop2.6.tgz
cd spark-1.6.2-bin-hadoop2.6
./sbin/start-all.sh
```

[![](https://1.bp.blogspot.com/-1NWXJdwzLWE/V-DfR4WnwsI/AAAAAAAAd9o/bdVrgZD73Kg-WQ8m2vPGipFaZuK7zxvYgCLcB/s1600/duyetdev%2540duyetdev%253A%2B%257E-spark-1.6.2-bin-hadoop2.6_001.png)](https://1.bp.blogspot.com/-1NWXJdwzLWE/V-DfR4WnwsI/AAAAAAAAd9o/bdVrgZD73Kg-WQ8m2vPGipFaZuK7zxvYgCLcB/s1600/duyetdev%2540duyetdev%253A%2B%257E-spark-1.6.2-bin-hadoop2.6_001.png)
Kiểm tra Spark đã Start thành công hay chưa, truy cập: http://spark-master-ip:8080

[![](https://1.bp.blogspot.com/-8msgj2t9RLA/V-Dfx7XjMXI/AAAAAAAAd9s/umMiRMw-fgYYFw3Zx7cPwpOnVI2eGDdHACLcB/s1600/Spark%2BMaster%2Bat%2Bspark%253A--duyetdev%253A7077%2B-%2BGoogle%2BChrome_002.png)](https://1.bp.blogspot.com/-8msgj2t9RLA/V-Dfx7XjMXI/AAAAAAAAd9s/umMiRMw-fgYYFw3Zx7cPwpOnVI2eGDdHACLcB/s1600/Spark%2BMaster%2Bat%2Bspark%253A--duyetdev%253A7077%2B-%2BGoogle%2BChrome_002.png)

## 2. Cài đặt Jupyter Notebook ##
Cài đặt bằng command line

```bash
sudo apt-get install ipython-notebook
```

Cấu hình cho IPython Notebook

```bash
jupyter notebook --generate-config
```

Mở file `.jupyter/jupyter_notebook_config.py` và cấu hình lại các tham số sau:

```bash
c.NotebookApp.ip = '*'
c.NotebookApp.port = 1603
c.NotebookApp.open_browser = False
```

Port có thể thay đổi theo ý thích, nếu trùng thì Notebook sẽ tự động đổi sang Port khác.

[![](https://3.bp.blogspot.com/-b0G6CE9ED4U/V-DhO5Y6MfI/AAAAAAAAd90/ien68QnA5jsMwwZ7owHKgMs4GpB9t-I3wCLcB/s1600/duyetdev%2540duyetdev%253A%2B%257E-spark-1.6.2-bin-hadoop2.6_003.png)](https://3.bp.blogspot.com/-b0G6CE9ED4U/V-DhO5Y6MfI/AAAAAAAAd90/ien68QnA5jsMwwZ7owHKgMs4GpB9t-I3wCLcB/s1600/duyetdev%2540duyetdev%253A%2B%257E-spark-1.6.2-bin-hadoop2.6_003.png)

## 3. RUN  ##
Thực thi lệnh

```bash
PYSPARK_DRIVER_PYTHON=ipython PYSPARK_DRIVER_PYTHON_OPTS='notebook' pyspark \
 --master local --conf spark.executor.memory=3g \
 --conf spark.executor.cores=2 --conf spark.driver.memory=3g \
 --conf spark.executor.instances=9 \
 --conf spark.kryoserializer.buffer.max=256m
```

[![](https://2.bp.blogspot.com/-s4p2Ew5LjI8/V-Dh92C3axI/AAAAAAAAd98/oUmUpv4w9UUwPdnjdNLFIlcCNDOT-VBPgCLcB/s1600/duyetdev%2540duyetdev%253A%2B%257E-spark-1.6.2-bin-hadoop2.6_004.png)](https://2.bp.blogspot.com/-s4p2Ew5LjI8/V-Dh92C3axI/AAAAAAAAd98/oUmUpv4w9UUwPdnjdNLFIlcCNDOT-VBPgCLcB/s1600/duyetdev%2540duyetdev%253A%2B%257E-spark-1.6.2-bin-hadoop2.6_004.png)

Tùy chỉnh các tham số tùy theo thực tế. Truy cập vào IPython Notebook và sử dụng: `http://notebook-ip:1234`

[![](https://2.bp.blogspot.com/--_gZr8Eizx8/V-DmB-nFxWI/AAAAAAAAd-E/9wdevAO6Bl8yIX4YA7RNYPnw5DftnKYSACLcB/s1600/%2528Busy%2529%2Bspark-hello%2B-%2BGoogle%2BChrome_005.png)](https://2.bp.blogspot.com/--_gZr8Eizx8/V-DmB-nFxWI/AAAAAAAAd-E/9wdevAO6Bl8yIX4YA7RNYPnw5DftnKYSACLcB/s1600/%2528Busy%2529%2Bspark-hello%2B-%2BGoogle%2BChrome_005.png)
