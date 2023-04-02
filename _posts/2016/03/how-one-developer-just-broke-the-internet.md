---
template: post
title: How one developer just broke Node, Babel and thousands of projects in 11 lines
  of JavaScript
date: "2016-03-26"
author: Van-Duyet Le
tags:
- Nodejs
- Bàn luận
- NPM
- Package
- News
modified_time: '2016-05-02T19:39:38.146+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4874282820759264251
blogger_orig_url: https://blog.duyet.net/2016/03/how-one-developer-just-broke-the-internet.html
slug: /2016/03/how-one-developer-just-broke-the-internet.html
category: News
description: Một lập trình viên vừa gây lỗi hàng loạt cho Node, Babel và hàng nghìn projects khác. Chỉ với 11 dòng Javascript.
fbCommentUrl: none
---

Một lập trình viên vừa gây lỗi hàng loạt cho Node, Babel và hàng nghìn projects khác. Chỉ với 11 dòng Javascript.

Một vụ lớn trong giới Nodejs. Một lập trình viên tên là [Koçulu](https://github.com/azer) sở hữu package trên npm là [Kik](https://github.com/starters/kik).
Mới vừa rồi xuất hiện 1 cty cũng tên là [kik](https://www.kik.com/), người đại diện của kik yêu cầu Koçulu đổi tên kik, anh này không chịu. Sau đó Kik nhờ luật sư can thiệp với Npm Admin.

Koçulu bất mãn với quyết định của npm và quyết định gỡ toàn bộ [250 package của mình](https://ahihi.club/kXEkHL), không may trong đó có 1 package [left-pad](https://github.com/azer/left-pad), chỉ có 11 dòng Javascript (mã nguồn bên dưới), có chức năng thêm vào các khoảng trắng bên trái 1 chuỗi. Và có hàng nghìn project lớn khác (trong đó có Node, Babel, ...) sử dụng lại Package này.

Với việc [left-pad](https://github.com/azer/left-pad) bị gỡ trên NPM, hàng nghìn project đó sẽ gặp lỗi khi cài đặt dependency. left-pad đã được tải xuống 2,486,696 lần trong tháng vừa qua.

Hiện mọi người vẫn có thể cài đặt các package đã bị gỡ bỏ này trực tiếp thông qua Github.

```
module.exports = leftpad;

function leftpad (str, len, ch) {
  str = String(str);

  var i = -1;

  if (!ch && ch !== 0) ch = ' ';

  len = len - str.length;

  while (++i < len) {
    str = ch + str;
  }

  return str;
}
```

### Tham khảo ###

- [How one developer just broke Node, Babel and thousands of projects in 11 lines of JavaScript](http://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/)
- [A discussion about the breaking of the Internet](https://medium.com/@mproberts/a-discussion-about-the-breaking-of-the-internet-3d4d2a83aa4d#.baitcblji) | Medium
- [I’ve Just Liberated My Modules](https://medium.com/@azerbike/i-ve-just-liberated-my-modules-9045c06be67c#.l27mzwavf) | Medium
- [left-pad npm](https://twitter.com/search?f=tweets&amp;vertical=default&amp;q=left-pad%20npm&amp;src=typd) | Twitter Search
