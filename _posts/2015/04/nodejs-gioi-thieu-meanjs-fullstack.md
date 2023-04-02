---
template: post
title: Nodejs - Giới thiệu MEANJs Fullstack và cách cài đặt
date: "2015-04-05"
author: Van-Duyet Le
tags:
- Nodejs
- MEANjs
- Web
modified_time: '2015-04-27T21:41:00.383+07:00'
thumbnail: https://3.bp.blogspot.com/-5rfaJD0WbCQ/VT5I0zIo48I/AAAAAAAACbA/Z3PvVUVO7Vo/s1600/meanjs-intro.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5454366534033840823
blogger_orig_url: https://blog.duyet.net/2015/04/nodejs-gioi-thieu-meanjs-fullstack.html
slug: /2015/04/nodejs-gioi-thieu-meanjs-fullstack.html
category: Javascript
description: MEANJs là một web application framework cho NodeJS, nó là 1 stack kết hợp nhiều công nghệ, giúp bạn dễ dàng nhanh chóng và dễ dàng phát triển 1 ứng dụng Web SPA (Single Page Application). Cùng tìm hiểu nhé.
fbCommentUrl: none

---

MEANJs là một web application framework cho NodeJS, nó là 1 stack kết hợp nhiều công nghệ, giúp bạn dễ dàng nhanh chóng và dễ dàng phát triển 1 ứng dụng Web SPA (Single Page Application). Cùng tìm hiểu nhé.  

## MEAN.Js - nghĩa là gì vậy? 

  
MEANJS là sự kết hợp giữa MongoDb, ExpressJS framework, AngularJs.  
MEAN là viết tắt của **M**ongoDB + **E**xpressJS + **A**ngularJS + **N**odeJS.  
  

![](https://3.bp.blogspot.com/-5rfaJD0WbCQ/VT5I0zIo48I/AAAAAAAACbA/Z3PvVUVO7Vo/s1600/meanjs-intro.png)

<table align="center" cellpadding="0" cellspacing="0" class="tr-caption-container" style="margin-left: auto; margin-right: auto; text-align: center;"><tbody><tr><td style="text-align: center;"><img border="0" src="https://4.bp.blogspot.com/-733zSU8O2Ks/VT5KUPiciZI/AAAAAAAACbo/XdgpOsbRnsE/s1600/MEAN.io_vs_MEAN.JS_logos.png" style="margin-left: auto; margin-right: auto;" /></td></tr><tr><td class="tr-caption" style="text-align: center;">MEANjs là một tổ hợp thống nhất</td></tr></tbody></table>

### 1. MongoDB

MongoDB là một cơ sở dữ liệu NoSQL.  
  
NoSQL là một thế hệ cơ sở dữ liệu có các đặc điểm chính là không ràng buộc (nonrelational), phân tán (distributed), mã nguồn mở (open source), khả năng co giản theo chiều ngang (Horizontal scalable) có thể lưu trữ, xử lý từ một lượng rất nhỏ cho tới dữ liệu cực lớn, lên đến hàng petabytes dữ liệu trong hệ thống cần có độ chịu tải, chịu lỗi cao với những yêu cầu về tài nguyên phần cứng thấp.  
  

![](https://2.bp.blogspot.com/-9P59a2PDl-8/VT5JZdFLQAI/AAAAAAAACbI/TzA9efeYMso/s1600/mongodb_logo.png)

  
  
Mục tiêu chính của Mongo là giữ lại các thuộc tính thân thiện của SQL. Do đó các câu truy vấn khá giống với SQLvậy nên MongoDB khá thích hợp cho các lập trình viên đã quen với ngôn ngữ truy vấn SQL. MongoDB có một khối lượng tính năng lớn và hiệu năng cao. Với các loại dữ liệu phong phú, nhiều truy vấn và việc giảm thời gian phát triển trong việc mô hình hóa các đối tượng.  
  
MongoDB được sử dụng tốt nhất với nhu cầu cần truy vấn động, cần tốc độ nhanh cho một cơ sở dữ liệu lớn vì MongoDB ngoài tốc độ đọc nhanh ra thì tốc độ ghi của nó rất nhanh. MongoDB hỗ trợ việc tìm theo trường, khoảng kết quả tìm và tìm theo cú pháp. Các truy vấn có thể trả về các trường được qui định trong văn bản và cũng có thể bao gồm các hàm Javascript mà người dùng chưa định nghĩa. Cũng giống như các cơ sở dữ liệu quan hệ, bất cứ một trường nào trong MongoDB đều được đánh chỉ mục.  
  
MongoDB còn có hổ trợ theo mô hình chủ – tớ (master – slave), mảnh, vùng dữ liệu (Sharding).  
  
MongoDB sử dụng một quá trình xử lý để xử lý các yêu cầu về dữ liệu, quản lý định dạng dữ liệu, thực hiện các hoạt động quản lý bên dưới là mongod, đây là trình xử lý chính. Trong việc mở rộng theo chiều ngang sử dụng mô hình mảnh lưu trữ, MongoDB cung cấp dịch vụ xử lý các truy vấn từ tầng ứng dụng, xác định vị trí dữ liệu trong cụm các node phân mảnh được gọi là mongos  

### 2. ExpressJS

Express là một web application framework cho NodeJS, cung cấp các tính năng mạnh mẽ cho việc xây dựng một ứng dụng web đúng nghĩa hoặc lai.  
  

![](https://3.bp.blogspot.com/-9sNw-vESVqI/VT5Jp2o70iI/AAAAAAAACbQ/Qmsr8v1wr3Q/s1600/68747470733a2f2f692e636c6f756475702e636f6d2f7a6659366c4c376546612d3330303078333030302e706e67.png)

  
  
ExpressJS là framework phổ biến và được sử dụng rộng rãi nhất của NodeJS, được xây dựng trên cấu trúc ngữ pháp của Sinatra. Ý tưởng đằng sau ExpressJS là đưa đến một framework nhẹ, dễ dàng tiếp cận để phát triển các ứng dụng web từ nhỏ đến lớn hay hybrid.  
  
Express cũng có thể sử dụng để xây dựng một API mạnh mẽ và thân thiện với người dùng, vì nó cung cấp rất nhiều tiện ích HTTP và middleware cho việc kết nối.  
  

### 3. AngularJS

AngularJS được bắt đầu từ năm 2009, do lập trình viên Misko Hevery tại Google viết ra như là một dự án kiểu "viết cho vui". Misko và nhóm lúc này đang tham gia vào 1 dự án của Google tên là Google Feedback. Với AngularJS, Misko đã rút ngắn số dòng code front-end từ 17000 dòng còn chỉ khoảng 1500. Với sự thành công đó, đội ngũ của dự án Google Feedback quyết định phát triển AngularJS theo hướng mã nguồn mở. Theo thông số từ Github mà mình thấy, hiện tại dự án AngularJS đang có gần 11000 người theo dõi và hơn 2000 lượt fork.  
  
Công nghệ HTML hỗ trợ tốt cho các trang web tĩnh, kiểu như trước năm 2000 vậy. Khi bạn xây dựng 1 trang web với PHP, Node/Express, hay Ruby thì nó cũng chỉ là một trang web tĩnh với nội dung được thay đổi khi bạn gửi request về máy chủ, máy chủ sẽ render 1 trang với nội dung tương ứng. Tuy nhiên mọi thứ đã thay đổi nhiều từ sự phát triển của HTML5, nhất là khi có sự chống lưng từ những ông lớn như Google, Yahoo, Facebook, và sự tập hợp đông đảo của cộng đồng mã nguồn mở.  
  

![](https://1.bp.blogspot.com/-vnTxzXBRh4w/VT5J2NH3wBI/AAAAAAAACbY/42l-erQVw-g/s1600/angularjs-logo.png)

  

### 4. NodeJS

NodeJS là một nền tảng được xây dựng trên "V8 Javascript engine" được viết bằng c++ và Javasccript. Nền tảng này được phát triển bởi Ryan Lienhart Dahl vào năm 2009.  
  
Tại thời điểm này, nó được rất nhiều nhà phát triển ứng dụng ưa chuộng và còn là một nền tảng rất mới mẻ. Nó là dự án được xem nhiều thứ 2 trên GitHub.org, có khá nhiều theo dõi trên một nhóm của nó trên Google.com và có trên 15.000 modules được công bố trên NMP(khái niệm này sẽ được giới thiệu ở phần sau). Tất cả những điều trên cho thấy rằng, NodeJS đang là một nền tảng mới và thú vị cho việc phát triển các ứng dụng web, ứng dụng Server. NodeJS cũng cho thấy rằng nó hứa hẹn là một nền tảng hấp dẫn có thể thay thế được các nền tảng truyền thống như Apache, PHP, Python . . .  
  
NodeJS là một nền tảng cho việc viết ứng dụng Javascript phía server, không giống như Javascript chúng ta thường viết trên trình duyệt. Với ngôn ngữ Javascript và nền tảng nhập xuất bất đồng bộ, nó là một nền tảng mạnh mẽ để phát triển các ứng dụng thời gian thực.  
  

![](https://1.bp.blogspot.com/-KC5payxdP9Y/VT5KBt_nzNI/AAAAAAAACbg/wykU1hHPyV0/s1600/nodejs_logo_green.jpg)