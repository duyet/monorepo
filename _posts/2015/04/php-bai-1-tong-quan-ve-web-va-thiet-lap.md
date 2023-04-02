---
template: post
title: PHP - Tổng quan về Web và thiết lập môi trường để lập trình PHP
date: "2015-04-16"
author: Van-Duyet Le
tags:
- Training
- PHP
- Courses
modified_time: '2015-04-18T20:57:32.802+07:00'
thumbnail: https://4.bp.blogspot.com/-QxU1LVBUcsA/VS6XNXt1ozI/AAAAAAAACRk/Og_wF5j7WDM/s1600/mohinh01.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4963808330081956003
blogger_orig_url: https://blog.duyet.net/2015/04/php-bai-1-tong-quan-ve-web-va-thiet-lap.html
slug: /2015/04/php-bai-1-tong-quan-ve-web-va-thiet-lap.html
category: PHP
description: Hơn 70% website hiện tại trên thế giới phát triển trên nền ngôn ngữ PHP là minh chứng cụ thể cho thấy đây là một ngôn ngữ mạnh mẽ, phổ biến, dễ sử dụng để phát triển Web trong thời điểm hiện tại. Có thể kể đến một số website hiện tại đang sử dụng PHP là ngôn ngữ nền tảng như Facebook, Wikipedia, Yahoo, Photobucket,…
fbCommentUrl: none

---

Hơn 70% website hiện tại trên thế giới phát triển trên nền ngôn ngữ PHP là minh chứng cụ thể cho thấy đây là một ngôn ngữ mạnh mẽ, phổ biến, dễ sử dụng để phát triển Web trong thời điểm hiện tại. Có thể kể đến một số website hiện tại đang sử dụng PHP là ngôn ngữ nền tảng như Facebook, Wikipedia, Yahoo, Photobucket,…
Hy vọng qua loạt bài viết về PHP cơ bản, mọi người có thể tự tin xây dựng cho riêng mình một trang cá nhân từ PHP.

## Hiểu về cách mà 1 trang web hoạt động ##
Đầu tiên mình giới thiệu về cách mà 1 trang web hoạt động nhé. Web hoạt động theo mô hình Client-Server dưới đây:

![](https://4.bp.blogspot.com/-QxU1LVBUcsA/VS6XNXt1ozI/AAAAAAAACRk/Og_wF5j7WDM/s1600/mohinh01.jpg)

Trong đó:

- Web Client thì các bạn đã biết rồi, là các trình duyệt Web.
- Web Server là máy tính lưu trữ các website.

### Quy trình hoạt động ###

1. Người duyệt xem web truy cập vào trang http://uit.edu.vn
2. Hệ thống DNS sẽ xác định IP của UIT là 118.69.123.137
3. Yêu cầu Request của máy Web Client sẽ chuyển đến máy Web Server có địa chỉ IP 118.69.123.137.
4. Máy Web Server sẽ xử lý yêu cầu bằng PHP, lấy thêm cơ sở dữ liệu ở Database Server.
5. Rồi gởi trả về 1 trang HTML cho trình duyệt Web, rồi trình duyệt sẽ xử lý để hiển thị ra cho chúng ta xem nội dung trang chủ UIT.

Vậy theo như trên, thì để có 1 trang web hoàn chỉnh chúng ta cần phải biết những gì?

- Ngôn ngữ PHP để xử lý.
- Ngôn ngữ để truy vấn cơ sở dữ liệu (chúng ta sẽ được học MySQL)
- Ngôn ngữ cấu trúc siêu văn bản HTML (là kết quả trả về cho trình duyệt do PHP xử lý tạo ra)
- Một chút CSS (để định dang màu sắc, bố cục, … trang web), Javascript.

Sau đây là các khái niệm cơ bản:

## PHP là gì? ##

- PHP viết tắt của Hypertext Preprocessor.
- PHP không ăn được :))
- Cú pháp PHP có nhiều điểm tương đồng với C/C++
- PHP là một ngôn ngữ lập trình server-side scripting (tức là phía server ấy, thắc mắc hỏi sau nha) được thực hiện trên máy chủ.
- PHP hỗ trợ rất nhiều cơ sở dữ liệu (MySQL, Informix, Oracle, Sybase, Solid, PostgreSQL, Generic ODBC, vv)
- PHP là một phần mềm mã nguồn mở.

## HTML là gì? ##

- HTML là viết tắt của cụm từ Hypertext Markup Language (Hiểu nghĩa là "Ngôn ngữ đánh dấu siêu văn bản bằng thẻ").
- HTML không phải là một ngôn ngữ lập trình máy tính mà nó là một ngôn ngữ sử dụng các thẻ html để biểu diễn các trang web.
- ISC Courses cũng có 1 lớp Static Web, các bạn chú ý theo học song song nhé. Để biết thêm HTML là gì thì bấm Ctrl + U :))

## Để học PHP cần những gì? ##

- Một chiếc máy tính.
- Một trình duyệt web.
- Một trình soạn thảo văn bản (ở đây mình sử dụng Notepad++ hoặc Sublime Text nhé).
- Một chút đam mê.
- Một cuốn tập (sắm ngay đi nhé).

## Cách cài đặt Web Server trên máy Localhost ##

Một Web Server được cấu thành từ hiều thứ như Apache, PHP, MySQL, …. được cài đặt trên Server. 

Để thuận tiện học thiết kế web, chúng ta cài đặt máy tính của mình chương trình web server để máy tính của mình trở thành một localhost nhằm upload các website và xem các trang web. Sau đây mình sẽ hướng dẫn sử dụng bộ công cụ XAMPP để tạo 1 localhost.

## Cài đặt XAMPP trên Windows ##

Do đa số mọi người sử dụng Window, còn ai sử dụng Linux thì các bạn contacts mình hoặc đợi  bài hướng dẫn chi tiết sau nha. 

XAMPP là 1 bộ cài sẵn PHP + Apache + MySQL + Perl, chỉ cần cài XAMPP vào là đã có ngay 1 Web Server để học PHP.

1. Truy cập https://www.apachefriends.org/index.html chọn download XAMPP for Windows (139MB)

![](https://1.bp.blogspot.com/-HwHuWz4RnR0/VS6YAPe2tOI/AAAAAAAACRs/Ej7wPbfZqys/s1600/XAMPP-Installers-and-Downloads-for-Apache-Friends.png)

Tải về, sau đó chạy file cài đặt để cài XAMPP, cứ Next, Next, … =]]

![](https://3.bp.blogspot.com/-c05u5w1vsAk/VS6YKfrCqbI/AAAAAAAACR0/jHxJi6G_AQw/s1600/XAMPP_1.png)

![](https://3.bp.blogspot.com/-UIltvre7bd4/VS6YQ9sUBGI/AAAAAAAACR8/wM8YZ12FdN4/s1600/XAMPP_2.png)

![](https://4.bp.blogspot.com/-91ingxFr8xI/VS6YacV_VzI/AAAAAAAACSE/s6ZFBINdGyw/s1600/XAMPP_3.png)

![](https://2.bp.blogspot.com/-0PW3KP4C50Y/VS6YaH2LJSI/AAAAAAAACSM/DwNzOHlnCDU/s1600/XAMPP_4.png)

![](https://3.bp.blogspot.com/-dwjRQ3TFgPM/VS6Yac-eg0I/AAAAAAAACSI/AhSg7-Vx8jE/s1600/XAMPP_5.png)

Chờ cho nó load xong. Vậy  là ta đã có 1 Web Server, bật Server lên nào. Đầu tiên chạy Xampp Control Panel. Đây là bảng điều khiển để bật các dịch vụ, chúng ta cần chạy Apache, sau này sẽ cần thêm MySQL nữa.

Nhấn Start để chạy Localhost

![](https://1.bp.blogspot.com/-sG--csszEzU/VS6YtZ48u_I/AAAAAAAACSc/gIQ9igulGuY/s1600/XAMPP_6.png)

Mở trình duyệt lên, gõ vào thanh địa chỉ [http://localhost/ ](http://localhost/%C2%A0)

Tadaaa, nếu ra được như hình thế này thì đã thành công rồi nhé.
(Do mình xài nhiều chương trình khác nên mình sử dụng cổng 81, cái bạn cứ vào http://localhost/ bình thường nhé)

![](https://1.bp.blogspot.com/-7EjLLiH8Dlw/VS6ZCyrTX6I/AAAAAAAACSs/5-uu3vV3SUs/s1600/XAMPP_7.png)

Bây giờ bạn vào thư mục cài đặt XAMPP, chúng ta sẽ thấy cấu trúc như sau:

![](https://2.bp.blogspot.com/-6NVz_DKATUo/VS6ZK6Af9cI/AAAAAAAACS0/AygSZVv6Rrk/s1600/XAMPP_8.png)

Một trang Web PHP được viết thành nhiều file có đuôi .php, đặt trong nhiều thư mục khác nhau. Thư mục htdocs sẽ là nơi lưu tất cả các script php hay web của chúng ta sau này.

## Cài đặt trình soạn thảo văn bản ##
Để viết code PHP bạn có thể viết bằng bất cứ trình soạn thảo text nào như notepad++, Sublime text, …. Nhưng mình ưu tiên khuyến khích các bạn sử dụng Sublime Text vì gọn nhẹ, nhiều Plugin hỗ trợ, ….

Để cài đặt, đầu tiên download file cài đặt từ trang chủ Sublime: [http://www.sublimetext.com](http://www.sublimetext.com/)

![](https://1.bp.blogspot.com/-dRn-R8REbSo/VS6ZZk-jstI/AAAAAAAACS8/8L9myQJvDk0/s1600/Screenshot-from-2014-10-13-204458.png)

Chi tiết cách sử dụng các bạn xem thêm tại đây nhé, rất chi tiết: [https://www.izwebz.com/newbie/huong-dan-dung-sublime-text-2/](https://www.izwebz.com/newbie/huong-dan-dung-sublime-text-2/)

## Kết ##
Đến đây thì bạn đã có đầy đủ các công cụ để học PHP rồi nhé :))

Ở bài sau chúng ta sẽ được biết qua các khái niệm, quy tắc, hàm, biến, hằng, …

Trong khi đợi các bài viết tiếp theo của khóa học, các bạn có thể tham khảo trước về cú pháp PHP tại W3Schools [http://www.w3schools.com/php/default.asp](http://www.w3schools.com/php/default.asp)
