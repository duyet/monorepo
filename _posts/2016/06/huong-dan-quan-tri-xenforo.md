---
template: post
title: Hướng dẫn quản trị Xenforo
date: "2016-06-05"
author: Van-Duyet Le
tags:
- Xenforo
- Forum
- Tutorials
- PHP
modified_time: '2016-06-07T00:46:20.719+07:00'
thumbnail: https://1.bp.blogspot.com/-Fo89IbwIKK0/V1PIrjm861I/AAAAAAAAXIY/QjZwSJeJUMEFMOE8haRf7tNGdyjPBmqXQCLcB/s1600/Workspace%2B1_007.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5882491229031211530
blogger_orig_url: https://blog.duyet.net/2016/06/huong-dan-quan-tri-xenforo.html
slug: /2016/06/huong-dan-quan-tri-xenforo.html
category: Dev
description: Hướng dẫn quản trị diễn đàn Xenforo. Trích từ tài liệu hướng dẫn sử dụng SHTP Forum.
fbCommentUrl: none
---

Hướng dẫn quản trị diễn đàn Xenforo. Trích từ tài liệu hướng dẫn sử dụng SHTP Forum.
(05-06-2016 by [@labx](https://labx.tech/))

## 0. Tổng quan ##

Hệ thống quản trị diễn đàn Xenforo giúp người quản trị điều chỉnh, quản lý, cấu hình diễn đàn một cách cụ thể và chi tiết nhất.

## 1. Trang quản trị chung ##

Sau khi đăng nhập vào tài khoản quản trị, giao diện hiển trị trang quản trị chung, giúp truy cập đến các chức năng quản lý khác nhau.

Gồm các mục chính:

- Tùy chọn: Tùy chỉnh các thông số, cài đặt của diễn đàn.
- Add-ons: Quản lý, cài đặt các tiện ích bổ sung cho diễn đàn.
- Danh sách thành viên: Quản lý thành viên, quản lý nhóm, phân quyền.
- Giao diện: Quản lý giao diện, thay đổi màu sắc, template.
- Ngôn ngữ: Quản lý ngôn ngữ, dịch thuật.
- Nhánh diễn đàn: Quản lý, phân quyền các chuyên mục của diễn đàn.

[![](https://1.bp.blogspot.com/-Fo89IbwIKK0/V1PIrjm861I/AAAAAAAAXIY/QjZwSJeJUMEFMOE8haRf7tNGdyjPBmqXQCLcB/s640/Workspace%2B1_007.png)](https://1.bp.blogspot.com/-Fo89IbwIKK0/V1PIrjm861I/AAAAAAAAXIY/QjZwSJeJUMEFMOE8haRf7tNGdyjPBmqXQCLcB/s1600/Workspace%2B1_007.png)

## 2. Tùy chỉnh diễn đàn ##
Truy cập trang tùy chỉnh bằng cách vào mục Tùy chọn từ trang tổng quan. Các tùy chọn được chia thành nhiều mục cụ thể. Sau là một số tùy chỉnh chính.

[![](https://2.bp.blogspot.com/-oEUQgtSDUw8/V1PJcwwrZHI/AAAAAAAAXIk/_RQ4dbm7-B8UoY-Y-Wdr8MMh82NzSN1iwCLcB/s640/Selection_009.png)](https://2.bp.blogspot.com/-oEUQgtSDUw8/V1PJcwwrZHI/AAAAAAAAXIk/_RQ4dbm7-B8UoY-Y-Wdr8MMh82NzSN1iwCLcB/s1600/Selection_009.png)

### 2.1. Thông tin chung diễn đàn  ###

[![](https://3.bp.blogspot.com/-d5mOO8XeP3o/V1PK9tf7wDI/AAAAAAAAXIw/bpgJArhsyCk_gEE7YHyCeXdqnFPThrHNwCLcB/s640/Selection_010.png)](https://3.bp.blogspot.com/-d5mOO8XeP3o/V1PK9tf7wDI/AAAAAAAAXIw/bpgJArhsyCk_gEE7YHyCeXdqnFPThrHNwCLcB/s1600/Selection_010.png)
Cho phép tùy chỉnh các thông tin về: Tên diễn đàn, Mô tả, Địa chỉ URL của diễn đàn, Địa chỉ Email (khi gửi mail đến thành viên) ...

[![](https://4.bp.blogspot.com/-85LudrYXW-0/V1PLWDaPrWI/AAAAAAAAXI4/9211hkkVV70bugGo8okntydkatga9d40ACLcB/s640/Selection_011.png)](https://4.bp.blogspot.com/-85LudrYXW-0/V1PLWDaPrWI/AAAAAAAAXI4/9211hkkVV70bugGo8okntydkatga9d40ACLcB/s1600/Selection_011.png)

### 2.2 Appearance ###
Thay đổi Giao diện mặc định và ngôn ngữ mặc định.

[![](https://2.bp.blogspot.com/-AyPckiYXw6Q/V1PMElaPNlI/AAAAAAAAXJE/Py8nDR0Eb9ciDPm9MqIPb8J1JzRjZXhgACLcB/s640/Selection_012.png)](https://2.bp.blogspot.com/-AyPckiYXw6Q/V1PMElaPNlI/AAAAAAAAXJE/Py8nDR0Eb9ciDPm9MqIPb8J1JzRjZXhgACLcB/s1600/Selection_012.png)

### 2.3 Email Options ###

Cấu hình các thông số về Email: Giao thức (mail() hoặc SMTP)

[![](https://3.bp.blogspot.com/-zGDOkuGlxIU/V1PMkYN8x8I/AAAAAAAAXJQ/IIOxe6I7ukQkgeoVq9_09WGQOovmWi0rwCLcB/s640/Selection_013.png)](https://3.bp.blogspot.com/-zGDOkuGlxIU/V1PMkYN8x8I/AAAAAAAAXJQ/IIOxe6I7ukQkgeoVq9_09WGQOovmWi0rwCLcB/s1600/Selection_013.png)

### 2.4 User Registration (Đăng ký thành viên) ###
Các tùy chọn về các yêu cầu khi đăng ký thành viên diễn đàn.

[![](https://1.bp.blogspot.com/-hWD_OnuAO5c/V1POhD4UmfI/AAAAAAAAXJs/SWUnOh0S428lRSHIdB0QMlWOZuxxudaOACLcB/s640/Selection_014.png)](https://1.bp.blogspot.com/-hWD_OnuAO5c/V1POhD4UmfI/AAAAAAAAXJs/SWUnOh0S428lRSHIdB0QMlWOZuxxudaOACLcB/s1600/Selection_014.png)

### 2.5 Bài viết và thảo luận ###

[![](https://2.bp.blogspot.com/-tZTVqJuZR8M/V1PPdZNLxZI/AAAAAAAAXJ4/45Pv8wvZ7gI7jRhWFYHXWRu2q5U8YRW3wCLcB/s640/Selection_015.png)](https://2.bp.blogspot.com/-tZTVqJuZR8M/V1PPdZNLxZI/AAAAAAAAXJ4/45Pv8wvZ7gI7jRhWFYHXWRu2q5U8YRW3wCLcB/s1600/Selection_015.png)

## 3. Quản lý thành viên ##
Truy cập trang quản lý thành từ trang tổng quan

[![](https://1.bp.blogspot.com/-IkqKuN5GsQw/V1PP4COgO4I/AAAAAAAAXKA/7S-AhwH8lDMZaymSIHgv_H3F09P9-GGTACLcB/s640/Selection_016.png)](https://1.bp.blogspot.com/-IkqKuN5GsQw/V1PP4COgO4I/AAAAAAAAXKA/7S-AhwH8lDMZaymSIHgv_H3F09P9-GGTACLcB/s1600/Selection_016.png)

[![](https://3.bp.blogspot.com/-OLYcvb8Ml54/V1PUU5a5eeI/AAAAAAAAXKo/5b9l7sz0wFUT--hWArCOiVYTFJ7xAkFQwCLcB/s640/Selection_019.png)](https://3.bp.blogspot.com/-OLYcvb8Ml54/V1PUU5a5eeI/AAAAAAAAXKo/5b9l7sz0wFUT--hWArCOiVYTFJ7xAkFQwCLcB/s1600/Selection_019.png)

### 3.1 Danh sách thành viên  ###

[![](https://1.bp.blogspot.com/-JNZJTyuUIFY/V1PQtmHuNGI/AAAAAAAAXKQ/zqxiKjRyZ3k9cOlrcVEtjfyNlULr1A5GQCLcB/s640/Selection_017.png)](https://1.bp.blogspot.com/-JNZJTyuUIFY/V1PQtmHuNGI/AAAAAAAAXKQ/zqxiKjRyZ3k9cOlrcVEtjfyNlULr1A5GQCLcB/s1600/Selection_017.png)
Từ trang này có thể thấy nhanh danh sách thành viên. Sử dụng chức năng Filter Items để tìm nhanh. Nhấn vào các liên kết tương ứng để sử dụng các tính năng như trên hình.

### 3.2 Chi tiết thành viên ###
Nhấp vào 1 thành viên, sẽ hiện ra thông tin chi tiết của thành viên đó.

[![](https://4.bp.blogspot.com/-4ievvS9Tpjs/V1PTeKCvfoI/AAAAAAAAXKc/pSIZi3yIrwknWu7-Zj3do_xtBGCUfCMBwCLcB/s640/Workspace%2B1_018.png)](https://4.bp.blogspot.com/-4ievvS9Tpjs/V1PTeKCvfoI/AAAAAAAAXKc/pSIZi3yIrwknWu7-Zj3do_xtBGCUfCMBwCLcB/s1600/Workspace%2B1_018.png)

### 3.3 Nhóm và phân quyền nhóm  ###
Mỗi thành viên có thể thuộc 1 hoặc nhiều nhóm, mỗi nhóm có một số quyền được quản trị viên thiết lập.

[![](https://2.bp.blogspot.com/-youiGri-irk/V1PU3BymnGI/AAAAAAAAXK0/kv0Jq4Pchwk8lykADkPEVNhmUjCFbVy2wCLcB/s640/Selection_020.png)](https://2.bp.blogspot.com/-youiGri-irk/V1PU3BymnGI/AAAAAAAAXK0/kv0Jq4Pchwk8lykADkPEVNhmUjCFbVy2wCLcB/s1600/Selection_020.png)
Chọn vào 1 nhóm và tiến hành phân quyền. Có 3 chế độ cho mỗi quyền: No (Không thiết lập, quyền này có thể được đè), Allow (Được phép) và Nerver (Không được phép).

[![](https://2.bp.blogspot.com/-4nxYPkz1y_k/V1PV1z8EXRI/AAAAAAAAXLA/0zmH4m9Na-8xnSc3ED3fIwU8HKRl5hgqQCLcB/s640/Selection_021.png)](https://2.bp.blogspot.com/-4nxYPkz1y_k/V1PV1z8EXRI/AAAAAAAAXLA/0zmH4m9Na-8xnSc3ED3fIwU8HKRl5hgqQCLcB/s1600/Selection_021.png)

## 4. Giao diện và ngôn ngữ ##

### 4.1 Tùy chỉnh giao diện và màu sắc  ###
Truy cập tùy chọn Giao diện / Hiển thị từ màn hình tổng quan.

[![](https://3.bp.blogspot.com/-vAmpS8jld4g/V1PXX7pbfcI/AAAAAAAAXLM/Xw2GvAe_aRwdMXgYqNeXWdia9eFENboLgCLcB/s640/Selection_022.png)](https://3.bp.blogspot.com/-vAmpS8jld4g/V1PXX7pbfcI/AAAAAAAAXLM/Xw2GvAe_aRwdMXgYqNeXWdia9eFENboLgCLcB/s1600/Selection_022.png)

[![](https://3.bp.blogspot.com/-otFyJcfQxoM/V1PXY2mzFXI/AAAAAAAAXLU/ylN5tr4Eog8N37HEuU_urq8qqStGAUqLQCLcB/s640/Selection_023.png)](https://3.bp.blogspot.com/-otFyJcfQxoM/V1PXY2mzFXI/AAAAAAAAXLU/ylN5tr4Eog8N37HEuU_urq8qqStGAUqLQCLcB/s1600/Selection_023.png)

### 4.2 Color Palette #

Với Color Palette ta có thể thay đổi dễ dàng màu sắc chủ đạo của diễn đàn

[![](https://3.bp.blogspot.com/-kfktLML_yPs/V1PXrICQwUI/AAAAAAAAXLc/BHB2ubSMqHo4GWZe0MVLwjHJIJ5t9_JNgCLcB/s640/Selection_024.png)](https://3.bp.blogspot.com/-kfktLML_yPs/V1PXrICQwUI/AAAAAAAAXLc/BHB2ubSMqHo4GWZe0MVLwjHJIJ5t9_JNgCLcB/s1600/Selection_024.png)

### 4.3 Ngôn ngữ  #

[![](https://4.bp.blogspot.com/-5ahYPP2ZYtg/V1PYVz3BdiI/AAAAAAAAXLo/_9CYduPQFnI3Uh7Kg-8CdALIpQcCZEsHgCLcB/s640/Selection_025.png)](https://4.bp.blogspot.com/-5ahYPP2ZYtg/V1PYVz3BdiI/AAAAAAAAXLo/_9CYduPQFnI3Uh7Kg-8CdALIpQcCZEsHgCLcB/s1600/Selection_025.png)

## 5. Các công cụ (Tools) 

Diễn đàn cũng hỗ trợ nhiều công cụ giúp quản trị viên theo dõi và kiểm soát hệ thống. Truy cập đến trang công cụ thông qua menu.

[![](https://2.bp.blogspot.com/-gi-QlMCgo-Q/V1PZY44-iGI/AAAAAAAAXL4/gwhUIyImwPkKxKrdvFK6P7HhysPhTy_nQCLcB/s640/Selection_026.png)](https://2.bp.blogspot.com/-gi-QlMCgo-Q/V1PZY44-iGI/AAAAAAAAXL4/gwhUIyImwPkKxKrdvFK6P7HhysPhTy_nQCLcB/s1600/Selection_026.png)

### 5.1 Thống kê  #

Thống kê về tần suất truy cập các chức năng diễn đàn (tệp đính kèm, bài viết, thư viện điện tử, tin nhắn, like, ...). Thống kê chi tiết theo 3 mức: Hàng ngày, hàng tuần và hàng tháng. 

[![](https://4.bp.blogspot.com/-O0BQDP6aLaQ/V1PaGItIwLI/AAAAAAAAXME/nFzgFiN1n1swBYWmKQmPVlLslIDypCSCwCLcB/s640/Workspace%2B1_028.png)](https://4.bp.blogspot.com/-O0BQDP6aLaQ/V1PaGItIwLI/AAAAAAAAXME/nFzgFiN1n1swBYWmKQmPVlLslIDypCSCwCLcB/s1600/Workspace%2B1_028.png)

### 5.2 Nhật ký hệ thống #

Nhật ký lưu lại mọi hoạt động diễn đàn: Spam Cleaner Log, Spam Trigger, Admin, Image Proxy, Link Proxy, ...

[![](https://4.bp.blogspot.com/-q3kA60PvYQk/V1PavFHeF0I/AAAAAAAAXMQ/FZNe0KMt-3IO9_P2OXbRRLZ2xAbjqSHvACLcB/s640/Selection_030.png)](https://4.bp.blogspot.com/-q3kA60PvYQk/V1PavFHeF0I/AAAAAAAAXMQ/FZNe0KMt-3IO9_P2OXbRRLZ2xAbjqSHvACLcB/s1600/Selection_030.png)
