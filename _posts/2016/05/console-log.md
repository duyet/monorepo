---
template: post
title: console.log() nâng cao
date: "2016-05-16"
author: Van-Duyet Le
tags:
- Chrome
- console
- console.log
- Javascript
- Debug
modified_time: '2016-05-16T20:57:35.599+07:00'
thumbnail: https://1.bp.blogspot.com/-2tFGxZVRXY8/VznC82-aNtI/AAAAAAAAVLg/nL2_UJPqxrAG5BSQVhCjR3f-OpM8tESyQCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B19-50-27.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-9132821458973141979
blogger_orig_url: https://blog.duyet.net/2016/05/console-log.html
slug: /2016/05/console-log.html
category: Javascript
description: Là một lập trình viên Javascript/Nodejs, ắt hẳn ai cũng đã quen với các hàm `console.*` để debug. Nay tôi xin giới thiệu các tính năng cách sử dụng hay và ít được biết đến của các hàm `console.*` này.
fbCommentUrl: none
---

Là một lập trình viên Javascript/Nodejs, ắt hẳn ai cũng đã quen với các hàm `console.*` để debug.
Nay tôi xin giới thiệu các tính năng cách sử dụng hay và ít được biết đến của các hàm `console.*` này.

[![](https://1.bp.blogspot.com/-2tFGxZVRXY8/VznC82-aNtI/AAAAAAAAVLg/nL2_UJPqxrAG5BSQVhCjR3f-OpM8tESyQCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B19-50-27.png)](https://blog.duyet.net/2016/05/console-log.html)
Truy cập [https://saveto.co](https://saveto.co/) và bấm F12

## console.* ##
Cùng ôn lại các hàm của `console`. Bạn có thể test ngay bằng cách sử dụng trình debug (F12) trên trình duyệt.

- `console.log()` in ra chuỗi, hàm, hằng, mảng, object, ...
- `console.info()` tương tự console.log, in ra 1 message information.
- `console.error()` in ra thông tin lỗi.
- `console.count()` in ra số lần lặp lại khi gọi hàm với 1 tham số cụ thể (thường dùng để debug số lần lặp).
- `console.clear()` xóa sạch console trên trình duyệt.
- `console.dir(obj)` xem toàn bộ các thuộc tính của 1 object javascript.
- ... 

## Định dạng css cho console.log ##
Ta có thể định dạng lại các message in ra consolebằng CSS. Chỉ cần viết thêm tham số `%c` và CSS vào tham số cuối cùng. Ví dụ:

```js
var css='background-color: #FFCC00; color: #FFF; font-weight: 700; padding: 10px';
console.log('%cTôi là Duyệt', css);
```

![](https://2.bp.blogspot.com/-B3qwRAK5OnM/VznFtqncUwI/AAAAAAAAVLs/7tqW2Ohn8YUdTGonlIptsWPJbL-9d_2nQCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B20-04-41.png)

![](https://1.bp.blogspot.com/-qLUjlDkW9ss/VznOr0YGq3I/AAAAAAAAVM8/1ynNTWo_zq88Eu1mdssNC5awYH4sxyO-wCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B20-43-26.png)

## Template string ##

Các hàm console.* cũng hỗ trợ template string.

```js
console.log("I'm %s and %s years old.", '@duyetdev', 20)
```

![](https://4.bp.blogspot.com/-LpnbNfzxwiw/VznOSwSB2XI/AAAAAAAAVMw/WJAQZy_oKWI8L31cUZKXs8qD3C0mF-WzQCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B20-41-35.png)

## Vẽ bảng với console.table() ##
Debug với array hoặc object phức tạp và không trực quan. `console.table()` giúp hiển thị dữ liệu dưới dạng bảng ngay trên console.

```js
var people = [["Van-Duyet", "Le"], ["Kim", "Ngan"], ["XYZ", "ABC"]]
console.table(people);
```

![](https://4.bp.blogspot.com/-I7T2ayjwuG0/VznHHbPnuOI/AAAAAAAAVL4/Xj38no2ytU0RFS364KRHOlSArAS7Ph2XgCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B20-10-50.png)
Có thể sort trực tiếp trên dữ liệu.

Làm việc với Object:

```js
var jobs = [{ name: 'Lê Văn Duyệt', age: 20, job: 'Ăn hại' }, { name: 'Lê Văn X', age: 20, job: 'Ăn ngủ' }]
console.table(jobs)
```

![](https://1.bp.blogspot.com/-raB55lsLtiM/VznINa_YgeI/AAAAAAAAVME/PQe6-hMOsPwg_onUqUvDpiYF4L0VgtSMACK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B20-15-50.png)

## console.time() ##
`console.time` và `console.timeEnd` đo thời gian runtime, từ khi `console.time` chạy cho đến khi `console.timeEnd` kết thúc.

```js
console.time('Thời gian debug hàm X: ');
// do some thing ....
console.timeEnd('Thời gian debug hàm X: ');
// => Thời gian debug hàm X: : 15986.679ms
```

![](https://2.bp.blogspot.com/-2VW1YKzWB7w/VznJTuYYfqI/AAAAAAAAVMQ/u7tPZK_3UnUM-LkpBrrfHWiHn5R0btsIgCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B20-20-15.png)

## Nhóm các message với console.group ##
`console.group` giúp gom các message lại thành 1 group inline. Xem ví dụ sau:

```js
console.group('Todo');
console.log('Ngủ');

    console.group('Ăn');
    console.log('Bún bò');
    console.log('Phở');
    console.log('Chè');
    console.log('...');
    console.groupEnd();

console.log('Đi chơi');
console.groupEnd();
```

![](https://3.bp.blogspot.com/-ZPMJmH_7IZY/VznMKlSBbLI/AAAAAAAAVMc/AhIq2AqmPu4flHf2P_pBJ4VnNQw_gZ8mgCK4B/s1600/Screenshot%2Bfrom%2B2016-05-16%2B20-32-38.png)

## Tham khảo 

- [https://developer.mozilla.org/en-US/docs/Web/API/console](https://developer.mozilla.org/en-US/docs/Web/API/console)
- [Advanced Logging with the JavaScript Console](https://egghead.io/series/js-console-for-power-users)
