---
template: post
title: Quy trình phát triển phần mềm - mô hình xoắn ốc (The Boehm's spiral model)
date: "2015-02-24"
author: Van-Duyet Le
tags:
- Phát triển phần mềm
- Developer
- Xoắn ốc
- Mô hình
modified_time: '2015-03-15T23:09:41.232+07:00'
thumbnail: https://1.bp.blogspot.com/-p_03hnTUKIE/VOttDHeLpDI/AAAAAAAACKU/8Y1yU-4I8Eg/s1600/33349.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3758357170820930874
blogger_orig_url: https://blog.duyet.net/2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh_24.html
slug: /2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh_24.html
category: News
description: Mô hình xoắn ốc có thể được xem là sự kết hợp giữa mô hình thác nước và mô hình mẫu và đồng thời thêm một thành phần mới - phân tích rủi ro.
fbCommentUrl: none

---

Mô hình xoắn ốc có thể được xem là sự kết hợp giữa mô hình thác nước và mô hình mẫu và đồng thời thêm một thành phần mới - phân tích rủi ro.

Trong mô hình xoắn ốc, quy trình phát triển phần mềm được biểu diễn như một vòng xoắn ốc. Các pha trong quy trình phát triển xoắn ốc bao gồm:

- Thiết lập mục tiêu: xác định mục tiêu cho từng pha của dự án.
- Đánh giá và giảm thiểu rủi ro: rủi ro được đánh giá và thực hiện các hành động để giảm thiểu rủi ro.
- Phát triển và đánh giá: sau khi đánh giá rủi ro, một mô hình xây dựng hệ thống sẽ được lựa chọn từ những mô hình chung.
- Lập kế hoạch: đánh giá dự án và pha tiếp theo của mô hình xoắn ốc sẽ được lập kế hoạch.

![](https://1.bp.blogspot.com/-p_03hnTUKIE/VOttDHeLpDI/AAAAAAAACKU/8Y1yU-4I8Eg/s1600/33349.png)

## Mô hình xoắn ốc cải tiến  ##
Mô hình xoáy ốc là cải tiến của mô hình tuần tự và mẫu thử, them vào phân tích rủi ro. Là quá trình lặp hướng mở rộng, hoàn thiện dần.

- Lập kế hoạch: xác lập vấn đề, tài nguyên, thời hạn
- Phân tích rủi ro: xem xét mạo hiểm, tìm giải pháp
- Kỹ nghệ: phát triển một phiên bản của phần mềm( chọn mô hình thích hợp)
- Đánh giá của khách: khách hang đánh giá phiên bản phát triển.

## Nhận xét  ##

- Sau mỗi lần tăng vòng thì có thể chuyển giao kết quả thực hiện được cho khách hành nên các chức năng của hệ thống có thể nhìn thấy sớm hơn.
- Các vòng trước đóng vai trò là mẫu thử để giúp tìm hiểu thêm các yêu cầu ở những vòng tiếp theo.

## Ưu điểm ##

- Phân tích rủi ro dự án được đầy lên làm một phần thiết yếu trong quy trình xoắn ốc để tăng độ tin cậy của dự án
- Xây dựng dự án có sự kết hợp các mô hình khác vào phát triển (Thác nứơc, mô hình mẫu…)
- Cho phép thay đổi tuỳ theo yêu cầu cho mỗi vòng xoắn ốc
- Nó được xem như là một mô hình tổng hợp của các mô hình khác. Không chỉ áp dụng cho phần mềm mà còn phải cho cả phần cứng
- Một rủi ro nào đó không được giải quyết thì chấm dứt dự án
- Các vòng tròn được lặp để đáp ưng được những thay đổi của người dùng
- Kiểm soát rủi ro ở từng giai đoạn phát triển.
- Đánh giá tri phí chính xác hơn các phương pháp khác

## Nhược điểm: ##

- Phức tạp và không thích hợp với các dự án nhỏ và ít rủi ro.
- Cần có kỹ năng tốt về phân tích rủi ro.
- Yêu cầu thay đổi thường xuyên dẫn đến lặp vô hạn
- Chưa được dùng rộng dãi như mô hình thác nước hay là mẫu.
- Đòi hỏi năng lực quản lý

## Kết ##
Hợp với hệ thống lớn có thể phân chia thành nhiều thành phần. Chưa được áp dụng rộng rãi như mô hình thác nước và mẫu thử.
