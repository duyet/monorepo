---
template: post
title: URLs là UI
date: "2017-07-20"
author: Van-Duyet Le
tags:
- Web Design
- Website
- UX
- URL
- Web
- UI
modified_time: '2017-07-20T22:29:37.063+07:00'
thumbnail: https://2.bp.blogspot.com/-Be1T1kU3SNE/WXDK8fI25CI/AAAAAAAAmP8/hNT-xyX6Z6cwW1qoAEx6D3WaW5nYZ8vTQCK4BGAYYCw/s1600/funny-newspaper-URL-job-application.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4609733901982004412
blogger_orig_url: https://blog.duyet.net/2017/07/urls-are-ui.html
slug: /2017/07/urls-are-ui.html
category: Web
description: URLs are UI - mình đã nghe cái này nhiều và từ lâu rồi. Điều này hết sức rõ ràng và mình thấy hoàn toàn đúng.
fbCommentUrl: none
---

URLs are UI - mình đã nghe cái này nhiều và từ lâu rồi. Điều này hết sức rõ ràng và mình thấy hoàn toàn đúng.

[![](https://2.bp.blogspot.com/-Be1T1kU3SNE/WXDK8fI25CI/AAAAAAAAmP8/hNT-xyX6Z6cwW1qoAEx6D3WaW5nYZ8vTQCK4BGAYYCw/s640/funny-newspaper-URL-job-application.jpg)](https://2.bp.blogspot.com/-Be1T1kU3SNE/WXDK8fI25CI/AAAAAAAAmP8/hNT-xyX6Z6cwW1qoAEx6D3WaW5nYZ8vTQCK4BGAYYCw/s1600/funny-newspaper-URL-job-application.jpg)

Như J[akob Nielsen nói năm 1999](https://www.nngroup.com/articles/url-as-ui/), hay [Tim Berners-Lee](https://www.w3.org/Provider/Style/URI), URL góp phần tăng trải nghiệm người dùng, là một phần của UI, thường có tính chất như:

- domain name dễ nhớ và dễ đọc
- URL ngắn
- URL dễ gõ
- thể hiện được cấu trúc site
- không bị thay đổi theo thời gian
- ...

Các lập trình viên mà mình thấy, đa số rất hay bỏ qua hoặc không quá chú trọng trong việc thiết kế URL.

## Shareable URL ##
Lỗi un-shareable URL, ví dụ chia sẻ một đoạn url, copy-paste và bạn hình dung người nhận được như thế này: [https://duyet.net/result.php](https://duyet.net/result.php)

Đây là trang trả về một kết quả tìm kiếm và trên URL không chứa bất cứ param nào, bởi kết quả phụ thuộc vào những gì người dùng nhập vào form trước đó. Dẫn đến người được chia sẻ khi nhấp vào và URL không khả dụng. Với những người không rành về công nghệ sẽ gặp khó khăn khi chia sẻ những đường link như thế.

Cách thiết kế shareable URL rất đơn giản: [https://duyet.net/result.php?q=keyword](https://duyet.net/result.php?q=keyword)

## Genius URL  ##
Một ví dụ URL của Stack Overflow: [https://stackoverflow.com/users/4749668/van-duyet-le](https://stackoverflow.com/users/4749668/van-duyet-le)
Mình có thể thấy:

- URL thể hiện được structure của website, mình đang xem trang thông tin user.
- Quan trọng nhất là ID: 4749668, bạn có thể thử truy cập [https://stackoverflow.com/users/4749668](https://stackoverflow.com/users/4749668) hoặc [https://stackoverflow.com/u/4749668](https://stackoverflow.com/u/4749668) đều được, ta thấy dù username có thay đổi thì vẫn truy cập được URL thông qua ID cố định. URL lại ngắn và dễ nhận biết.
- Một ví dụ khác như link bài viết [https://stackoverflow.com/questions/45210398/why-does-map-of-not-allow-null-keys-and-values](https://stackoverflow.com/questions/45210398/why-does-map-of-not-allow-null-keys-and-values) dù tiêu đề có thay đổi, link vẫn truy cập được. Bạn có thể chia sẻ link ngắn gọn bằng cách bỏ phần text phía sau. 

## URLs weren't a UX priority ##
Trong một số trường hợp, người ta lại không ưu tiên URL cho trải nghiệm người dùng. Ví dụ URL chứa token, hay để tiện cho người dùng.

Như URL của OneDrive [https://onedrive.live.com/?id=root&cid=1651FB17955FDADD](https://onedrive.live.com/?id=root&amp;cid=1651FB17955FDADD) vs Dropbox [https://www.dropbox.com/home/Tailieu/python](https://www.dropbox.com/home/Tailieu/python)

Những ai là lập trình viên đều có thể thông cảm với URL của OneDrive, nó giúp việc lập trình đơn giản hơn và dễ quản lý hơn, chỉ cần load folder hoặc file có id phù hợp là được, chứ không phải nhập nhằng check authentication như Dropbox.

## Kết ##
Tóm lại, URL cũng là một phần khá là qua trọng trong trải nghiệm người dùng. Khi thiết kế, bạn cũng nên chú ý một chút đến URL của mình, đảm bảo các tiêu chí ngắn gọn, dễ nhớ, không thay đổi, ...

Tham khảo

- [URL as UI](https://www.nngroup.com/articles/url-as-ui/)
- [URLs are UI](https://www.hanselman.com/blog/URLsAreUI.aspx)
- [Cool URIs don't change](https://www.w3.org/Provider/Style/URI)

(*) ảnh: http://themetapicture.com/the-times-before-the-url-shortener/
