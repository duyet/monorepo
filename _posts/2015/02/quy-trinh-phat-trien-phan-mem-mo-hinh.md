---
template: post
title: Quy trình phát triển phần mềm - Mô hình thác nước (waterfall model)
date: "2015-02-24"
author: Van-Duyet Le
tags:
- Phát triển phần mềm
- Phần mềm
- Software
- Thác nước
- waterfall
modified_time: '2015-03-14T01:06:34.258+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5383059796202101325
blogger_orig_url: https://blog.duyet.net/2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh.html
slug: /2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh.html
category: News
description: "Mô hình thác nước là một mô hình của quy trình phát triển phần mềm, trong đó quy trình phát triển trông giống như một dòng chảy, với các pha được thực hiện theo trật tự nghiêm ngặt và không có sự quay lui hay nhảy vượt pha là: phân tích yêu cầu, thiết kế, triển khai thực hiện, kiểm thử, liên kết và bảo trì."
fbCommentUrl: none

---

Mô hình thác nước là một mô hình của quy trình phát triển phần mềm, trong đó quy trình phát triển trông giống như một dòng chảy, với các pha được thực hiện theo trật tự nghiêm ngặt và không có sự quay lui hay nhảy vượt pha là: phân tích yêu cầu, thiết kế, triển khai thực hiện, kiểm thử, liên kết và bảo trì.

## Nội dung  ##

Người ta thường dẫn bài báo được Winston W. Royce xuất bản vào năm 1970 để giải thích nguồn gốc cho tên gọi "thác nước". Royce đã mô tả ở dạng khái niệm cái mà ngày nay được công nhận với tên gọi "mô hình thác nước", đã bàn luận về những nhược điểm của mô hình này. Trong đó ông cũng chỉ ra rằng mô hình này có thể sẽ được tu sửa thành mô hình lặp.

1. Xác định yêu cầu
2. Thiết kế
3. Xây dựng (hay "triển khai", "mã hóa", "viết mã")
4. Liên kết
5. Kiểm thử và Chỉnh sửa (hay kiểm nghiệm)
6. Cài đặt
7. Bảo trì

## Các bước của mô hình thác nước  ##

Theo mô hình thác nước, người phát triển phải thực hiện từng giai đoạn theo thứ tự nghiêm ngặt.

### 1. Xác đinh yêu cầu ###
Trước hết, giai đoạn "xác định yêu cầu" phải được hoàn tất, kết quả nhận được sẽ là danh sách các yêu cầu đối với phần mềm.

### 2.Thiết kế ###
Sau khi các yêu cầu đã hoàn toàn được xác định, sẽ chuyển sang pha thiết kế, ở pha này người ta sẽ tạo ra các tài liệu dành cho lập trình viên, trong đó mô tả chi tiết các phương pháp và kế hoạch thực hiện các yêu cầu đã được làm rõ ở pha trước. 

### 3. Triển khai ###
Sau khi pha thiết kế hoàn tất, lập trình viên sẽ triển khai thực hiện (mã hóa, viết mã) đồ án họ nhận được. 

### 4. Liên kết ###
Giai đoạn tiếp theo là liên kết các thành phần riêng lẻ đã được những đội lập trình viên khác nhau thực hiện thành một sản phẩm hoàn chỉnh. 

### 5. Kiểm thử và chỉnh sửa ###
Sau khi pha triển khai và pha liên kết hoàn tất, sẽ diễn ra pha kiểm thử và chỉnh sửa sản phẩm; ở giai đoạn này những khiếm khuyết ở các giai đoạn trước đó sẽ bị loại bỏ. 

### 6. Cài đặt ###
Sau đó, sản phẩm phần mềm sẽ được đưa vào sử dụng; 

### 7. Bảo trì ###
Phần bảo trì phần mềm cũng sẽ được bảo đảm bằng cách bổ sung chức năng mới và loại trừ các lỗi.

## Ưu điểm ##

- Các công đoạn được sắp xếp tuần tự, dựa trên kế hoạch.
- Dễ phân công công việc, phân bố chi phí, giám sát công việc.
- Kiến trúc hệ thống tuần tự ổn định (queue)

## Nhược điểm ##

- Không linh hoạt. 
- Các bộ phận của đề án chia ra thành những phần riêng của các giai đoạn. Mối quan hệ giữa các giai đoạn không được thể hiện rõ.
- Chỉ tiếp xúc với khách hàng ở pha đầu tiên, vì vậy không đáp ứng được hết các yêu cầu của khách hàng. 
- Chi phí phát triển dự án cao.
- Khả năng thất bại cao.

## Kết  ##

Như vậy, mô hình thác nước ngụ ý rằng, việc chuyển từ pha phát triển này sang pha khác sẽ diễn ra chỉ sau khi các pha trước đó đã kết thúc hoàn toàn thành công, và không thể quay lui về pha trước đó hay nhảy vượt pha.

Tuy nhiên, tồn tại một số mô hình thác nước biến thể (bao gồm cả mô hình của Royce), trong đó quy trình phát triển đã được mô tả ở trên bị biến đổi không nhiều hoặc cũng có thể bị biến đổi đáng kể.
