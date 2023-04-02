---
template: post
title: Giới thiệu, làm quen với phpMyAdmin - Hệ quản trị MySQL
date: "2015-02-15"
author: Van-Duyet Le
tags:
- SQL
- PHPMyAdmin
- MySQL
- Tutorials
modified_time: '2015-02-15T23:05:02.138+07:00'
thumbnail: https://1.bp.blogspot.com/-RIl_Pz6Y1Fo/VODDEddfGiI/AAAAAAAACHw/wibuZ6SUfAQ/s1600/Screenshot%2Bfrom%2B2015-02-15%2B22%3A59%3A44.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5098182681799861842
blogger_orig_url: https://blog.duyet.net/2015/02/gioi-thieu-lam-quen-voi-phpmyadmin-he.html
slug: /2015/02/gioi-thieu-lam-quen-voi-phpmyadmin-he.html
description: 
fbCommentUrl: none

---

phpMyAdmin là 1 chương trình mã nguồn mở miễn phí, viết bằng PHP, dùng để hỗ trợ các bạn làm việc với MySQL thông qua giao diện web mà không cần dùng tới những dòng lệnh MySQL phức tạp.

![](https://1.bp.blogspot.com/-RIl_Pz6Y1Fo/VODDEddfGiI/AAAAAAAACHw/wibuZ6SUfAQ/s1600/Screenshot%2Bfrom%2B2015-02-15%2B22%3A59%3A44.png)

Giao diện phpMyAdmin như hình trên, trong đó:

- Cột bên trái: là danh sách các CSDL hiện có trong MySQL (information_schema là CSDL mặc định của MySQL)
- Cột bên phải: là các thông tin về Webserver.
- Tab Databases: hiển thị thông tin về CSDL đang chọn
- Tab SQL: khung nhập các câu lệnh SQL để bạn tương tác sâu với MySQL.
- Tab Status: hiển thị trạng thái hoạt động của MySQL server hiện tại.
- Tab Export/Import: nhập/xuất các bảng của CSDL.
- Tab Setting: tinh chỉnh cấu hình cho phpMyAdmin.
- Tab Variables: các biến của MySQL
- Tab Charsets: thông tin về các charset trong MySQL
- Tab Engines: thông tin về các engine trong MySQL

## Tạo CSDL trong phpMyAdmin ##

- Vào mục Databases, gõ tên database muốn tạo và nhấn Create là xong, bạn nên chọn mục "Collation = utf8_general_ci" để hỗ trợ lưu trữ Tiếng Việt trong CSDL.
- Sau khi tạo CSDL xong bạn sẽ thấy CSDL này của mình ở cột bên trái.

## Tạo bảng trong CSDL ##

- Chọn CSDL ở cột bên trái, sau đó click vào nút New dưới tên CSDL để tạo bảng.
- Điền tên các côt, kiểu dữ liệu, khóa chính khóa ngoại các kiểu.

Updating...
