---
title: 'Nodejs - Tạo static server đơn giản với Nodejs '
date: '2015-08-09'
author: Duyet
tags:
  - Node.js
  - Tutorial
modified_time: '2018-09-10T17:30:05.200+07:00'
thumbnail: https://2.bp.blogspot.com/-6e-BntuJcuY/VccJShY74fI/AAAAAAAACtQ/AEgG4pJeriE/s1600/test-html-server.png
slug: /2015/08/tao-server-static-don-gian-bang-nodejs.html
category: Javascript
description: Với package sau bạn có thể tạo 1 static server đơn giản bằng Nodejs.
---

English version: [https://blog.duyet.net/2015/08/nodejs-create-simple-static-server-with.html](https://blog.duyet.net/2015/08/nodejs-create-simple-static-server-with.html)

> Note: This tutorial uses the `static-html-server` package. For modern alternatives in 2025, consider using `npx http-server`, Vite preview mode, or other lightweight server solutions.

## Cài đặt

```bash
$ npm install static-html-server -g
```

## Tạo thư mục chứa các file html, css

Mình tạo 1 thư mục project, đường dẫn ~/project/test-static-server với 2 file bên trong

- index.html
- style.css

![](https://2.bp.blogspot.com/-6e-BntuJcuY/VccJShY74fI/AAAAAAAACtQ/AEgG4pJeriE/s1600/test-html-server.png)

## Khởi động Server

Khởi động server bằng lệnh:

```bash
$ static-html-server -p 8888 -r ~/project/test-static-server
```

Với

- -p 8888 là port của server .
- -r ~/project/test-static-server là đường dẫn đến thư mục gốc của project.

Mở trình duyệt và truy cập http://localhost:8888

![](https://2.bp.blogspot.com/-FiaZHjDZeWQ/VccLGm3k_BI/AAAAAAAACtc/0qxhWNca8Bw/s1600/test-simple-server-view.png)

Chúc các bạn thành công.

## Alternatives for 2025

If you're looking for modern alternatives, here are some options:

- **`npx http-server`** - Quick and simple static server (no installation needed)
- **`npx vite --host`** - Modern build tool with preview mode
- **Built-in Node.js modules** - Use `http` module directly
- **`npx live-server`** - Adds live reload to static files

## Github Project

Github repo: [https://github.com/duyet/static-html-server](https://github.com/duyet/static-html-server)

Issues: [https://github.com/duyet/static-html-server/issues](https://github.com/duyet/static-html-server/issues)
