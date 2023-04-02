---
template: post
title: function* và yield trong Javascript generator function
date: "2016-02-21"
author: Van-Duyet Le
tags:
- Generator
- ECMAScript 2015
- ES6
- Javascript
- function
- Object
modified_time: '2016-02-26T21:31:30.559+07:00'
thumbnail: https://1.bp.blogspot.com/-OA0tvHhNN3o/VsiyjiJwLbI/AAAAAAAAQAo/IugUE3zNbrY/s1600/generator-function.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3625446092140013146
blogger_orig_url: https://blog.duyet.net/2016/02/generator-function-javascript.html
slug: /2016/02/generator-function-javascript.html
category: Javascript
description: function* giúp khai báo 1 generator function, trả về 1 Generator object. Với chức năng mới này, hàm có thể dừng thực thi bất cứ thời điểm nào, đợi async chạy xong, xong tiếp tục thực thi.
fbCommentUrl: http://blog.duyetdev.com/2016/02/generator-function-javascript.html
---

Một trong những chức năng, cũng như vấn đề mà mọi developer javascript/nodejs đều gặp phải là lập trình bất đồng bộ (async) và [callback hell](http://callbackhell.com/) khó điều khiển.

May thay, function* là một trong những chức năng mới của Javascript trong [ECMAScript 2015](https://duyetdev-collections.github.io/es6features/) (6th Edition, hay tắt là ES6). function* giúp khai báo 1 generator function, trả về 1 [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) object. Với chức năng mới này, hàm có thể dừng thực thi bất cứ thời điểm nào, đợi async chạy xong, xong tiếp tục thực thi.

![](https://1.bp.blogspot.com/-OA0tvHhNN3o/VsiyjiJwLbI/AAAAAAAAQAo/IugUE3zNbrY/s1600/generator-function.png)

## Generator function là gì? ##
Có thể hiểu Generator function là một function, có khả năng tạm ngưng thực thi trước khi hàm kết thúc, và có thể tiếp tục chạy ở 1 thời điểm khác.

## Cú pháp ##

```js
function* name([param[, param[, ... param]]]) {
   statements
}
```

- name: tên hàm.
- param: tham số đầu vào của hàm, tối đa 255 tham số.
- statements: nội dung của hàm.

Hàm sẽ không được thực thi ngay sau khi gọi, mà thay vào đó generator function trả về iterator, giống như con trỏ trong vòng lặp. Sau khi hàm `next()` của iterator được gọi, generator function sẽ thực thi hàm cho đến khi gặp từ khóa `yield` đầu tiên. Yield sẽ trả về giá trị cho iterator, generator function kết thúc cho đến khi hết giá trị để yield.

## Ví dụ ##
Nói thì dông dài, ví dụ sau sẽ dễ hiểu hơn. Hàm sau có tác dụng tạo ra ID tăng dần, mỗi khi hàm next được gọi.

```js
function* id_maker(){
  var index = 0;
  while(index < 3)
    yield index++;
}

var gen = id_maker();

console.log(gen.next().value); // 0
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // undefined
```

`yield` sẽ được gọi 3 lần trong vòng lặp for, do đó khi gọi đến lần thứ 4 thì log sẽ trả về undefined.

Ở ví dụ trên, `gen.next()` sẽ trả về một object có 2 tham số là `value` và `done`. Kiểm tra có còn `next()` được nữa hay không thì chỉ cần kiểm tra giá trị `done`

```js
console.log(gen.next()); // { value: 0, done: false }
```


`yield` chỉ có thể return về giá trị, để return về 1 hàm khác, ta sử dụng `yield*`

```js
function* anotherGenerator(i) {
  yield i + 1;
  yield i + 2;
  yield i + 3;
}

function* generator(i){
  yield i;
  yield* anotherGenerator(i);
  yield i + 10;
}

var gen = generator(10);

console.log(gen.next().value); // 10
console.log(gen.next().value); // 11
console.log(gen.next().value); // 12
console.log(gen.next().value); // 13
console.log(gen.next().value); // 20
```

## Kết ##

Generator function là một trong những tính năng cực kì hữu ích trong ES6. Nodejs có module [co](https://github.com/tj/co) và framework [koa](https://github.com/koajs/koa) (được xem là next generator framework for nodejs) tận dụng rất tốt chức năng này. 

yield còn dùng để khử callback phức tạp của Javascript, khử promise - hiện còn làm nhiều bạn lúng túng khi mới bắt đầu với nodejs. Tôi sẽ viết 1 bài hướng dẫn sau.
Từ bản nodejs 0.12 trở lên đã được hỗ trợ chức năng generator function,với node v0.12 phải có tham số `--harmony` để có thể sử dụng yield/function*, còn node 4.0 trở lên thì không cần.

```bash
node --harmony ./app.js
```

Tham khảo:

- [Write "Synchronous" Node.js Code with ES6 Generators](http://eladnava.com/write-synchronous-node-js-code-with-es6-generators/)
- [function* - Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
- [Callback Hell](http://callbackhell.com/)
- [Generators in Node.js: Common Misconceptions and Three Good Use Cases - Strongloop](https://strongloop.com/strongblog/how-to-generators-node-js-yield-use-cases/)
- [ECMAScript 2015 features](https://duyetdev-collections.github.io/es6features)
