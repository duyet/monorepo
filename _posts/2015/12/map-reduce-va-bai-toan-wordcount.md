---
template: post
title: Bigdata - Map-Reduce và bài toán Word Count
date: "2015-12-02"
author: Van-Duyet Le
tags:
- Apache Spark
- BigData
- Big Data
modified_time: '2016-01-11T02:00:48.839+07:00'
thumbnail: https://3.bp.blogspot.com/-i_xNRnGm_pY/Vl8HH5-TM0I/AAAAAAAAKKU/K1W4w2i2f5E/s1600/big-data-cloud-e1383271750410-460x394.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5347978529971452971
blogger_orig_url: https://blog.duyet.net/2015/12/map-reduce-va-bai-toan-wordcount.html
slug: /2015/12/map-reduce-va-bai-toan-wordcount.html
category: Data Engineer
description: Map-Reduce là một giải pháp! Map-Reduce được phát minh bởi các kỹ sư Google để giải quyết bài toán xử lý một khối lượng dữ liệu cực lớn, vượt quá khả năng xử lý của một máy tính đơn có cấu hình khủng.
fbCommentUrl: none
---

Map-Reduce là một giải pháp! Map-Reduce được phát minh bởi các kỹ sư Google để giải quyết bài toán xử lý một khối lượng dữ liệu cực lớn, vượt quá khả năng xử lý của một máy tính đơn có cấu hình khủng.

[![](https://3.bp.blogspot.com/-i_xNRnGm_pY/Vl8HH5-TM0I/AAAAAAAAKKU/K1W4w2i2f5E/s320/big-data-cloud-e1383271750410-460x394.png)](https://blog.duyet.net/2015/12/map-reduce-va-bai-toan-wordcount.html)

Với máy tính với cấu hình dù rất khoẻ như ở trên thì ta vẫn thấy giới hạn xử lý dữ liệu của nó. Cụ thể máy tính không thể lưu trữ được quá 8TB dữ liệu, không thể đồng thời xử lý được dữ liệu lớn hơn 128GB (kích thước của RAM) và không thể đồng thời xử lý được lớn hơn 18 luồng chương trình.

## Giải pháp xử lý song song Map-Reduce  ##
Theo Google họ có rất nhiều dữ liệu, ước tính đến năm 2013, họ có khoảng 80 petabytes (~ 80.000 TB ~ 80.000.000 GB) trong cơ sở dữ liệu. Do vậy chưa tính đến việc xử lý dữ liệu, chỉ riêng việc đọc dữ liệu đã vượt qua năng lực xử lý của 1 máy tính. Điều này đòi hỏi một mô hình truy vấn dữ liệu mới cho phép xử lý lượng dữ liệu trên.
Map-Reduce giải quyết các vấn đề liệt kê ở trên bằng cách:

- Phân chia dữ liệu thành nhiều block và chia cho nhiều máy tính lưu trữ (đảm bảo tính toàn vẹn và tính sẵn sàng của dữ liệu).
- Chuyển tính toán về nơi có dữ liệu. Ý tưởng chuyển tính toán đến nơi có dữ liệu thực sự là một sự đột phá và đã được đề xuất trong [một bài báo](http://research.microsoft.com/pubs/70001/tr-2003-24.pdf) của nhà khoa học máy tính [Jim Gray](https://en.wikipedia.org/wiki/Jim_Gray_(computer_scientist)) từ năm 2003.
- Đưa ra mô hình và giao diện tính toán đơn giản.

### Chia dữ liệu thành nhiều Block ###
Các kỹ sư Google giải quyết bài toán này bằng giải pháp GFS. GFS là một hệ thống quản lý File phân tán với các chức năng giống như hệ thống File bình thường của Linux như: không gian tên (namespace), tính thừa thãi (redundancy), và tính sẵn sàng (availability). Như đã giới thiệu ở bài viết Các giải pháp BigData, HDFS cũng là một một hệ thống quản lý File phân tán.

Đặc điểm của hệ thống File phân tán này là:

- Dùng để quản lý các File có kích thước lớn: kích thước từ trăm GB đến TB
- Dữ liệu ít khi bị cập nhật ở giữa file (kiểu mở file, đến dữa file, cập nhật) mà thường được đọc học ghi vào cuối File (append).

## Mô hình tính toán MapReduce và bài toán Wordcount  ##

Bài toán word-count (đếm từ) là bài toán dễ hiểu nhất minh hoạ cho MapReduce (MR). Bài toán có những đặc điểm sau:

- File cần đếm rất lớn (quá lớn để có thể được tải lên bộ nhớ chính của 1 máy)
- Mỗi cặp <từ ngữ, số lượng> quá lớn cho bộ nhớ.

MapReduce chia làm 3 thao tác: 

- Map: quét file đầu vào và ghi lại từng bản ghi
- Group by Key: sắp xếp và trộn dữ liệu cho mỗi bản ghi sinh ra từ Map
- Reduce: tổng hợp, thay đổi hay lọc dữ liệu từ thao tác trước và ghi kết quả ra File.

![](https://3.bp.blogspot.com/-xzLph7BccQ8/Vl8DKXHQajI/AAAAAAAAKJ8/lY6P8XukwJU/s1600/MapReduce_Work_Structure.png)

Về mặt định nghĩa thuật toán, ta có thể mô tả MR như sau:

- Input: dữ liệu dưới dạng Key → Value
- Lập trình viên viết 2 thủ tục:

- Map(k, v) → <k', v'>*
- Reduce(k', <v'>*) → <k', v''>*

Với:

- Map biến mỗi key k thu được bằng thành cặp <k', v'>. 
- Reduce nhận đầu vào là khoá k' và danh sách cách giá trị v' và trả về kết quả là cặp <k', v''>.

Ví dụ với hình mô tả ở trên thì Map trả về danh sách: <Bear, 1>, <Bear, 1> còn Reduce nhận kết quả trên và trả về <Bear, 2>.

### Lập lịch và dòng dữ liệu ###

Sau khi đã có cách đấu nối và phương pháp tính toán, vấn đề tiếp theo cần bàn là tính thế nào, khi nào và ra sao. Map-Reduce có một đặc điểm thú vị là chỉ cần phân chia các File thành các vùng độc lập thì các thủ tục Map không hoàn toàn liên quan đến nhau có thể thực hiện song song.

![](https://4.bp.blogspot.com/-xqgQyBlNepQ/Vl8EqnQ1mXI/AAAAAAAAKKI/Ll4HQoNGGOM/s1600/google_schema.gif)

Một File Input có thể được xử lý bởi nhiều Map/Reduce. Map-Reduce sẽ cố gắng cung cấp giao diện lập trình đơn giản trong khi che dấu những xử lý phức tạp đi. Các xử lý chi tiết phức tạp bao gồm:

- Phân chia dữ liệu
- lập lịch chạy các thủ tục Map/Reduce trên các máy tính
- Thực hiện thủ tục Groupby
- Quản lý hỏng hóc (ví dụ tự động khởi động các thủ tục M/R đang chạy dở thì máy hỏng, quản lý dữ liệu khi máy hỏng)
- Quản lý giao tiếp giữa các máy tính.

## Kết  ##
Mô hình của Map-Reduce nhìn có vẻ đơn giản nhưng thật sự rất mạnh và có thể giải quyết được rất nhiều bài toán trong BigData. Bạn có thể tham khảo các bài viết trước của mình để hiểu hơn về Big Data và Spark.

Tham khảo:

- [MapReduce Tutorial](https://hadoop.apache.org/docs/current/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html)
- [http://hadoop.apache.org](http://hadoop.apache.org/)
- [MapReduce: Simplified Data Processing on Large Clusters](http://research.google.com/archive/mapreduce.html) 
