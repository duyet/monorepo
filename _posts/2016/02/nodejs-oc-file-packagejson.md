---
template: post
title: Nodejs - đọc file package.json
date: "2016-02-03"
author: Van-Duyet Le
tags:
- Nodejs
- Tutorial
- Package.json
modified_time: '2016-02-03T17:15:07.500+07:00'
thumbnail: https://1.bp.blogspot.com/-bt9C6eXcBa8/VrGqjAbhpKI/AAAAAAAAPCs/1wKZ1nusi3A/s1600/npm-the-guide-13-638.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1595304357129345915
blogger_orig_url: https://blog.duyet.net/2016/02/nodejs-oc-file-packagejson.html
slug: /2016/02/nodejs-oc-file-packagejson.html
category: Javascript
description: 'Đọc file package.json giúp ta lấy được một số thông tin của project, như: tên project, version, danh sách các package, ...'
fbCommentUrl: none
---

Đọc file package.json giúp ta lấy được một số thông tin của project, như: tên project, version, danh sách các package, ...


![](https://1.bp.blogspot.com/-bt9C6eXcBa8/VrGqjAbhpKI/AAAAAAAAPCs/1wKZ1nusi3A/s400/npm-the-guide-13-638.jpg)
Ảnh: slideshare

Có nhiều cách để lấy được nội dung file package.json 1 cách trực tiếp.  
Bản chất của package.json là 1 meta json chứa thông tin của project. Cách đơn giản và nhanh nhất là sử dụng require của Nodejs, do require có khả năng load được nội dung file json vào 1 biến trong js.  

```js
var pkg = require('./package.json');console.log(pkg.version);console.log(pkg.name);
```