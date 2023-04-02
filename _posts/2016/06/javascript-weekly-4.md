---
template: post
title: 'Javascript Weekly #4'
date: "2016-06-11"
author: Van-Duyet Le
tags:
- Nodejs
- Javascript
- Javascript-Weekly
modified_time: '2016-06-11T22:02:39.496+07:00'
thumbnail: https://4.bp.blogspot.com/-mQxRpFMY0UM/V1wn05hGx3I/AAAAAAAAXiA/PUSZrt0AUoMEyGQbfmEbmJlhnEmBIp-5gCK4B/s1600/js-4.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8454063536227658355
blogger_orig_url: https://blog.duyet.net/2016/06/javascript-weekly-4.html
slug: /2016/06/javascript-weekly-4.html
category: Javascript
description: React và ES6 vẫn là các chủ đề đang được quan tâm. Javascript Weekly tuần này có gì hot?
fbCommentUrl: none
---

React và ES6 vẫn là các chủ đề đang được quan tâm. Javascript Weekly tuần này có gì hot?

[![](https://4.bp.blogspot.com/-mQxRpFMY0UM/V1wn05hGx3I/AAAAAAAAXiA/PUSZrt0AUoMEyGQbfmEbmJlhnEmBIp-5gCK4B/s1600/js-4.png)](https://blog.duyet.net/2016/06/javascript-weekly-4.html)

## [10 chức năng của Lodash bạn có thể thay thế bằng ES6](https://www.sitepoint.com/lodash-features-replace-es6/?utm_source=duyetdev.com&amp;utm_medium=saveto.co) ##
DAN PRINCE
Lodash là một trong những package được sử dụng rất phổ biến, từ xử lý số liệu, mảng, danh sách, ... Nếu bạn sử dụng ES6, có thể bạn sẽ không cần Lodash nữa. Vì ES6 hiện nay đã đủ mạnh để làm được các chức năng này.

## [Building React Applications with Idiomatic Redux](http://saveto.co/Hm3a2V) ##
EGGHEAD
Chuỗi 27 video hướng dẫn xây dựng ứng dụng React với Idiomatic Redux. Video được hướng dẫn bơi chính người phát minh ra Redux, Dan Abramov

## [nbind: A Way to Combine C++ and JavaScript](http://saveto.co/lS87z1) ##
CHARTO
Thư viện giúp Node.js sử dụng được  các thư viện viết bằng C++

## [What's The Smallest Subset of Characters To Run Any JS?](http://saveto.co/rxOPvy) ##
SYLVAIN POLLET-VILLARD
A mostly pointless, but geeky and fun, look at rendering characters via JavaScript using just a few underlying symbols.

[![](https://3.bp.blogspot.com/-Ld023bbHL_M/V1wk01ThbJI/AAAAAAAAXhk/KO4vd6f_S-INxBFASnIuDTln82dmGEfKQCK4B/s1600/Screenshot%2Bfrom%2B2016-06-11%2B21-47-36.png)](https://3.bp.blogspot.com/-Ld023bbHL_M/V1wk01ThbJI/AAAAAAAAXhk/KO4vd6f_S-INxBFASnIuDTln82dmGEfKQCK4B/s1600/Screenshot%2Bfrom%2B2016-06-11%2B21-47-36.png)

## [Regular Expressions in JavaScript](http://saveto.co/UXWCj6) 

KEVIN YANK

Một bài viết hay và chi tiết về Regular Expressions trong Javascript

```
var theString = "test1 Test2 TEST3";
theString.search(/Test[0-9]+/); // 6
```

## [is.js: A Simple Yet Extensible Predicate Library CODE ](http://saveto.co/iHMK6K) ##
Một thư viện với nhiều phương thức để kiểm tra kiểu của một giá trị trong Javascript. Hỗ trợ cho trình duyệt lẫn Node.js

```
const is = require( '@pwn/is' )

is.array( [] ) // true
is.not.integer( 0 ) // false
is.propertyDefined( { foo : { bar : 0 } } , 'foo.bar' ) // true
is.equal( [ 1 , [ 2 , 3 ] ] , [ 1 , [ 2 , 3 ] ] ) // false
is.deepEqual( [ 1 , [ 2 , 3 ] ] , [ 1 , [ 2 , 3 ] ] ) // true
```

--------------------
Saveto: [http://saveto.co/t/js-weekly-4](http://saveto.co/t/js-weekly-4)
Theo dõi chuỗi bài viết JavaScript Weekly tại: [http://saveto.co/javascript-weekly](http://saveto.co/javascript-weekly)
