---
title: Grunt - Fix lỗi wiredep "Cannot read property 'main' of undefined"
date: '2015-09-22'
author: Duyet
tags:
  - Node.js
  - Tutorial
modified_time: '2015-09-22T20:21:45.074+07:00'
thumbnail: https://1.bp.blogspot.com/-iqXkWdvF-jg/VgFUvbmohqI/AAAAAAAAC5g/alZjGwHMCHY/s1600/Screenshot%2Bfrom%2B2015-09-22%2B20%253A15%253A45.png
slug: /2015/09/grunt-fix-loi-wiredep-cannot-read-propertu-main-of-undefined.html
category: Javascript
description: Grunt Task Wiredep là tác vụ giúp chèn tự động các Components của Bower vào 1 file nào đó.
---

Grunt Task Wiredep là tác vụ giúp chèn tự động các Components của Bower vào 1 file nào đó.
Một số trường hợp bạn sẽ gặp lỗi sau khi chạy Grunt task:

```
Running "wiredep:target" (wiredep) task
Warning: Cannot read property 'main' of undefined Use --force to continue.

Aborted due to warnings.

```

![](https://1.bp.blogspot.com/-iqXkWdvF-jg/VgFUvbmohqI/AAAAAAAAC5g/alZjGwHMCHY/s1600/Screenshot%2Bfrom%2B2015-09-22%2B20%253A15%253A45.png)

- Không tìm thấy file bower.json
- Chưa tải các library được liệt khai báo trong bower: nguyên nhân lỗi là do Grunt không thể insert các depend được liệt kê trong bower vào frontend file. Có thể do bạn chưa chạy lệnh install bower. Chạy lệnh sau để cài đặt các thư viện:

```
bower install
```
