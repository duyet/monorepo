---
template: post
title: PHP - Có gì mới trong PHP 7
date: "2015-08-22"
author: Van-Duyet Le
tags:
- PHP7
- PHP
modified_time: '2015-08-22T03:14:44.335+07:00'
thumbnail: https://4.bp.blogspot.com/-qvsCP3kPz40/VdeEECDHEqI/AAAAAAAACwQ/JD4OFlHjdbo/s1600/php7.jpeg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1319085974422952711
blogger_orig_url: https://blog.duyet.net/2015/08/php-co-gi-moi-trong-php-7.html
slug: /2015/08/php-co-gi-moi-trong-php-7.html
category: PHP
description: Phiên bản stable PHP hiện nay đang được sử dụng là phiên bản PHP 5.6. Sau một số tranh luận thì nhóm phát triển đã quyết định họ sẽ bỏ qua tên phiên bản PHP 6. PHP 6 đã tồn tại trong quá khứ như một dự án thử nghiệm, nhưng vì lý do nào đó chưa hoàn chỉnh.
fbCommentUrl: https://blog.duyet.net/2015/08/php-co-gi-moi-trong-php-7.html

---

Phiên bản stable PHP hiện nay đang được sử dụng là phiên bản PHP 5.6. Sau một số tranh luận thì nhóm phát triển đã quyết định họ sẽ bỏ qua tên phiên bản PHP 6. PHP 6 đã tồn tại trong quá khứ như một dự án thử nghiệm, nhưng vì lý do nào đó chưa hoàn chỉnh.

Để tránh việc người dùng sẽ bị lẫn lộn giữa phiên bản thử nghiệm trước đó và bản phát triển mới nhất này, thì bản phát hành mới sẽ mang tên PHP 7.

![](https://4.bp.blogspot.com/-qvsCP3kPz40/VdeEECDHEqI/AAAAAAAACwQ/JD4OFlHjdbo/s1600/php7.jpeg)

## 1. Core Zend Engine hoàn toàn mới ##
Zend engine đã tạo ra sức mạnh cho PHP từ năm 1999 khi nó được giới thiệu với bản phát hành mới PHP 4. Zend - bạn đừng nhầm lẫn với Zend Framework - là một engine thực thi mã nguồn mở được viết bằng C để thông dịch ngôn ngữ PHP. Loạt PHP 5.X hiện tại sử dụng Zend Engine II tăng cường chức năng của engine ban đầu, bổ sung thêm một mô hình đối tượng mở rộng và nâng cao hiệu suất thực thi đáng kể cho ngôn ngữ này.

PHP 7 có một phiên bản engine hoàn toàn mới có tên gọi là[PHP#NG (Next Generation).](https://wiki.php.net/phpng)

## 2. Tốc độ nhanh gấp hai lần ##
Ưu điểm dễ nhận biết nhất của engine mới PHPNG là sự cải thiện hiệu suất đáng kể. Đội ngũ phát triển của PHPNG đã tái cấu trúc Zend Engine, đáng chú ý là tối ưu hóa việc sử dụng bộ nhớ và bổ sung thêm một bộ biên dịch just-in-time (JIT) cho phép biên dịch vào thời điểm chạy chứ không phải trước khi thực hiện.

Kết quả thu được ra sao? Bạn có thể thấy bảng so sánh tốc độ thực thi như hình dưới đây được cung cấp bởi Zend Performance Team. Bằng cách sử dụng PHP 7 không chỉ giúp code của bạn thực thi nhanh hơn mà bạn cũng sẽ cần ít máy chủ hơn để phục vụ cùng một số lượng user.

[![](https://1.bp.blogspot.com/-bvsVfhq0zCY/VdeEobNR46I/AAAAAAAACwY/8WKnpvl5kbg/s400/frameworks-php7-performance.jpg)](https://1.bp.blogspot.com/-bvsVfhq0zCY/VdeEobNR46I/AAAAAAAACwY/8WKnpvl5kbg/s1600/frameworks-php7-performance.jpg)

## 3. Quản lý lỗi dễ dàng hơn 

Ít nhất cũng phải nói rằng, việc kiểm soát và có khả năng bắt các fatal error chưa bao giờ là công việc dễ dàng đối với các lập trình viên PHP. Engine Exceptions mới sẽ cho phép bạn thay thế những loại lỗi này với các ngoại lệ (exception). Nếu ngoại lệ không bắt được thì PHP sẽ tiếp tục trả về các fatal error giống như các phiên bản PHP 5.X hiện hành.

Các đối tượng \EngineException mới không mở rộng \Exception Base Class. Điều này đảm bảo khả năng tương thích ngược và các kết quả từ hai kiểu exception khác nhau trong việc quản lý lỗi: truyền thống và engine exceptions.

Để cho phép các lập trình viên có thể bắt được cả hai, PHP 7 giới thiệu một Parent Class mới dưới cái tên là \BaseException.

[![](https://4.bp.blogspot.com/-SBPiijvhSbU/VdeE3wQItNI/AAAAAAAACwg/itPw1d2pg38/s1600/engine-exceptions.jpg)](https://4.bp.blogspot.com/-SBPiijvhSbU/VdeE3wQItNI/AAAAAAAACwg/itPw1d2pg38/s1600/engine-exceptions.jpg)

## 4. Hỗ trợ các hệ thống Windows 64-Bit ##
PHP là một thành viên nổi bật của stack [LAMP (Linux - Apache - MySQL - PHP)](http://www.webopedia.com/TERM/L/LAMP.html), có nghĩa môi trường gốc của nó là Linux - nhưng bạn cũng có thể chạy nó trên một hệ thống Windows. Các phiên bản PHP 5.X chưa cung cấp số integer 64-bit hoặc hỗ trợ các tập tin lớn, vì vậy cho đến tận bây giờ các bản build x64 đã được coi là thử nghiệm.

PHP 7 sẽ thay đổi điều này với việc giới thiệu nhất quán hỗ trợ 64-bit nghĩa là cả các số nguyên 64-bit và các file lớn sẽ được hỗ trợ, cho phép bạn tự tin chạy ngôn ngữ này trên hệ điều hành Windows 64-bit của bạn trong tương lai.

## 5. Các toán tử mới Spaceship và Null Coalescing ##
Toán tử Spaceship chạy dưới tên chính thức là [Combined Comparison Operator](https://wiki.php.net/rfc/combined-comparison-operator)(toán tử so sánh kết hợp). Ký hiệu của toán tử mới trông như thế này: <=> (giống như một con tàu vũ trụ đơn giản, nếu bạn chịu khó tưởng tượng).

Toán tử spaceship này trả về 0 nếu cả hai toán hạng bằng nhau, 1 nếu toán hạng bên trái lớn hơn, và -1 nếu toán hạng bên phải lớn hơn. Nó cũng được gọi là một toán tử so sánh three-way, và đã tồn tại trong những ngôn ngữ lập trình phổ biến khác như Perl và Ruby.

[![](https://1.bp.blogspot.com/-8cdCb0-zoQ8/VdeFPFtMasI/AAAAAAAACwo/G8PWAxpL5Z4/s1600/spaceship-operator.jpg)](https://1.bp.blogspot.com/-8cdCb0-zoQ8/VdeFPFtMasI/AAAAAAAACwo/G8PWAxpL5Z4/s1600/spaceship-operator.jpg)

[Toán tử Null Coalescing](https://wiki.php.net/rfc/isset_ternary) được thể hiện bằng hai dấu chấm hỏi (??). Bạn có thể sử dụng nó khi muốn kiểm tra xem liệu một cái gì đó có tồn tại và trả về một giá trị mặc định hay không. Toán tử coalesce trả về kết quả của toán hạng đầu tiên nếu nó tồn tại và không null, và trả về toán hạng thứ hai trong các trường hợp khác.

Đây là cách mà toán tử mới này giảm được thời gian với những việc khai báo cơ bản:

[![](https://1.bp.blogspot.com/-O_p79UCnKkA/VdeFa5KBk3I/AAAAAAAACww/0iEDGZTx408/s1600/null-coalesce-operator.jpg)](https://1.bp.blogspot.com/-O_p79UCnKkA/VdeFa5KBk3I/AAAAAAAACww/0iEDGZTx408/s1600/null-coalesce-operator.jpg)

## 6. Cho phép định nghĩa kiểu dữ liệu khi khai báo ##
Bạn đã bao giờ muốn ngăn chặn các giá trị trả về không mong muốn bằng cách khai báo giá trị trả về của một function? Vâng, bản PHP 7 mới này cho phép các lập trình viên nâng cao chất lượng code của họ với sự giúp đỡ của các khai báo kiểu trả về. Giống Hack Lang của Facebook.

Hình dưới đây mô tả một trường hợp rất đơn giản mà function foo() chắc chắc trả về một mảng.

[![](https://1.bp.blogspot.com/-2zHjiawNYrA/VdeFywqBqEI/AAAAAAAACw4/ttrGtND4lEo/s1600/return-type-declarations.jpg)](https://1.bp.blogspot.com/-2zHjiawNYrA/VdeFywqBqEI/AAAAAAAACw4/ttrGtND4lEo/s1600/return-type-declarations.jpg)

Để mở rộng các tính năng này nhiều hơn, PHP 7 giới thiệu 4 kiểu khai báo mới cho các kiểu vô hướng: int, float, string và bool. [Những kiểu vô hướng](https://wiki.php.net/rfc/scalar_type_hints_v5) mới này cho phép các lập trình viên biểu thị rằng họ đang mong đợi các giá trị integer, float, string, hoặc boolean được trả về. Các kiểu vô hướng mới được giới thiệu bởi PHP 7 cũng sẽ được hỗ trợ bởi Type Hints cho phép các lập trình viên tập trung vào kiểu của các tham số kể từ các bản PHP 5.X. 

## 7. Bổ sung thêm các class Anonymous  ##
PHP 7 cho phép bạn sử dụng các [class vô danh (anonymous)](https://wiki.php.net/rfc/anonymous_classes), đây là một đặc trưng đã có trong những ngôn ngữ lập trình hướng đối tượng khác như C# và Java. Một class anonymous là một class không có tên. Đối tượng mà nó khởi tạo có cùng chức năng như một đối tượng của một lớp có tên.

Cú pháp giống như chúng ta sử dụng trong các class PHP truyền thống, chỉ có thiếu cái tên class. Nếu các lớp vô danh (anonymous classes) được sử dụng tốt, chúng có thể làm tăng tốc độ thực thi. Các lớp vô danh là tuyệt vời khi một class chỉ được sử dụng một lần trong suốt quá trình thực thi và trong những trường hợp một class không cần phải được ghi tài liệu.

[![](https://4.bp.blogspot.com/-w1THC0286Xk/VdeGMKnQKMI/AAAAAAAACxA/IicIXCkqa0Q/s1600/anonymous-classes.jpg)](https://4.bp.blogspot.com/-w1THC0286Xk/VdeGMKnQKMI/AAAAAAAACxA/IicIXCkqa0Q/s1600/anonymous-classes.jpg)

## 8. Dễ dàng hơn khi Imports trong cùng Namespace ##
Đặc trưng mới [Group Use Declarations](https://wiki.php.net/rfc/group_use_declarations) sẽ là một món quà đáng giá dành cho những ai muốn import nhiều class từ cùng namespace. Cú pháp mới cắt bỏ sự rườm rà, làm cho code của bạn trở nên gọn gàng và dễ nhìn hơn, và giúp tiết kiệm cho bạn rất nhiều thời gian ngồi gõ code.

Nó cũng sẽ giúp việc đọc code và debug trở nên dễ dàng hơn, việc khai báo sử dụng group giúp bạn xác định các import thuộc về cùng module.

[![](https://3.bp.blogspot.com/-MsDvGvGIWnU/VdeGdi-gG1I/AAAAAAAACxI/WbiQQB2x8oQ/s1600/group-use-declarations.jpg)](https://3.bp.blogspot.com/-MsDvGvGIWnU/VdeGdi-gG1I/AAAAAAAACxI/WbiQQB2x8oQ/s1600/group-use-declarations.jpg)
