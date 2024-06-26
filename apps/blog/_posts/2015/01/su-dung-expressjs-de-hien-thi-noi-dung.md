---
title: Sử dụng ExpressJS để hiển thị nội dung file HTML
date: '2015-01-23'
category: Javascript
tags:
  - Nodejs
  - ExpressJs
  - readFile
modified_time: '2015-01-29T11:48:14.276+07:00'
slug: /2015/01/su-dung-expressjs-de-hien-thi-noi-dung.html
description: 'Trong ExpressJs có một cách cực kỳ đơn giản để gửi file HTML đến trình duyệt là sử dụng phương thức: res.sendfile(), tác dụng của nó là đọc nội dung file .html rồi gửi nội dung đến trình duyệt, giúp chúng ta có thể hiển thị nhanh nội dung trang, hoặc trang tĩnh nào đó.'
---

Trong ExpressJs có một cách cực kỳ đơn giản để gửi file HTML đến trình duyệt là sử dụng phương thức: `res.sendfile()`, tác dụng của nó là đọc nội dung file .html rồi gửi nội dung đến trình duyệt, giúp chúng ta có thể hiển thị nhanh nội dung trang, hoặc trang tĩnh nào đó.

## Cách Sử Dụng res.sendFile()

Cách sử dụng phương thức `sendFile()` rất đơn giản, bạn chỉ cần truyền vào tham số duy nhất là đường dẫn đến file html cần hiển thị.

## Ví dụ

Tạo thư mục ứng

```bash
$ mkdir express-sendfile
$ cd express-sendfile
```

Khởi tạo ứng dụng Nodejs và ExpressJs

```bash
$ npm init
$ npm install express --save
```

Tạo ra 2 file `server.js` và `index.html`

```bash
$ touch server.js index.html
```

Rồi, trong thư mục của chúng ta sẽ có thêm 2 file là server.js, chúng ta mở bằng trình soạn thảo nào đó, với nội dung như sau:

```js
var express = require('express');
var app = express();
var path = require('path');

// viewed at http://localhost:8080
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(8080);
```

Sau đó là file `index.html`, đây là nội dung mà chúng ta cần hiển thị lên trình duyệt:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sample Site</title>

    <link
      rel="stylesheet"
      href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"
    />
    <style>
      body {
        padding-top: 50px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="jumbotron">
        <h1>res.sendFile() Works!</h1>
      </div>
    </div>
  </body>
</html>
```

Ok, bây giờ chúng ta kiểm tra thế nào nhé, chạy lệnh:

```bash
$ node server.js
```

Mở trình duyệt, truy cập vào địa chỉ: [http://localhost:8000](http://localhost:8000/)

Chúng ta sẽ thấy được nội dung như sau:

## Kết Luận

`res.sendFile()` là một phương thức rất dễ sử dụng và hữu ích trong ExpressJs, bạn có thể làm các ứng dụng SinglePage, load nội dung bằng AngularJs, trang tĩnh, ... Ngoài ra ExpressJs còn cung cấp cho chúng ta nhiều công cụ khác để đọc và download file trên server.
