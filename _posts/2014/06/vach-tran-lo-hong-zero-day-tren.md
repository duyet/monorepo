---
template: post
title: Vạch trần Lỗ Hổng Zero-day trên Internet Explorer bị Microsoft che dấu
date: "2014-06-03"
category: News
tags:
- The Hacker News
- Bảo mật
modified_time: '2014-06-03T22:56:10.748+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7312586922367376447
thumbnail: https://securitydaily.net/wp-content/uploads/2014/05/internet-explorer-zero-day-700x443.jpg
blogger_orig_url: https://blog.duyet.net/2014/06/vach-tran-lo-hong-zero-day-tren.html
slug: /2014/06/vach-tran-lo-hong-zero-day-tren.html
description: Microsoft đã giữ bí mật lỗ hổng Zero–Day nghiêm trọng  trên Internet Explorer 8 với tất cả chúng ta từ tháng 10 năm 2013.

---

Microsoft đã giữ bí mật lỗ hổng Zero–Day nghiêm trọng  trên Internet Explorer 8 với tất cả chúng ta từ tháng 10 năm 2013.

![](https://securitydaily.net/wp-content/uploads/2014/05/internet-explorer-zero-day-700x443.jpg)

Một lỗ hổng nghiêm trọng Zero day trên Internet Explorer (CVE-2014-1770) được phát hiện bởi Peter ‘corelanc0d3r’ Van Eekhoutte vào tháng Mười năm 2013 vừa mới được công khai ngày hôm nay trên website Zero- Day Initiative (ZDI)

ZDI thông báo đã phát hiện ra lỗ hổng đầu tiên trên Microsoft bởi một nhà nghiên cứu của ZDI, và 4 tháng sau, Microsoft đã phản hồi lại vào tháng Hai năm 2014 và xác nhận lỗ hổng này, nhưng Microsoft đã không khắc phục lỗ hổng cũng như không công khai bất kì chi tiết nào về nó.

Tuy nhiên nhờ có chính sách thông báo công khai 180 ngày của ZDI, Microsoft bị buộc phải công khai các chi tiết về lỗ hổng Zero –Day. ZDI đã cảnh báo Microsoft vài ngày trước đây về tiết lộ công khai lỗ hổng này sau khi hết hạn 180 ngày vào tháng Tư, nhưng Microsoft đã không có câu trả lời nào cả.

Theo Cố vấn bảo mật ZDI, lỗ hổng này là một lỗ hổng zero day, có thể thực hiện việc khai thác từ xa ảnh hưởng đến Internet Explore phiên bản 8 và cho phép một kẻ tấn công từ xa thực hiện một mã độc bất kì thông qua lỗ hổng trên các đối tượng CMarkup.

Một kẻ tấn công có thể lợi dụng lỗ hổng này thông qua các website đã bị tấn công. Thực hiện thành công một cuộc tấn công trên web, một kẻ tấn công có thể kiểm soát nội dung trên các website bị tấn công.

Theo một bài đăng của ZDI: "Trong tất cả các trường hợp, một kẻ tấn công sẽ không có cách nào để buộc người dùng thấy được nội dung được các hacker kiểm soát.  Thay vào đó, một kẻ tấn công sẽ thuyết phục người dùng thực hiện hành động, thông thường bằng cách bảo họ click vào một đường dẫn từ một tin nhắn email hay một tin nhắn nhanh dẫn người dùng đến các website của kẻ tấn công, hoặc là bảo người dùng mở một tệp đính kèm được gửi thông qua email".

Bằng việc khai thác thành công lỗ hổng, một kẻ tấn công có thể đạt được các quyền như người dùng. "Những tài khoản của người dùng dùng thông thường sẽ ít bị ảnh hưởng hơn những người dùng có quyền quản trị."

Nếu bạn đang sử dụng Microsoft Outlook, Microsoft Outlook Express, or Windows Mail để mở các email HTML, thì nó sẽ tự động làm vô hiệu hóa các quyền điều khiển từ Script và ActiveX, giúp giảm các nguy cơ bị khai thác lỗ hổng này từ kẻ tấn công. Tuy nhiên, khi người dùng click vào bất kỳ đường dẫn độc hại nào đó được đính kèm với các email, họ sẽ trở thành nạn nhân và bị kiểm soát thông qua các cuộc tấn công trên web.

Hơn nữa, Người dùng Windows Server 2003, Windows Server 2008, Windows Server 2008 R2, Windows Server 2012, và Windows Server 2012 R2 không cần lo lắng nếu có Cấu Hình Bảo Mật Nâng Cao trên Internet Explorer, bởi vì cấu hình này sẽ làm giảm đi những lỗ hổng này.

Lỗ hổng này vẫn chưa được Microsoft khắc phục và chưa có bản vá nào cho lỗ hổng zero day nghiêm trọng này, vì vậy người dùng Internet Explore vẫn rất dễ bị nhiễm tấn công dạng này.

Lời khuyên là bạn nên chặn ActiveX và Active Scripting và cũng nên cài đặt EMET (Bộ cấu hình bảo mật nâng cao) giúp quản lý các công nghệ bảo mật khiến những kẻ tấn công gặp khó khăn trong việc khai thác lỗ hỏng trên các phần mềm.

Chỉ một vài ngày trước, Công ty bảo mật FireEye cho biết một mã độc thực hiện từ xa tương tụ trên Internet Explorer đã ảnh hưởng đến tất cả các phiên bản của IE.

Theo TheHackerNews
