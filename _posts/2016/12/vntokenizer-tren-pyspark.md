---
template: post
title: vnTokenizer trên PySpark
date: "2016-12-14"
author: Van-Duyet Le
tags:
- Data Engineer
- Python
- Javascript
- PySpark
- Spark
- vnTokenizer
- NLP
- Machine Learning
modified_time: '2018-09-10T17:20:37.029+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3825495208380118194
blogger_orig_url: https://blog.duyet.net/2016/12/vntokenizer-tren-pyspark.html
slug: /2016/12/vntokenizer-tren-pyspark.html
category: Data Engineer
description: Trong blog này mình sẽ custom lại vn.vitk để có thể chạy như một thư viện lập trình, sử dụng ngôn ngữ python (trên PySpark và Jupyter Notebook).  

fbCommentUrl: http://blog.duyetdev.com/2016/12/vntokenizer-tren-pyspark.html
---

vnTokenizer của tác giả Lê Hồng Phương ở phiên bản thứ 3 (**[vn.vitk](https://github.com/phuonglh/vn.vitk)**) này được build trên Apache Spark, cho phép xử lý dữ liệu lớn. vn.vitk hỗ trợ các tác vụ: Word segmentation, Part-of-speech tagging, Dependency parsing.  
  
Tuy nhiên **vn.vitk** được viết trên Java và sử dụng như một công cụ command line tools, khó tùy chỉnh và sử dụng dạng programming:  

```bash
./bin/spark-submit ~/vitk/target/vn.vitk-3.0.jar -m <master-url> -i <input-file> -o <output-file> -v
``` 

  

Trong blog này mình sẽ custom lại vn.vitk để có thể chạy như một thư viện lập trình, sử dụng ngôn ngữ python (trên PySpark và Jupyter Notebook).  
Xem qua bài viết về cách sử dụng Jupyter Notebook với Apache PySpark: [Chạy Apache Spark với Jupyter Notebook](https://blog.duyet.net/2016/09/chay-apache-spark-voi-jupiter-notebook.html#.WEz76RJ97_g)  
  
PySpark sử dụng **py4j** để gọi trực tiếp các thư viện **Spark** trên **Scala/Java**. Vì vậy chúng ta hoàn toàn có thể import các hàm của **vn.vitk trên Python**.  
  
**Chú ý:**  

1.  Để custom mã nguồn của vn.vitk, clone project tại đây: https://github.com/phuonglh/vn.vitk, cài đặt trước Java và Maven
2.  Bạn hoàn toàn có thể sử dụng file **[vn.vitk-3.0.jar](https://github.com/duyet/pyspark-vn.vitk/blob/master/lib/vn.vitk-3.0.jar)** mình đã build sẵn tại đây mà không cần đọc các bước modified bên dưới. Sử dụng file jar này để submit vào PySpark.

## 1. vn.vitk.tok.Tokenizer

Với vn.vitk.tok.Tokenizer, Class này chỉ có Constructor với tham số String sparkMaster ([link](https://github.com/phuonglh/vn.vitk/blob/master/src/main/java/vn/vitk/tok/Tokenizer.java#L77)), địa chỉ của Spark Master. Mình muốn truyền trực tiếp Spark Context từ PySpark vào, thêm vào file **[vn.vitk/src/main/java/vn/vitk/tok/Tokenizer.java](https://github.com/phuonglh/vn.vitk/blob/master/src/main/java/vn/vitk/tok/Tokenizer.java#L77)**  
  
```java
public Tokenizer(JavaSparkContext _jsc, String lexiconFileName, String regexpFileName) {
    jsc = _jsc;
    lexicon = new Lexicon().load(lexiconFileName);
    if (verbose) {
        System.out.println("#(nodes of the lexicon) = " + lexicon.numNodes());
        List<String> lines = jsc.textFile(regexpFileName).collect();
        for (String line : lines) {
            line = line.trim();
            if (!line.startsWith("#")) {
                // ignore comment lines   
                String[] s = line.split("\\s+");
                if (s.length == 2) {
                    patterns.put(s[0], Pattern.compile(s[1]));
                }
            }
        }
    }
}
```

  
Xem file hoàn chỉnh tại đây: [https://github.com/duyet/vn.vitk/.../java/vn/vitk/tok/Tokenizer.java](https://github.com/duyet/vn.vitk/blob/master/src/main/java/vn/vitk/tok/Tokenizer.java)  
  
Build lại project bằng lệnh: `mvn compile package`, sau khi build thành công file `vn.vitk-3.0.jar` sẽ nằm trong thư mục `target`.  

## Submit PySpark và code

Submit vn.vitk-3.0.jar bằng lệnh:  

```bash
export PYSPARK_DRIVER_PYTHON=ipython
export PYSPARK_DRIVER_PYTHON_OPTS="notebook --NotebookApp.open_browser=False --NotebookApp.ip='*' --NotebookApp.port=8880"
export SPARK_HOME=~/spark-1.6.2-bin-hadoop2.6 # Path to home of Spark
pyspark --master local --jars=./lib/vn.vitk-3.0.jar --driver-class-path=./lib/vn.vitk-3.0.jar
```

Tham khảo thêm về Notebook PySpark trong bài viết sau: [Chạy Apache Spark với Jupyter Notebook](https://blog.duyet.net/2016/09/chay-apache-spark-voi-jupiter-notebook.html#.WEz76RJ97_g)  
Mở Jupyter notebook trên trình duyệt và code mẫu theo notebook sau:

https://gist.github.com/duyet/e1f8122a015b300456ece1b4f92c69f1


Kết quả:

https://gist.github.com/duyet/9252f98405738ac63d5d8fd034866dac


  
Bạn có thể xem toàn bộ mã nguồn, input và output mẫu tại đây: [https://github.com/duyet/pyspark-vn.vitk](https://github.com/duyet/pyspark-vn.vitk)  

## Tham khảo

1.  [https://github.com/phuonglh/vn.vitk](https://github.com/phuonglh/vn.vitk)
2.  [https://github.com/duyet/pyspark-vn.vitk](https://github.com/duyet/pyspark-vn.vitk)