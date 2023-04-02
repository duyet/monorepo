---
template: post
title: Bảo mật hai lớp
date: "2016-09-01"
author: Van-Duyet Le
tags:
- Security
- Xác minh 2 lớp
- Tutorials
- Bảo mật 2 lớp
- Bảo mật
- Thủ thuật
modified_time: '2016-09-01T12:36:14.646+07:00'
thumbnail: https://3.bp.blogspot.com/-U90ziEzboCk/V8e8QNYdT_I/AAAAAAAAcq4/2utzWI8wLTsV5OLn9I2Hwevtb0FdbvwFgCK4B/s1600/FIDO-Yubico-YubiKeys-GfW-blog-845x321.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7488812165243713467
blogger_orig_url: https://blog.duyet.net/2016/09/bao-mat-hai-lop.html
slug: /2016/09/bao-mat-hai-lop.html
category: News
description: 'Bảo mật 2 lớp là một hình thức bảo mật hiệu quả, được sử dụng phổ biến và ủng hộ khá đông đảo. Khi bật Xác minh 2 bước (còn được gọi là xác thực hai yếu tố), bạn thêm một lớp bảo mật bổ sung cho tài khoản của mình. Bạn đăng nhập bằng thông tin bạn biết (mật khẩu của bạn) và thông tin bạn có (một mã được gửi đến điện thoại của bạn).'
fbCommentUrl: none
---

Bảo mật 2 lớp là một hình thức bảo mật hiệu quả, được sử dụng phổ biến và ủng hộ khá đông đảo.
Khi bật Xác minh 2 bước (còn được gọi là xác thực hai yếu tố), bạn thêm một lớp bảo mật bổ sung cho tài khoản của mình. Bạn đăng nhập bằng thông tin bạn biết (mật khẩu của bạn) và thông tin bạn có (một mã được gửi đến điện thoại của bạn).

Mình khuyến khích mọi người nên bật chức năng này trên các tài khoản dịch vụ quan trọng. Facebook, Google, Dropbox, ... đều có chức năng bảo vệ này. Sau khi bật, cho dù có bị lộ mật khẩu thì người khác vẫn không thể nào truy cập được vào tài khoản nếu không vượt được qua lớp bảo mật thứ 2.

[![](https://3.bp.blogspot.com/-U90ziEzboCk/V8e8QNYdT_I/AAAAAAAAcq4/2utzWI8wLTsV5OLn9I2Hwevtb0FdbvwFgCK4B/s1600/FIDO-Yubico-YubiKeys-GfW-blog-845x321.png)](https://blog.duyet.net/2016/09/bao-mat-hai-lop.html)

## Google ##

1. Truy cập trang [Xác minh 2 bước](http://accounts.google.com/SmsAuthConfig). Bạn có thể phải đăng nhập vào Tài khoản Google của mình.
2. Trong hộp "Xác minh 2 bước" ở bên phải, chọn Bắt đầu thiết lập.
3. Làm theo quy trình thiết lập từng bước.

Với các tài khoản Google, mỗi khi đăng nhập Google sẽ yêu cầu xác nhận qua điện thoại. Có nhiều hình thức: Nhập mã gửi qua SMS, nhập mã từ App Google Authenticator, Google prompt (Smart phone sẽ xác nhận, chỉ cần chọn Yes), ...

Màn hình ví dụ sau khi đăng nhập:

![](https://2.bp.blogspot.com/-JHfezau6hDY/V8exn-J5a0I/AAAAAAAAcpU/o1Rr8W2NBrkqB3oBu1afSweCboipVIIzQCK4B/s1600/Screen%2BShot%2B2016-09-01%2Bat%2B11.32.03%2BAM.png)

Khi đó trên Android sẽ yêu cầu xác nhận đăng nhập:

![](https://4.bp.blogspot.com/-Yg_ZM1xSMKA/V8e3zHqGy9I/AAAAAAAAcpw/pkjuXcXH1lkC3kzFz6nk0ZK59sitjc8pwCK4B/s640/Screenshot_2016-09-01-11-32-18-672_com.google.android.gms.png)

Bạn còn có thể sử dụng 1 thiết bị Security Key, sử dụng như 1 chìa khoá vật lý để đảm bảo an toàn hơn. 

[
](https://3.bp.blogspot.com/-U90ziEzboCk/V8e8QNYdT_I/AAAAAAAAcq4/2utzWI8wLTsV5OLn9I2Hwevtb0FdbvwFgCK4B/s1600/FIDO-Yubico-YubiKeys-GfW-blog-845x321.png)![](https://2.bp.blogspot.com/-2cvBm1URfuI/V8e4JUrL1zI/AAAAAAAAcp4/XRREvMQyFiMVnkQjP7BvceESkb8MIib_wCK4B/s1600/Screen%2BShot%2B2016-09-01%2Bat%2B12.09.44%2BPM.png)

## Facebook ##
Truy cập vào Cài đặt và cài đặt bảo mật 2 lớp bằng cách sử dụng App của Google Authenticator

[![](https://2.bp.blogspot.com/-OJiN9gcTDUw/V8e5b8j9CAI/AAAAAAAAcqA/QiWGdyJePnUZPS93Yl1tQlfLLfxdxtA7wCK4B/s1600/Screen%2BShot%2B2016-09-01%2Bat%2B12.13.00%2BPM.png)](https://2.bp.blogspot.com/-OJiN9gcTDUw/V8e5b8j9CAI/AAAAAAAAcqA/QiWGdyJePnUZPS93Yl1tQlfLLfxdxtA7wCK4B/s1600/Screen%2BShot%2B2016-09-01%2Bat%2B12.13.00%2BPM.png)

Sau khi đăng nhập Facebook sẽ hỏi mã từ ứng dụng:

![](https://3.bp.blogspot.com/-aYlf0-QB36k/V8e5mh6LheI/AAAAAAAAcqI/3c4nTgQCoxwp74CK8Ku-HkKlrKQayTHMQCK4B/s1600/Screen%2BShot%2B2016-09-01%2Bat%2B12.10.36%2BPM.png)

Chỉ cần nhập mã từ ứng dụng:

![](https://1.bp.blogspot.com/-5ubl9jHz5kM/V8e76c7Kp7I/AAAAAAAAcqs/Gn-QVu6fXoMhHfx8z3QseIx9AglO7T5TwCK4B/s640/Screenshot_2016-09-01-12-11-03-366_com.google.android.apps.authenticator2.png)

## Khác ##

- Ngoài ra bạn có thể bật thêm chức năng thông báo mỗi khi đăng nhập về Email hoặc Số điện thoại.
- Mình khuyến khích sử dụng các thiết bị như FIDO U2F. [Xem thêm demo đăng nhập vào Google sử dụng thiết bị U2F của hãng Yubico](https://www.youtube.com/watch?annotation_id=annotation_1845157061&amp;feature=iv&amp;src_vid=BXN7-Wn1Hy4&amp;v=LeTkw6kmlzg)
- Bạn nào làm về mạch và điện tử có thể tự chế tạo cho mình 1 thiết bị xác minh 2 bước để có thể được an toàn tuyệt đối ([https://github.com/conorpp/u2f-zero](https://github.com/conorpp/u2f-zero))

[![](https://4.bp.blogspot.com/-ig8MqVNAnTw/V8e9Tb-NpwI/AAAAAAAAcrM/AkKDZQBQVj0U6Z4tgScGLyRJTYBWRWscwCK4B/s640/687474703a2f2f692e696d6775722e636f6d2f6451706f3977432e6a7067.jpeg)](https://4.bp.blogspot.com/-ig8MqVNAnTw/V8e9Tb-NpwI/AAAAAAAAcrM/AkKDZQBQVj0U6Z4tgScGLyRJTYBWRWscwCK4B/s1600/687474703a2f2f692e696d6775722e636f6d2f6451706f3977432e6a7067.jpeg)
