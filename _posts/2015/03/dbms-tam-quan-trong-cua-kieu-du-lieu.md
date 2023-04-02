---
template: post
title: DBMS - Tầm Quan Trọng Của Kiểu Dữ Liệu
date: "2015-03-04"
author: Van-Duyet Le
tags:
- DBMS
- MySQL
- type
modified_time: '2015-03-04T18:05:32.561+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7135335946971209887
blogger_orig_url: https://blog.duyet.net/2015/03/dbms-tam-quan-trong-cua-kieu-du-lieu.html
slug: /2015/03/dbms-tam-quan-trong-cua-kieu-du-lieu.html
category: Data
description: Một bài viết từ Blog kĩ thuật máy tính
fbCommentUrl: none

---

2h sáng. "beep, you’ve got mail". Mail từ hệ thống giám sát zabbix.
1 URL quan trọng trong hệ thống web không hiển thị được. Truy cập vào URL đó nhận status code http trả về 503. Zabbix định kỳ kiểm tra mã lỗi và khi mã trả về khác 200, zabbix gửi mail cho hắn.

"Lại có vấn đề gì rồi đây…" — hắn vùng dậy, mở laptop lên, mở browser ra và truy cập thử vào URL được thông báo. "Quả nhiên là không vào được", hắn nghĩ. Ssh thử vào một máy chủ và kiểm tra error log. Thông báo lỗi "Không truy cập được đến máy chủ cơ sở dữ liệu X" liên tiếp liên tiếp được ghi ra log. "Máy chủ X lại có vấn đề gì rồi đây …". 
Hắn vừa nghĩ, mắt vừa lướt qua các đồ thị giám sát tài nguyên của toàn bộ hệ thống. "Lưu lượng truy cập vào máy chủ web vẫn bình thường. Tỉ lệ cachehit vẫn không đổi. Mọi thứ không có gì có vẻ bất thường. Vậy vấn đề này ở máy chủ X rồi". Hắn nghĩ, rồi gõ

```
ssh X
```

## Truy tìm ##
X là một máy chủ cơ sở dữ liệu chạy mysql, 4 cores 24GB Ram 2 đĩa cứng 300GB RAID 1. Không quá yếu nhưng cũng không quá khoẻ. Vì là máy chủ cơ sở dữ liệu nên phần lớn tài nguyên của X được dùng cho mysql.

"Để xem chú mày bị làm sao nhé!" - hắn bắt đầu công đoạn chẩn đoán bệnh của máy chủ.
Sau khi vào máy chủ X, hắn gõ top. Lệnh top hiện ra máy chủ có 4 cores, tất cả đều có %cpu xấp xỉ 95%. Hắn gõ iostat 1, và quan sát I/O của đĩa cứng. TPS (Trasfer per second) biến động từ 131.89 xuống đến 19.00. tps trung bình không cao. Blk_wrtn/s và Blk_read/s cũng biến động nhưng trung bình cũng không cao.

"CPU hoạt động cật lực trong khi đấy I/O thì không quá lớn", hắn ghi lại điểm quan trọng này trong đầu. Ghi nhớ xong, hắn tiếp tục mở slow query log ra xem. Log này ghi lại những query mà mysql chạy quá lâu hơn 1s. 1 loạt query kiểu

```
select * from table_name where video_id in (12345, ‘23434’) and language = ‘en-us’;
```

được ghi ra log.

Query trên có 2 điểm rất kỳ lạ.

- Thứ nhất name được query theo cả kiểu số và xâu dữ liệu.
- Thứ hai query trên khá đơn giản, lệnh show table status like ‘table_name’ cho hắn kết quả số dòng chỉ khoảng 70000 dòng - 1 con số không lớn. Vậy mà X phải hoạt đông 95% cpu mà vẫn không thể nào trả về kết quả câu lệnh trên trong 1s.

```
$ mysql -u root -p
Enter password: ***********
mysql> use database database_name;
mysql> show table status like ‘table_name’\G;
*************************** 1. row ***************************
           Name: table_name
         Engine: InnoDB
        Version: 10
     Row_format: Compact
           Rows: 72148
 Avg_row_length: 924
    Data_length: 66732032
Max_data_length: 0
   Index_length: 14630912
      Data_free: 7340032
 Auto_increment: NULL
    Create_time: 2013-10-11 18:33:07
    Update_time: NULL
     Check_time: NULL
      Collation: utf8_general_ci
       Checksum: NULL
 Create_options:
        Comment: Latest translation for vid
```
Để xem chú mày đang bận rộn xử lý cái gì nhé.

```
mysql> show process list;

1 loạt query kiểu 

"select * from table_name where video_id in (12345, ‘23434’) and language = ‘en-us’;"
```

"beep, you’ve got mail". Một mail mới lại về. Máy chủ web đã không thể nào truy cập được X. Zabbix thông báo bản thân zabbix cũng không thể nào truy cập máy chủ X để lấy thông tin giám sát.

"Tình huống có vẻ nghiêm trọng lên." hắn lẩm bẩm.

Máy chủ bận rộn CPU, I/O không lớn chứng tỏ là query trên tốn rất nhiều CPU. Có lẽ CPU đang tốn thời gian để sắp xếp và tìm kiếm, một mình chứng của việc mysql đang phải tìm với 1 lượng dữ liệu lớn. 70000 không phải con số to, do vậy chỉ có thể là máy chủ X đang phải tìm kiếm mà không có chỉ mục (index)!

"Không lẽ nào!", vừa nói hắn vừa gõ lệnh  

```
mysql> show index from table_name;

+-------------+------------+-------------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+
| Table       | Non_unique | Key_name          | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment |
+-------------+------------+-------------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+
| table_name  |          0 | PRIMARY           |       1      | id          | A         |     73908   |     NULL | NULL   |      | BTREE      |         |
| table_name  |          0 | PRIMARY           |       2      | language    | A         |     73908   |     NULL | NULL   |      | BTREE      |         |
| table_name  |          1 | idx_table_name_1  |       1      | user_id     | A         |     24636   |     NULL | NULL   |      | BTREE      |         |
+-------------+------------+-------------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+
```

Rất buồn, vậy là video_id có gắn index đàng hoàng. Vậy thì không có lý do gì mà query trên lại không query theo index cả. Thật kỳ lạ. Vậy để thử xem query trên có dùng index không nhé. Đoạn hắn lấy 1 query bất kỳ và thử [EXPLAIN](http://dev.mysql.com/doc/refman/5.6/en/explain.html).

```
mysql> explain SELECT * FROM table_name WHERE `video_id` IN (1412240325) AND `language` = "en-us"\G;
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: table_name
         type: ALL
possible_keys: PRIMARY,idx_table_name_2
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 66870
        Extra: Using where
1 row in set (0.00 sec)

ERROR:
No query specified
```

key: NULL nghĩa là query trên không sử dụng index! Tại sao bảng có chỉ mục mà query lại không dùng index. Chắc chắn là video_id có vấn đề rồi. Vừa nghĩ hắn vừa gõ câu lệnh show create table để xem kiểu dữ liệu lúc tạo bảng.

```
mysql> show create table table_name;
table_name | CREATE TABLE `table_name` (
  `video_id` varchar(34) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `language` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`video_id`,`language`),
  KEY `idx_videotranslationinfo_1` (`user_id`),
  KEY `idx_videotranslationinfo_2` (`video_id`),
  KEY `idx_videotranslationinfo_3` (`language`),
  ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Latest translation for videos.' |
```

Có gì đó không ổn. Query thì coi video_id như là kiểu số nguyên, trong khi bảng lại định nghĩa video_id kiểu xâu dữ liệu. Có lẽ việc khác nhau trong kiểu dữ liệu này làm mysql không so sánh được truy cập với index, làm cho mysql sẽ tìm bản ghi bằng cách lặp toàn bộ bảng. Suy nghĩ vậy, hắn liền thử explain 1 query sau khi đã thay số bằng chữ.

```
mysql> explain SELECT * FROM table_name WHERE `video_id` IN ("1412240325") AND `language` = "en-us"\G;
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: table_name
         type: ALL
possible_keys: PRIMARY,idx_table_name_2
          key: PRIMARY
      key_len: NULL
          ref: NULL
         rows: 66870
        Extra: Using where
1 row in set (0.00 sec)

ERROR:
No query specified
```

"Ồ la la" hắn khẽ reo lên.

Sau khi đổi video_id thành kiểu chuỗi thì index đã được sử dụng key: PRIMARY. Hắn ngay lập tức liên lạc với bên phát triển và để sửa đoạn code sinh ra query trên. Bên phát triển lập tức tìm ra có 1 dòng code chưa gọi strval để biến video_id thành xâu dữ liệu trước ném query cho DB. Bên phát triển lập tức sửa source code và cập nhật phiên bản mới nhất lên máy chủ. Ngay lập tức %cpu của X trở về 1%. Trang web lại vào bình thường như chưa từng có gì cản trở. Slow log query cũng dừng log query hẳn.

## Bài học ##

Index thật quan trọng và Kiểu dữ liệu cũng rất quan trọng.

Hắn khoái trí khi phát hiện ra hiểu ra được thêm 1 nguyên lý hoạt động của mysql cũng như ảnh hưởng của máy chủ X lên toàn bộ hệ thống. Đôi khi chỉ 1 mặt xích sai sót trong cả 1 dây chuyền có thể phá huỷ toàn bộ dây chuyền - hắn lờ mờ suy nghĩ và ngủ gục. Giờ là 4h sáng.

Một bài viết từ Blog kĩ thuật máy tính, cám ơn tác giả.
