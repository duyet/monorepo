---
template: post
title: 'Nodejs - Tạo static server đơn giản với Nodejs '
date: "2015-08-09"
author: Van-Duyet Le
tags:
- Nodejs
- Server
- static server
- simple
modified_time: '2018-09-10T17:30:05.200+07:00'
thumbnail: https://2.bp.blogspot.com/-6e-BntuJcuY/VccJShY74fI/AAAAAAAACtQ/AEgG4pJeriE/s1600/test-html-server.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6758765916496612222
blogger_orig_url: https://blog.duyet.net/2015/08/tao-server-static-don-gian-bang-nodejs.html
slug: /2015/08/tao-server-static-don-gian-bang-nodejs.html
category: Javascript
description: Với package sau bạn có thể tạo 1 static server đơn giản bằng Nodejs.
fbCommentUrl: none
---

Với package sau bạn có thể tạo 1 static server đơn giản bằng Nodejs.
English version: [https://blog.duyet.net/2015/08/nodejs-create-simple-static-server-with.html](https://blog.duyet.net/2015/08/nodejs-create-simple-static-server-with.html?utm_source=duyetdev_blog&amp;utm_medium=local_click&amp;utm_campaign=duyetdev_blog)

## Cài đặt ##

```
$ npm install static-html-server -g
```

## Tạo thư mục chứa các file html, css  ##

Mình tạo 1 thư mục project, đường dẫn ~/project/test-static-server với 2 file bên trong

- index.html
- style.css 

![](https://2.bp.blogspot.com/-6e-BntuJcuY/VccJShY74fI/AAAAAAAACtQ/AEgG4pJeriE/s1600/test-html-server.png)

## Khởi động Server  ##

Khởi động server bằng lệnh 

```
$ static-html-server -p 8888 -r ~/project/test-static-server 
```

Với 

- -p 8888 là port của server .
- -r ~/project/test-static-server là đường dẫn đến thư mục gốc của project.

Mở trình duyệt và truy cập http://localhost:8888

![](https://2.bp.blogspot.com/-FiaZHjDZeWQ/VccLGm3k_BI/AAAAAAAACtc/0qxhWNca8Bw/s1600/test-simple-server-view.png)

Chúc các bạn thành công.

## Github Project ##

Github repo: [https://github.com/duyet/static-html-server](https://github.com/duyet/static-html-server)

Issues: [https://github.com/duyet/static-html-server/issues](https://github.com/duyet/static-html-server/issues)
