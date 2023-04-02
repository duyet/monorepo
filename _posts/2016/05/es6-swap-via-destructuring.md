---
template: post
title: ES6 - swap (hoán đổi) nhanh 2 biến số
date: "2016-05-27"
author: Van-Duyet Le
tags:
- Tutorrial
- ES6
- Tutorials
- Javascript
- Exploring ES6
modified_time: '2016-05-27T12:32:27.018+07:00'
thumbnail: https://3.bp.blogspot.com/-ASmcHtbRZj4/V0fa2A-pCEI/AAAAAAAAWDs/AP5UfzkG1icZUj4TCv68Nr4hu5SK04zxACK4B/s1600/swap-es-duyetdev.com.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4495934034868812350
blogger_orig_url: https://blog.duyet.net/2016/05/es6-swap-via-destructuring.html
slug: /2016/05/es6-swap-via-destructuring.html
category: Javascript
description: ES6 có chức năng destructuring có khá nhiều công dụng. Thủ thuật sau giúp hoán đổi giá trị 2 biến bằng cách destructuring.
fbCommentUrl: none
---

ES6 có chức năng destructuring có khá nhiều công dụng. Thủ thuật sau giúp hoán đổi giá trị 2 biến bằng cách destructuring.

![](https://3.bp.blogspot.com/-ASmcHtbRZj4/V0fa2A-pCEI/AAAAAAAAWDs/AP5UfzkG1icZUj4TCv68Nr4hu5SK04zxACK4B/s1600/swap-es-duyetdev.com.png)

Đặt 2 biến cần hoán đổi vào mảng, và tiến hành "destructuring" và 1 mảng có cùng tham số.

```js
[a, b] = [b, a];
```

Javascript sẽ tự động hiểu là bạn cần swap 2 biến, nên thực tế sẽ không tạo ra mảng [a, b] để tránh tốn bộ nhớ.

Xem thêm: Chap. ["Destructuring"](http://exploringjs.com/es6/ch_destructuring.html) in "Exploring ES6"
