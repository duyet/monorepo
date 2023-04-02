---
template: post
title: 'Unit test và Function test '
date: "2015-12-21"
author: Van-Duyet Le
tags:
- Test
modified_time: '2016-01-11T01:59:18.744+07:00'
thumbnail: https://3.bp.blogspot.com/-k9Gxf_MV1Gg/Vnfrm5xSgxI/AAAAAAAAMMs/bicR-4BjnmU/s1600/unit-test.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8004927281160524746
blogger_orig_url: https://blog.duyet.net/2015/12/unit-test-va-function-test.html
slug: /2015/12/unit-test-va-function-test.html
category: Javascript
description: Một hoạt động mang tính sống còn trong các dự án sản xuất hoặc gia công phần mềm, đó là kiểm thử phần mềm (testing).
fbCommentUrl: none
---

Một hoạt động mang tính sống còn trong các dự án sản xuất hoặc gia công phần mềm, đó là kiểm thử phần mềm (testing).

![](https://3.bp.blogspot.com/-k9Gxf_MV1Gg/Vnfrm5xSgxI/AAAAAAAAMMs/bicR-4BjnmU/s1600/unit-test.jpg)

## Kiểm thử phần mềm là gì? ##
Thực ra KTPM là công việc mà bất cứ người nào từng tham gia phát triển phần mềm (PTPM) đều biết và từng làm.
Theo nghĩa thông thường nhất, KTPM bao gồm việc "chạy thử" PM hay một chức năng của PM, xem nó "chạy" đúng như mong muốn hay không. Việc kiểm tra này có thể thực hiện từng chặng, sau mỗi chức năng hoặc module được phát triển, hoặc thực hiện sau cùng, khi PM đã được phát triển hoàn tất.

## Unit Test ##

Unit Test – Kiểm tra mức đơn vị

Để có thể hiểu rõ về Unit Test, khái niệm trước tiên ta cần làm rõ: thế nào là một đơn vị PM (Unit)? 

Một Unit là một thành phần PM nhỏ nhất mà ta có thể kiểm tra được. Theo định nghĩa này, các hàm (Function), thủ tục (Procedure), lớp (Class), hoặc các phương thức (Method) đều có thể được xem là Unit.

Vì Unit được chọn để kiểm tra thường có kích thước nhỏ và chức năng hoạt động đơn giản, chúng ta không khó khăn gì trong việc tổ chức, kiểm tra, ghi nhận và phân tích kết quả kiểm tra. Nếu phát hiện lỗi, việc xác định nguyên nhân và khắc phục cũng tương đối dễ dàng vì chỉ khoanh vùng trong một đơn thể Unit đang kiểm tra. Một nguyên lý đúc kết từ thực tiễn: thời gian tốn cho Unit Test sẽ được đền bù bằng việc tiết kiệm rất nhiều thời gian và chi phí cho việc kiểm tra và sửa lỗi ở các mức kiểm tra sau đó. 

Unit Test thường do lập trình viên thực hiện. Công đoạn này cần được thực hiện càng sớm càng tốt trong giai đoạn viết code và xuyên suốt chu kỳ PTPM. Thông thường, Unit Test đòi hỏi kiểm tra viên có kiến thức về thiết kế và code của chương trình. Mục đích của Unit Test là bảo đảm thông tin được xử lý và xuất (khỏi Unit) là chính xác, trong mối tương quan với dữ liệu nhập và chức năng của Unit. Điều này thường đòi hỏi tất cả các nhánh bên trong Unit đều phải được kiểm tra để phát hiện nhánh phát sinh lỗi. Một nhánh thường là một chuỗi các lệnh được thực thi trong một Unit, ví dụ: chuỗi các lệnh sau điều kiện If và nằm giữa then ... else là một nhánh. Thực tế việc chọn lựa các nhánh để đơn giản hóa việc kiểm tra và quét hết Unit đòi hỏi phải có kỹ thuật, đôi khi phải dùng thuật toán để chọn lựa.

Cũng như các mức kiểm tra khác, Unit Test cũng đòi hỏi phải chuẩn bị trước các tình huống (test case) hoặc kịch bản (script), trong đó chỉ định rõ dữ liệu vào, các bước thực hiện và dữ liệu mong chờ sẽ xuất ra. Các test case và script này nên được giữ lại để tái sử dụng.

## Integration Test  ##

Integration Test – Kiểm tra tích hợp

Integration test kết hợp các thành phần của một ứng dụng và kiểm tra như một ứng dụng đã hoàn thành. Trong khi Unit Test kiểm tra các thành phần và Unit riêng lẻ thì Intgration Test kết hợp chúng lại với nhau và kiểm tra sự giao tiếp giữa chúng. 

Integration Test có 2 mục tiêu chính:

- Phát hiện lỗi giao tiếp xảy ra giữa các Unit.
- Tích hợp các Unit đơn lẻ thành các hệ thống nhỏ (subsystem) và cuối cùng là nguyên hệ thống hoàn chỉnh (system) chuẩn bị cho kiểm tra ở mức hệ thống (System Test).

Trong Unit Test, lập trình viên cố gắng phát hiện lỗi liên quan đến chức năng và cấu trúc nội tại của Unit. Có một số phép kiểm tra đơn giản trên giao tiếp giữa Unit với các thành phần liên quan khác, tuy nhiên mọi giao tiếp liên quan đến Unit thật sự được kiểm tra đầy đủ khi các Unit tích hợp với nhau trong khi thực hiện Integration Test.

Trừ một số ít ngoại lệ, Integration Test chỉ nên thực hiện trên những Unit đã được kiểm tra cẩn thận trước đó bằng Unit Test, và tất cả các lỗi mức Unit đã được sửa chữa. Một số người hiểu sai rằng Unit một khi đã qua giai đoạn Unit Test với các giao tiếp giả lập thì không cần phải thực hiện Integration Test nữa. Thực tế việc tích hợp giữa các Unit dẫn đến những tình huống hoàn toàn khác.

Một chiến lược cần quan tâm trong Integration Test là nên tích hợp dần từng Unit. Một Unit tại một thời điểm được tích hợp vào một nhóm các Unit khác đã tích hợp trước đó và đã hoàn tất (passed) các đợt Integration Test trước đó. Lúc này, ta chỉ cần kiểm tra giao tiếp của Unit mới thêm vào với hệ thống các Unit đã tích hợp trước đó, điều này làm cho số lượng kiểm tra sẽ giảm đi rất nhiều, sai sót sẽ giảm đáng kể.

Có 4 loại kiểm tra trong Integration Test:

- Kiểm tra cấu trúc (structure): Tương tự White Box Test (kiểm tra nhằm bảo đảm các thành phần bên trong của một chương trình chạy đúng), chú trọng đến hoạt động của các thành phần cấu trúc nội tại của chương trình chẳng hạn các lệnh và nhánh bên trong.
- Kiểm tra chức năng (functional): Tương tự Black Box Test (kiểm tra chỉ chú trọng đến chức năng của chương trình, không quan tâm đến cấu trúc bên trong), chỉ khảo sát chức năng của chương trình theo yêu cầu kỹ thuật.
- Kiểm tra hiệu năng (performance): Kiểm tra việc vận hành của hệ thống.
- Kiểm tra khả năng chịu tải (stress): Kiểm tra các giới hạn của hệ thống.
