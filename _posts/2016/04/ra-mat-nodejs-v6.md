---
template: post
title: Ra mắt Node.js v6.0.0
date: "2016-04-27"
author: Van-Duyet Le
tags:
- Nodejs
- release
- Node.js
modified_time: '2016-05-02T19:36:00.033+07:00'
thumbnail: https://3.bp.blogspot.com/-_fNbLVO5xXM/VyDN2wT51fI/AAAAAAAAT7o/XeHb_vlbC4AM85F9_UpRHBJhOhT0a2wNwCK4B/s1600/Node-dot-js-796x398.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7503279694759769168
blogger_orig_url: https://blog.duyet.net/2016/04/ra-mat-nodejs-v6.html
slug: /2016/04/ra-mat-nodejs-v6.html
category: Javascript
description: Ra mắt Node.js v6.0.0
fbCommentUrl: none
---

Hôm nay 26/04, Node.js vừa ra mắt [phiên bản v6.0.0](https://nodejs.org/en/blog/release/v6.0.0/), với nhiều cải tiến về hiệu suất, load module nhanh hơn đáng kể, cải tiến Buffer, File System APIs, tests và tài liệu tốt hơn.

[![](https://3.bp.blogspot.com/-_fNbLVO5xXM/VyDN2wT51fI/AAAAAAAAT7o/XeHb_vlbC4AM85F9_UpRHBJhOhT0a2wNwCK4B/s640/Node-dot-js-796x398.jpg)](https://blog.duyet.net/2016/04/ra-mat-nodejs-v6.html)

Nodejs v6.0.0 sử dụng V8 JavaScript engine, giúp hỗ trợ hơn 93% các [chức năng mới trong ES6](https://blog.duyet.net/2016/04/es6.html). Hiệu tại Nodejs v6 được công bố là "Current Release", tức là bạn đã có thể nâng cấp lên Nodejs ngay thời điểm này.

> New "Current" version line focuses on performance improvements, increased reliability and better security for its 3.5 million users - https://nodejs.org/en/blog/announcements/v6-release/

Các điểm mới trong Nodejs v6:

## Nâng cấp hiệu năng ##

- Load module nhanh hơn gấp 4 lần so với Nodejs v4
- Nâng cấp V8 engine

## Bảo mật ##

- `Math.random` được tăng cường bảo mật, xem thêm: [http://v8project.blogspot.hu/2015/12/theres-mathrandom-and-then-theres.html](http://v8project.blogspot.hu/2015/12/theres-mathrandom-and-then-theres.html)
- Buffer API mới: giảm khả năng lỗi và lỗ hổng cho ứng dụng.

## ES6 Features ##

Như đã nói ở trên, Nodejs v6 hỗ trợ 93% các chức năng mới của ES6 mà không cần dùng compile Babel như trước đây.

```
var x = [1, 2, 3, 4, 5]  
var [y, z] = x  
console.log(y) // 1  
console.log(z) // 2
```

Xem thêm [ES6 có gì mới?](https://blog.duyet.net/2016/04/es6.html)

## Nâng cấp lên Nodejs v6 ##

Sử dụng nvm:

```
nvm install 6
```

Trường hợp không sử dụng nvm:

```
sudo npm install -g n # Cài n
sudo n latest # Install or activate the latest node release
```

## Tham khảo ##

Tháng 10 năm nay Nodejs v6 mới chính thức chuyển sang phiên bản TLS. 

- [https://blog.risingstack.com/whats-new-in-node-v6/](https://blog.risingstack.com/whats-new-in-node-v6/)
- [https://nodejs.org/en/blog/release/v6.0.0/](https://nodejs.org/en/blog/release/v6.0.0/)
