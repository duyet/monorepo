---
template: post
title: Nodejs - Mã hóa mật khẩu
date: "2016-02-03"
author: Van-Duyet Le
tags:
- Nodejs
- Tutorial
- bcrypt
modified_time: '2016-02-03T14:22:58.956+07:00'
thumbnail: https://4.bp.blogspot.com/-ye71o5GWvp0/VrGoa5MFAQI/AAAAAAAAPCg/EplwAJ4v5yk/s1600/password-protection-flat_1.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7668217930935277395
blogger_orig_url: https://blog.duyet.net/2016/02/nodejs-ma-hoa-mat-khau.html
slug: /2016/02/nodejs-ma-hoa-mat-khau.html
category: Javascript
description: Mã hóa mật khẩu người dùng trước khi lưu vào database là 1 chuyện bắt buộc phải làm đối với bất cứ 1 website nào. Không riêng gì ai, Nodejs cũng hỗ trợ khá nhiều thư viện để hỗ trợ việc mã hóa này.
fbCommentUrl: http://blog.duyetdev.com/2016/02/nodejs-ma-hoa-mat-khau.html
---

Mã hóa mật khẩu người dùng trước khi lưu vào database là 1 chuyện bắt buộc phải làm đối với bất cứ 1 website nào. Không riêng gì ai, Nodejs cũng hỗ trợ khá nhiều thư viện để hỗ trợ việc mã hóa này.

[![Ảnh: http://websitedesign.schoolsict.co.uk](https://4.bp.blogspot.com/-ye71o5GWvp0/VrGoa5MFAQI/AAAAAAAAPCg/EplwAJ4v5yk/s400/password-protection-flat_1.png)](https://blog.duyet.net/2016/02/nodejs-ma-hoa-mat-khau.html)

## [bcrypt.js](https://github.com/ncb000gt/node.bcrypt.js) ##
Bcrypt được sử dụng khá nhiều, ban đầu được thiết kế bởi Niels Provos và David Mazières, xem thêm thông tin tại [wikipedia](https://en.wikipedia.org/wiki/Bcrypt).

### Cài đặt  ###

```
npm install bcrypt
```

### Cách sử dụng ###

- 
#### async (recommended): ####

 Để mã hóa mật khẩu

```
var bcrypt = require('bcrypt');
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash('B4c0/\/', salt, function(err, hash) {
        // Store hash in your password DB.
    });
});
```

Để kiểm tra mật khẩu:

```
// Load hash from your password DB.
bcrypt.compare('B4c0/\/', hash, function(err, res) {
    // res == true
});
bcrypt.compare('not_bacon', hash, function(err, res) {
    // res == false
});

```

Auto-gen a salt and hash:

```
bcrypt.hash('bacon', 8, function(err, hash) {
});
```

- 
#### sync ####

 Để mã hóa mật khẩu:

```
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync('B4c0/\/', salt);
// Store hash in your password DB.
```

Để kiểm tra mật khẩu:

```
// Load hash from your password DB.
bcrypt.compareSync('B4c0/\/', hash); // true
bcrypt.compareSync('not_bacon', hash); // false
```

Auto-gen a salt and hash:

```
var hash = bcrypt.hashSync('bacon', 8);
```
