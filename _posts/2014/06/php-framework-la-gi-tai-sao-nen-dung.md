---
template: post
title: PHP Framework là gì? Tại sao nên dùng framework?
date: "2014-06-02"
category: PHP
tags:
- Framework
- PHP
modified_time: '2014-06-02T12:51:02.746+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2306051633096092269
blogger_orig_url: https://blog.duyet.net/2014/06/php-framework-la-gi-tai-sao-nen-dung.html
slug: /2014/06/php-framework-la-gi-tai-sao-nen-dung.html
description: PHP có một lịch sử phát triển lâu đời và được đông đảo lập trình viên đón nhận, ngày càng phát triển mạnh mẽ hơn. Nhiều người bảo chọn PHP vì lí do mã nguồn mở, miễn phí, dễ triển khai, chạy nhanh (?); nhưng theo mình nghĩ, những ai đã làm việc với PHP và theo đuổi nó vì một lý do rất đơn giản, đó là làm việc với PHP rất thoải mái. 

---

PHP có một lịch sử phát triển lâu đời và được đông đảo lập trình viên đón nhận, ngày càng phát triển mạnh mẽ hơn. Nhiều người bảo chọn PHP vì lí do mã nguồn mở, miễn phí, dễ triển khai, chạy nhanh (?); nhưng theo mình nghĩ, những ai đã làm việc với PHP và theo đuổi nó vì một lý do rất đơn giản, đó là làm việc với PHP rất thoải mái. 
PHP có hướng đối tượng nhưng bạn hoàn toàn có thể "code rừng", không cần triển khai bất cứ lớp nào để hoàn thành công việc. PHP có nhiều hàm build-in, chỉ cần gọi là chạy mà không cần phải nhớ namespace để include/import như các ngôn ngữ khác. Lưu trữ dữ liệu trên biến và mảng của PHP thì quá bá đạo về độ "thoải mái"; biến ko cần khai báo và có thể xài bất kể đâu; mảng lưu theo kiểu một chiều, 2 chiều, đa chiều tùy hứng, truy xuất ngẫu nhiên siu đơn giản với cặp "khóa/giá trị"… Nhưng bài viết này không phải đang nói về ưu điểm của PHP, ưu điểm "thoải mái" của PHP cũng chính là nhược điểm của nó. Với những khối code nhỏ, bạn hoàn toàn có thể chơi theo kiểu rất "rừng rú" của riêng bạn; nhưng với các phần mềm lớn, bạn sẽ bị lạc trong chính khu rừng đó, nào function name, nào là variable name… Bạn sẽ không thể nào tiếp tục phát triển lớn hơn, thời gian bảo trì sẽ gấp nhiều nhiều lần thời gian phát triển… Cũng như nhiều ngôn ngữ lập trình khác, thấy được khó khăn này, người dùng PHP đã xây dựng những framework cho mình. Vậy framework là gì?

## Framewok là gì? ##
Framework có mặt hầu như ở mọi ngôn ngữ lập trình. Vì vậy bài này thực ra mình nói chung chung về framework, PHP thì cũng không nằm ngoại lệ.
Trước hết framework là một "tiêu chuẩn".

Khi sử dụng framework nào, bạn phải tuân thủ những qui định của nó đặt ra: qui định về cách đặt tên biến, đặt tên hàm, tên lớp,… qui định về cách truyền dữ liệu, qui định về luồng xử lý dữ liệu, qui định về cách tổ chức code – file nào đặt ở đâu nhiệm vụ gì…. Tất cả những qui định đó nhằm giúp tạo ra một bản code sạch. Bạn có thể dễ dàng ghi nhớ vị trí – chức năng của các dòng code để chỉnh sửa, hay sử dụng. Nhờ tuân thủ qui định, mà khi làm việc nhóm, người này có thể đọc hiểu code của người kia, có thể sử dụng lại hàm được viết bởi một người khác.

## Thứ hai, framework là một bộ thư viện ##
Không ai có thể phủ nhận, framework luôn cung cấp các function để thực hiện các công việc rất "đời thường" cho lập trình viên. Framework ra đời nhằm mục đích hỗ trợ lập trình viên tập trung vào business rule của ứng dụng, và việc xử lý các yêu cầu chức năng của phần mềm; đỡ bị sao nhãn và sa lầy vào những công việc đến chán ngán vì lặp đi lặp lại như: kết nối database, lấy dữ liệu từ một bảng, quản lý session làm việc, loging,… Những framework tốt sẽ luôn làm những việc đó cho bạn, bởi vì những function này luôn có mặt ở mọi ứng dụng, và nó không cần phải viết đi viết lại.

## Thứ ba, framework là một kiến trúc phần mềm ##
Nếu bạn tự code thuần PHP, bạn sẽ mất nhiều thời gian để suy nghĩ nên tổ chức code thể nào cho đẹp, có thể mở rộng, dễ dàng làm việc giữa các team, làm sao để triển khai các design pattern, triển khai mô hình MVC… yên tâm, một framework đúng nghĩa luôn quy định bạn phải tổ chức theo cách đã được nghiên cứu kỹ lưỡng. Bạn chỉ việc làm theo đúng chỉ dẫn là mọi thứ sẽ chạy trơn tru mà vẫn đáp ứng được các yêu cầu kia. Hầu hết các framework để phát triển web hiện tại đều phát triển theo mô hình MVC, đó là một lợi thế tuyệt vời. Nó sẽ giúp ứng dụng của bạn trở nên gọn gàng, dễ dàng bảo trì và mở rộng. MVC là một vấn đề hơi bự khác, thử đọc định nghĩa tại [wiki tiếng Việt](https://vi.wikipedia.org/wiki/MVC) nha.

## Tại sao lại nên dùng một framework để phát triển dự án ##
Nếu bạn đã đọc phần bên trên, tới đây có lẽ bạn đã có câu trả lời cho mình.
Bạn sẽ mất ít thời gian hơn để phát triển dự án hơn.Với framwork, bạn đã có một khung sườn làm việc. Bạn không mất thời gian phân tích kiến trúc ứng dụng để "sáng tạo" những thứ người khác đã làm rất tốt, viết lại những thứ quá đỗi nhàm chán.
Bạn sẽ có một ứng dụng với mã nguồn sạch đẹp, dễ dàng phát triển, bảo trì.
Team của bạn sẽ làm việc với nhau hiệu quả hơn, hiểu ý nhau hơn, tốc độ hơn.
Bạn sẽ có cơ hội sử dụng lại nhiều đoạn code, những module, extension, plugin- gắng vào ứng dụng của mình; mà không tốn sức để phát triển cho các chức năng đó.
Hiệu năng cũng như bảo mật sẽ được chăm sóc và cập nhật thường xuyên nhờ cộng đồng phát triển framework đó.
Bạn sẽ có nhiều người giúp đỡ hơn. Những lập trình viên cùng sử dụng một framework sẽ tạo nên một cộng đồng. Không ai dám vỗ ngực xưng tui biết hết mọi thứ về framework đó, nhưng một đám đông 3000 người thì vô tư phán điều đó. Mà thường ai đã dùng cái gì rồi, họ cũng muốn mọi người xung quanh dùng giống họ, do đó họ rất nhiệt tình giúp đỡ, tư vẫn và giải đáp những vấn đề của bạn mà ko hề đòi hỏi lợi ích nào. Vậy nên lựa chọn framework có cộng đồng lớn cũng là một tiêu chí hàng đầu.

Hy vọng tới đây, bạn đã bắt đầu hứng thú với việc sử dụng Framework để tạo nên một ứng dụng cho mình; mặc dù khi đến với một framework, bạn cũng phải học rất nhiều để làm quen và tuân thủ được những "tiêu chuẩn" của nó. À, mà dĩ nhiên, để sử dụng được framework bạn phải có hiểu biết về ngôn ngữ nguyên thủy đó, cái gì cũng phải đi từ gốc, hãy chuẩn bị cho mình một nền tảng căn cơ thật tốt, chứ đừng chạy đua theo cuộc đua kỹ thuật công nghệ của các framework. Hãy đặt mình trong tâm thế, bất kỳ framework nào, cho tôi 1 tuần, tôi sẽ dùng được!
