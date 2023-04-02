---
template: post
title: Heartbleed, mối đe dọa mới cho mạng Internet toàn cầu
date: "2014-04-13"
category: News
tags:
- Security
- Hacker
- Bảo mật
- https
- News
modified_time: '2014-04-13T11:53:06.550+07:00'
thumbnail: https://1.bp.blogspot.com/-mjb4kpGzPHM/U0oUVgAEU7I/AAAAAAAAGhA/qkJTS3ILPvU/s1600/heartbleed-over-web-address.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3110753202265100640
blogger_orig_url: https://blog.duyet.net/2014/04/heartbleed-moi-e-doa-moi-cho-mang.html
slug: /2014/04/heartbleed-moi-e-doa-moi-cho-mang.html
description: Một lỗ hổng mã hóa có tên Heartbleed đã được gọi là một trong những mối đe dọa an ninh lớn nhất Internet chưa từng thấy. Lỗi này đã ảnh hưởng đến rất nhiều trang web phổ biến, những dịch vụ mà bạn sử dụng hàng ngày như Gmail, Facebook và có thể đã âm thầm tiết lộ thông tin cá nhân của bạn.

---

Một lỗ hổng mã hóa có tên Heartbleed đã được gọi là một trong những mối đe dọa an ninh lớn nhất Internet chưa từng thấy. Lỗi này đã ảnh hưởng đến rất nhiều trang web phổ biến, những dịch vụ mà bạn sử dụng hàng ngày như Gmail, Facebook và có thể đã âm thầm tiết lộ thông tin cá nhân của bạn.

## Heartbleed là gì? ##

Heartbleed (còn được biết đến với tên gọi "Quả tim rỉ máu") là một lỗ hổng bảo mật cực kỳ nghiêm trọng mới được phát hiện hôm 8/4. Về cơ bản, đây là một lỗi bảo mật cho phép tin tặc tiếp cận bộ nhớ máy chủ và đánh cắp những thông tin nhạy cảm của khách hàng chẳng hạn như thông tin đăng nhập, mật khẩu, số thẻ tín dụng.

Heartbleed là một lỗi bảo mật trong giao thức nguồn mở OpenSSL vốn được dùng để mã hóa phần lớn các trang web, bảo vệ tên đăng nhập và mật khẩu của người dùng, cùng với các thông tin nhạy cảm khác đặt trên các trang web an toàn. Tổ chức Lifehacker cho biết có khoảng 66% trang web trên thế giới có thể dùng OpenSSL để mã hóa dữ liệu. Chuyên gia bảo mật Bruce Schneiner ước tính rằng có tới nửa triệu website trên toàn thế giới đang có nguy cơ bị Heartbleed tấn công. Ông đã gọi lỗ hổng Heartbleed là một "thảm họa". Nếu tính trên thang điểm từ 1 - 10 thì lỗ hổng này đáng được đến 11 điểm.

![](https://1.bp.blogspot.com/-mjb4kpGzPHM/U0oUVgAEU7I/AAAAAAAAGhA/qkJTS3ILPvU/s1600/heartbleed-over-web-address.png)

Heartbleed là một lỗi bảo mật trong giao thức nguồn mở OpenSSL.​

Ở thời điểm hiện tại, một số trang web đã chạy các phiên bản vá lỗi OpenSSL mới và đã được an toàn. Trong khi đó, một vài trang web vẫn chưa nâng cấp phiên bản giao thức nhiều năm tuổi có chứa các lỗi nghiêm trọng này. Có một số công cụ giúp bạn sử dụng để tự kiểm tra trang web của mình có dính lỗi bảo mật này không, chẳng hạn như [công cụ này](https://possible.lv/tools/hb/?domain=gmail.com). Và [đây là](https://github.com/musalbas/heartbleed-masstest/blob/master/top1000.txt) một danh sách đầy đủ các trang web được cho thấy là bị dính lỗi bảo mật này, bao gồm cả Yahoo.

## Heartbleed hoạt động như thế nào? ##
Trang web công nghệ The Verge giải thích cơ chế hoạt động của lỗi này khá dễ hiểu, cụ thể là nó sẽ cho phép kẻ tấn công có thể "kéo" 64k bộ nhớ ngẫu nhiên từ một máy chủ bất kỳ bằng phần mềm chúng đang chạy, tương tự như hình thức câu cá vậy. Kẻ tấn công sẽ không thể biết được dữ liệu gồm có những gì trước khi kéo, nhưng chúng có thể lặp đi lặp lại thao tác kéo nhiều lần và cuối cùng sẽ có cơ hội tiếp xúc được nhiều dữ liệu nhạy cảm.

![](https://4.bp.blogspot.com/-wq7EJVzxHts/U0oUnqehHLI/AAAAAAAAGhI/x-hhweaWIn4/s1600/1-43.png)

Yahoo là một trong những trang web bị ảnh hưởng tồi tệ nhất bởi Heartbleed.​

Các khóa mã hóa riêng tư của máy chủ là mục tiêu đặc biệt của tin tặc bởi vì chúng cần thiết được giữ trong bộ nhớ làm việc và có thể dễ dàng được nhận dạng trong số các dữ liệu khác. Nói cách khác, một người dùng nào đó có thể chỉ cần đơn giản kéo một vài bit dữ liệu từ máy chủ, lặp đi lặp lại cho đến khi có được những khóa riêng tư cần thiết để đọc được tất cả thông tin trong đó. Đó chính là mối nguy cơ cho cả doanh nghiệp lẫn người dùng.

## Người dùng cần làm gì? ##
Bạn có đang sử dụng tài khoản Yahoo? Bạn có sử dụng mật khẩu Yahoo của mình cho các trang web khác? Mật khẩu này có khả năng sẽ bị ảnh hưởng của lỗi bảo mật Heartbleed và bạn cần phải thay đổi nó ngay sau khi trang web đã được vá lỗi. Nhưng bởi vì các nhà quản trị hệ thống phải sửa lỗi bằng tay, tốn rất nhiều thời gian, có lẽ bạn sẽ không thể làm được gì cho đến khi các trang web bị xâm nhập được cập nhật phiên bản OpenSSL mới và được thiết lập chế độ bảo mật mới.

Tuy nhiên, các nhà nghiên cứu bảo mật Internet cho rằng, mọi người không nên vội vàng thay đổi mật khẩu của mình sau khi phát hiện "thảm họa" lỗ hổng phần mềm này, vốn có thể phơi bày thông tin người dùng cho tin tặc.

![](https://4.bp.blogspot.com/-slt7T7qPlgM/U0oVJgc5GiI/AAAAAAAAGhQ/V0sThIQBZpM/s1600/list.png)

Danh sách các trang web đã được vá lỗi bảo mật Heartbleed do [Cnet](https://forum.vietdesigner.net/tags/cnet/) cung cấp.​

Mark Schloesser, một nhà nghiên cứu bảo mật của Rapid7 có trụ sở tại Amsterdam (Hà Lan) cho rằng, nếu theo khuyến cáo của Yahoo và BBC rằng mọi người nên thay đổi mật khẩu của họ ngay tức thì (một phản ứng điển hình khi nghi ngờ vấn đề bảo mật bị xâm phạm) có thể làm cho vấn đề càng tồi tệ hơn nếu các máy chủ web chưa được cập nhật để khắc phục lỗ hổng này. Làm như vậy "thậm chí có thể làm tăng cơ hội để tin tặc có được mật khẩu mới thông qua các lỗ hổng" ông Schloesser nói. Bởi vì việc đăng nhập vào một máy chủ an toàn để thay đổi mật khẩu có thể tiết lộ cả mật khẩu cũ lẫn mật khẩu mới cho kẻ tấn công.

Yahoo là một trong những trang web bị ảnh hưởng tồi tệ nhất bởi Heartbleed, nhưng hãng đã sửa được vài thuộc tính chính của họ, bao gồm cả các dịch vụ Flickr và Tumblr, và cho biết họ đang làm việc để thực hiện việc sửa chữa trên phần còn lại. Một số trang web khác cũng đang tiến hành cập nhật. Cho đến lúc này, cách tốt nhất là nên tạm ngưng sử dụng các dịch vụ này cho đến khi chúng hoàn toàn phục hồi, có thể là mất vài ngày hoặc lâu hơn.

Ông Schoessler ước tính là các nhà cung cấp lớn sẽ hoàn thành bản vá lỗi trong vòng 24-48 giờ tới và mọi người nên thay đổi thông tin của họ một khi nhà cung cấp đã cập nhật phiên bản OpenSSL của họ. Người dùng có thể kiểm tra để biết một trang web cụ thể nào đó vẫn còn bị lổ hổng Heartbleed bằng công cụ phát triển bởi [Filippo Valsorda](https://filippo.io/Heartbleed/). Ngoài ra, bạn cũng có thể tham khảo danh sách các trang web đã được vá lỗi bảo mật do trang công nghệ Cnet cung cấp [tại đây](https://www.cnet.com/news/which-sites-have-patched-the-heartbleed-bug/).

> Nguồn: [PCWorld](https://forum.vietdesigner.net/tags/pcworld/)
