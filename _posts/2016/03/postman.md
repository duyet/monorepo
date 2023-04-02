---
template: post
title: Postman
date: '2016-03-25'
author: Van-Duyet Le
tags:
- Tutorial
- Postman
- Hướng dẫn
- Debug
- Testing
modified_time: '2018-09-10T17:25:18.477+07:00'
thumbnail: https://2.bp.blogspot.com/-_IT8xVlbJVQ/VvQgO2RgTmI/AAAAAAAASS4/xik1F1ISkUYBey672mAIh7uK0o4vvEJoA/s1600/postman-logo%252Btext-320x132.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1670084625888179018
blogger_orig_url: https://blog.duyet.net/2016/03/postman.html
slug: /2016/03/postman.html
category: Web
description: Postman là một App Extensions, cho phép làm việc với các API, nhất là REST, giúp ích rất nhiều cho việc testing. Hỗ trợ tất cả các phương thức HTTP (GET, POST, PUT, DELETE, OPTIONS, HEAD ...). Postman cho phép lưu lại các lần sử dụng. Sử dụng cho cá nhân hoặc team lớn.
fbCommentUrl: none
---

Postman là một App Extensions, cho phép làm việc với các API, nhất là REST, giúp ích rất nhiều cho việc testing. Hỗ trợ tất cả các phương thức HTTP (GET, POST, PUT, DELETE, OPTIONS, HEAD ...)
Postman cho phép lưu lại các lần sử dụng. Sử dụng cho cá nhân hoặc team lớn.

[![](https://2.bp.blogspot.com/-_IT8xVlbJVQ/VvQgO2RgTmI/AAAAAAAASS4/xik1F1ISkUYBey672mAIh7uK0o4vvEJoA/s400/postman-logo%252Btext-320x132.png)](https://blog.duyet.net/2016/03/postman.html)

## Cài đặt ##
Truy cập trang chủ [https://www.getpostman.com](https://www.getpostman.com/) hoặc từ Chrome Web Store.

## Sử dụng ##

Cách sử dụng khá đơn giản, chỉ cần điền URL của API, chọn phương thức và nhấn Send

Ví dụ điền thử URL [https://duyet.net](https://duyet.net/) xem sao.

[![](https://4.bp.blogspot.com/-La2xNxeYjtg/VvQhTkg-iKI/AAAAAAAASS8/-FheKuYZa08Z1Ds0fQDKhceLklGZmTpBA/s1600/Screenshot%2Bfrom%2B2016-03-25%2B00-17-20.png)](https://4.bp.blogspot.com/-La2xNxeYjtg/VvQhTkg-iKI/AAAAAAAASS8/-FheKuYZa08Z1Ds0fQDKhceLklGZmTpBA/s1600/Screenshot%2Bfrom%2B2016-03-25%2B00-17-20.png)

Kết quả sẽ hiện bên dưới. Cột bên trái lưu lại History sử dụng.

### Authorization và Header ###

Postman hỗ trợ Authorization với các API bắt buộc xác thực để sử dụng, Postman hỗ trợ hầu hết loại phương thức Auth. 

Một số API bắt buộc phải kèm thông tin về Request Header, ta cũng có thể dễ dàng tùy chỉnh ở Tab Header. 

![](https://1.bp.blogspot.com/-GVWBo-_Za48/VvQiSjTbBUI/AAAAAAAASTA/1fX2G9D-rvgg7ce9tOFyD_1_VeX2IWksg/s1600/Screenshot%2Bfrom%2B2016-03-25%2B00-21-10.png)

### Cookie và các Header bị cấm ###

Do một số chính sách, Chrome và XMLHttpRequest cấm gửi một số header sau:

- Accept-Charset
- Accept-Encoding
- Access-Control-Request-Headers
- Access-Control-Request-Method
- Connection
- Content-Length
- Cookie
- Cookie 2
- Content-Transfer-Encoding
- Date
- Expect
- Host
- Keep-Alive
- Origin
- Referer
- TE
- Trailer
- Transfer-Encoding
- Upgrade
- User-Agent
- Via

Để sử dụng các Header trên, bạn cần cài thêm [Postman Interceptor](https://chrome.google.com/webstore/detail/postman-interceptor/aicmkgpgakddgnaphhhpliifpcfhicfo) và làm theo hình dưới

![](https://4.bp.blogspot.com/-1JsE6oTzZok/VvQjaKPlp6I/AAAAAAAASTM/0BB75TR0P-g1urH5yadPy_Kg-3ri_vOLg/s1600/32.png)

## Tham khảo ##

- [Sending Requests](https://www.getpostman.com/docs/requests) | Postman
- [Using the Interceptor to read and write cookies](http://blog.getpostman.com/2014/11/28/using-the-interceptor-to-read-and-write-cookies/) | Postman Blog
