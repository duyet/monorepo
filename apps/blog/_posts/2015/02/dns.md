---
title: DNS là gì?
date: '2015-02-23'
author: Duyet
tags:
  - Web
modified_time: '2025-11-09T00:00:00.000+07:00'
slug: /2015/02/dns.html
category: News
description: DNS là từ viết tắt trong tiếng Anh của Domain Name System, là Hệ thống phân giải tên miền được phát minh vào năm 1984 cho Internet. Bạn có thể hiểu DNS như một cái "Danh bạ điện thoại" để tìm trên Internet bằng cách dịch tên máy chủ máy tính thành địa chỉ IP
---

DNS là từ viết tắt trong tiếng Anh của Domain Name System, là Hệ thống phân giải tên miền được phát minh vào năm 1984 cho Internet. Bạn có thể hiểu DNS như một cái "Danh bạ điện thoại" để tìm trên Internet bằng cách dịch tên máy chủ máy tính thành địa chỉ IP:

- Tên trong danh bạ là domain.
- Số điện thoại là địa chỉ IP.

## Chức năng của DNS

Mỗi Website có một tên (là tên miền hay đường dẫn URL: Universal Resource Locator ) và một địa chỉ IP.
Địa chỉ IP gồm 4 nhóm số cách nhau bằng dấu chấm. Khi mở một trình duyệt Web và nhập tên website, trình duyệt sẽ đến thẳng website mà không cần phải thông qua việc nhập địa chỉ IP của trang web.
Quá trình "dịch" tên miền thành địa chỉ IP để cho trình duyệt hiểu và truy cập được vào website là công việc của một DNS server. Các DNS trợ giúp qua lại với nhau để dịch địa chỉ "IP" thành "tên" và ngược lại.
Người sử dụng chỉ cần nhớ "tên", không cần phải nhớ địa chỉ IP (địa chỉ IP là những con số rất khó nhớ).

## Nguyên tắc làm việc của DNS

- Mỗi nhà cung cấp dịch vụ vận hành và duy trì DNS server riêng của mình, gồm các máy bên trong phần riêng của mỗi nhà cung cấp dịch vụ đó trong Internet. Tức là, nếu một trình duyệt tìm kiếm địa chỉ của một website thì DNS server phân giải tên website này phải là DNS server của chính tổ chức quản lý website đó chứ không phải là của một tổ chức (nhà cung cấp dịch vụ) nào khác.
- ICANN (Internet Corporation for Assigned Names and Numbers) hiện nay chịu trách nhiệm quản lý các tên miền và các DNS server trên toàn thế giới (trước đây là INTERNIC). Các tổ chức đăng ký tên miền (registrars) và nhà cung cấp dịch vụ DNS hoạt động dưới sự giám sát của ICANN. Các tổ chức này chỉ quản lý các DNS server và đăng ký tên miền, chứ không có nhiệm vụ phân giải tên cho từng địa chỉ cụ thể.
- DNS có khả năng tra vấn các DNS server khác để có được một cái tên đã được phân giải. DNS server của mỗi tên miền thường có hai việc khác biệt. Thứ nhất, chịu trách nhiệm phân giải tên từ các máy bên trong miền về các địa chỉ Internet, cả bên trong lẫn bên ngoài miền nó quản lý. Thứ hai, chúng trả lời các DNS server bên ngoài đang cố gắng phân giải những cái tên bên trong miền nó quản lý.
- DNS server có khả năng ghi nhớ lại những tên vừa phân giải. Để dùng cho những yêu cầu phân giải lần sau. Số lượng những tên phân giải được lưu lại tùy thuộc vào quy mô của từng DNS.

## Cách sử dụng DNS

Do các DNS có tốc độ biên dịch khác nhau, có thể nhanh hoặc có thể chậm, do đó người sử dụng có thể chọn DNS server để sử dụng cho riêng mình.
Có các cách chọn lựa cho người sử dụng. Sử dụng DNS mặc định của nhà cung cấp dịch vụ (internet), trường hợp này người sử dụng không cần điền địa chỉ DNS vào network connections trong máy của mình. Sử dụng DNS server khác (miễn phí hoặc trả phí) thì phải điền địa chỉ DNS server vào network connections. Địa chỉ DNS server cũng là 4 nhóm số cách nhau bởi các dấu chấm.
