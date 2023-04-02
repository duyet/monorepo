---
template: post
title: " Open Source - Tìm hiểu về giấy phép Apache"
date: "2015-04-11"
author: Van-Duyet Le
tags:
- Open Source
- Apache
- Giấy phép nguồn mở
modified_time: '2015-04-11T14:13:30.700+07:00'
thumbnail: https://3.bp.blogspot.com/-1HhLBU4pQYg/VSi7A9h4lRI/AAAAAAAACPo/ujnaYYl6GV4/s1600/mantle-asf.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1401252060138014542
blogger_orig_url: https://blog.duyet.net/2015/04/open-source-tim-hieu-ve-giay-phep-apache.html
slug: /2015/04/open-source-tim-hieu-ve-giay-phep-apache.html
category: News
description: Giấy phép Apache là giấy phép mã nguồn mở được soạn ra bởi Tổ chức phần mềm Apache (ASF – Apache Software Foundation).
fbCommentUrl: none

---

Giấy phép Apache là giấy phép mã nguồn mở được soạn ra bởi Tổ chức phần mềm Apache (ASF – Apache Software Foundation).

![](https://3.bp.blogspot.com/-1HhLBU4pQYg/VSi7A9h4lRI/AAAAAAAACPo/ujnaYYl6GV4/s1600/mantle-asf.png)

## 1. Nhà phát hành 

Giấy phép Apache là giấy phép mã nguồn mở được soạn ra bởi Tổ chức phần mềm Apache (ASF – Apache Software Foundation).

Tất cả mọi phần mềm do ASF phát hành đều mang giấy phép Apache. Những dự án không thuộc ASF nhưng vẫn mang giấy phép Apache, cho đến tháng 7 năm 2009 là vào khoảng 5000 dự án.

Phiên bản mới nhất của Apache là 2.0 [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

ASF và Tổ chức phần mềm tự do (FSF) đều công nhận giấy phép Apache 2.0 là một giấy phép phần mềm tự do, tương thích với phiên bản giấy phép GNU 3.0.

## 2. Nội dung chính 

- Giống như các giấy phép mã nguồn mở khác, giấy phép Apache cho phép người dùng tự do sự dụng phần mềm với bất kì mục đích nào, tự do phân phối, tự do sửa đổi, tự do phân phối bản sửa đổi mình làm (đoạn 3 của giấy phép).
- Giấy phép Apache không yêu cầu bản sửa đổi của phần mềm phải được phân phối dưới cùng giấy phép với bản gốc, cũng không yêu cầu bản sửa đổi phải được phân phối dưới dạng mã nguồn mở. Giấy phép Apache chỉ yêu cầu có một thông báo nhắc nhở người nhận rằng giấy phép Apache đã được sử dụng trong sản phẩm họ nhận được.

Như vậy, trái ngược với các giấy phép Copyleft, người nhận được những bản sửa đổi của chương trình mang giấy phép Apache cũng không nhất thiết phải nhận toàn bộ những quyền trên. Nói cách khác là họ có nhận được quyền sử dụng chương trình và mã nguồn theo cách họ muốn, kể cả việc giữ lại mã nguồn cho riêng mình (đoạn 4 của giấy phép).

Có hai file cần được đặt trong thư mục gốc khi phân phối chương trình:

1. LICENSE: bản copy của chính giấy phép MIT.
2. NOTICE: văn bản chú thích tên của các thư viện đã dùng, kèm tên người phát triển.
3. Trong mỗi tệp tin đã được cấp phép, bất kì thông tin về bản quyền và bằng sáng chế trong bản phân phối lại phải được giữ nguyên như ở bản gốc, và ở mỗi tệp tin đã được chỉnh sửa phải thêm vào ghi chú là đã được chỉnh sửa khi nào.

Giấy phép Apache không yêu cầu trích dẫn toàn bộ giấy phép vào sản phẩm hay tệp tin đính kèm bản phân phối, mà chỉ cần thêm phần thông báo có chứa đường link tới website chứa giấy phép (GNU 3.0 cũng đã áp dụng cách này). Khi đó, người dùng chỉ thấy thông báo ngắn gọn như sau:

```
Copyright [yyyy] [name of copyright owner]
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
```

So với giấy phép BSD, Apache có nội dung chặt chẽ hơn trong các điều khoản và duy trì quyền sở hữu trí tuệ (BSD chỉ có 3 yêu cầu ngắn gọn trong giấy phép, trong khi Apache có tới 9 khoản mục lớn).

## 3. Các phần mềm sử dụng giấy phép Apache ##
Mặc dù có nhiều phần mềm không phải do ASF phát hành cũng mang giấy phép Apache, song nổi tiếng và được sử dụng nhiều nhất vẫn là Apache Server, phần mềm giao tiếp dành cho máy chủ. Ngay từ khi ra đời Apache đã có thể cạnh tranh với chương trình máy chủ của Nescape, và tới nay thì Apache chiếm khoảng hơn 60% thị phần máy chủ thế giới.

Bên cạnh Apache Server, còn có những phần mềm khác sử dụng giấy phép Apache như:

- Apache Cocoon — một chương trình nền cho ứng dụng web
- XAMPP — gói ứng dụng web gồm Apache và MySQL
- Apache Axis2 – Chương tình nền cho dịch vụ web (xử lí được cả ngôn ngữ Java & C) 
