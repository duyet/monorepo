---
template: post
title: 'Spark: Convert Text (CSV) to Parquet để tối ưu hóa Spark SQL và HDFS'
date: "2016-09-21"
author: Van-Duyet Le
tags:
- Data Engineer
- Apache Spark
- Python
- Javascript
- BigData
- Big Data
- Apache Parquet
- Spark SQL
modified_time: '2018-09-01T22:32:18.872+07:00'
thumbnail: https://2.bp.blogspot.com/-e_wBjtB6Fl0/V-ID3ys6F9I/AAAAAAAAd_k/jRxF8H344KM_ywgsxVfQAPy3GDXAd1_fQCK4B/s1600/parquet-logo.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1854812732983668692
blogger_orig_url: https://blog.duyet.net/2016/09/spark-convert-text-csv-to-parquet.html
slug: /2016/09/spark-convert-text-csv-to-parquet.html
category: Data Engineer
description: Lưu trữ dữ liệu dưới dạng Columnar như Apache Parquet góp phần tăng hiệu năng truy xuất trên Spark lên rất nhiều lần. Bởi vì nó có thể tính toán và chỉ lấy ra 1 phần dữ liệu cần thiết (như 1 vài cột trên CSV), mà không cần phải đụng tới các phần khác của data row. Ngoài ra Parquet còn hỗ trợ flexible compression do đó tiết kiệm được rất nhiều không gian HDFS.  
fbCommentUrl: none
---

Lưu trữ dữ liệu dưới dạng **Columnar** như **Apache Parquet** \[1\] (**[https://parquet.apache.org](https://parquet.apache.org/)**) góp phần tăng hiệu năng truy xuất trên Spark lên rất nhiều lần. Bởi vì nó có thể tính toán và chỉ lấy ra 1 phần dữ liệu cần thiết (như 1 vài cột trên CSV), mà không cần phải đụng tới các phần khác của data row. Ngoài ra Parquet còn hỗ trợ flexible compression do đó tiết kiệm được rất nhiều không gian HDFS.  
  

[![](https://2.bp.blogspot.com/-e_wBjtB6Fl0/V-ID3ys6F9I/AAAAAAAAd_k/jRxF8H344KM_ywgsxVfQAPy3GDXAd1_fQCK4B/s1600/parquet-logo.png)](http://saveto.co/O9kwvB)

  
Nếu bạn chứa dữ liệu dạng text trên HDFS và dùng Spark SQL để xử lý, một biện pháp tối ưu bạn nên thử là **chuyển đổi text đó sang Parquet**, tăng tốc độ truy xuất và tối ưu bộ nhớ.  
  
Theo một bài viết của **IBM**\[2\], chuyển đổi sang Parquet giúp tăng tốc độ truy xuất lên **30 lần** (hoặc hơn) tùy trường hợp, bộ nhớ tiết kiệm đến **75%**!  

## Let’s convert to Parquet!

Spark SQL hỗ trợ đọc và ghi Parquet files, và giữ nguyên được meta data. Parquet schema cho phép data files "self-explanatory" to the Spark SQL applications.  
  
Đoạn chương trình sau sử dụng databricks.csv để đọc flat file, sau đó lưu lại dạng Parquet kèm Schema.  
  
Đoạn mã trên tự động convert tất cả các file hadoopdsPath+"/catalog\_page/\* và lưu Parquet vào thư mục `/user/spark/data/parquet/`, mặc định Spark sử dụng chuẩn nén `gzip`, bạn có thể sử dụng compression codec `uncompressed`, `snappy`, hoặc `lzo`.  

## Convert 1TB mất bao lâu?

Mất **50 phút**, tức khoảng **20GB/phút khi sử dụng 6-datanode Spark 1.5.1**. Tổng lượng bộ nhớ sử dụng là 500GB. Kết quả Parquet files trên HDFS có dạng:  
  

```
hdfs:///user/spark/data/parquet1000g/catalog_page/_SUCCESS
hdfs:///user/spark/data/parquet1000g/catalog_page/_common_metadata
hdfs:///user/spark/data/parquet1000g/catalog_page/_metadata
hdfs:///user/spark/data/parquet1000g/catalog_page/part-r-00000-a9341639-a804-45bd-b594-8e58220190f4.gz.parquet
hdfs:///user/spark/data/parquet1000g/catalog_page/part-r-00001-a9341639-a804-45bd-b594-8e58220190f4.gz.parquet
```
  
Bộ nhớ tiết kiệm được  
  
```bash
$ hadoop fs -du -h -s /user/spark/data/text1000g897.9 G  /user/spark/data/text1000g
$ hadoop fs -du -h -s /user/spark/data/parquet1000g231.4 G  /user/spark/data/parquet1000g
```
  
Từ **897.9GB** text, với Parquet chỉ còn lại **231.4GB,** tiết kiệm được khoảng 75%.  

## Tham khảo

*   \[1\] Apache Parquet - [https://parquet.apache.org/](https://parquet.apache.org/)
*   \[2\] [How-to: Convert Text to Parquet in Spark to Boost Performance](https://developer.ibm.com/hadoop/2015/12/03/parquet-for-spark-sql/)
*   \[3\] [Performance impact of accessing TIMESTAMP fields from Big SQL with Parquet MR files](https://developer.ibm.com/hadoop/2016/08/11/performance-impact-of-accessing-timestamp-fields-from-big-sql-with-parquet-mr-files/)