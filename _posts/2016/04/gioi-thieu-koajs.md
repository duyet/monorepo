---
template: post
title: Giới thiệu Koa.js
date: "2016-04-30"
author: Van-Duyet Le
tags:
- koa
- intro-js
- koajs
- Node.js
- Express.js
- Node
modified_time: '2017-08-06T11:41:14.315+07:00'
thumbnail: https://4.bp.blogspot.com/-sCicwYtVpcY/VyS-dwEy4YI/AAAAAAAAUBM/5Q1QZ6zVR5YcsV7lgN8MYWfkZvrz6AXtgCK4B/s1600/Screen-Shot-2014-04-11-at-7.49.09-AM.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4661432017558938656
blogger_orig_url: https://blog.duyet.net/2016/04/gioi-thieu-koajs.html
slug: /2016/04/gioi-thieu-koajs.html
category: Javascript
description: Về Node.js, ắt hẳn mọi người đều đã quá quen với Expressjs. Nên nay tôi giới thiệu một framework mới cũng khá hay, hiệu năng cao và dễ sử dụng KoaJs
fbCommentUrl: none
---

Về Node.js, ắt hẳn mọi người đều đã quá quen với Expressjs. Nên nay tôi giới thiệu một framework mới cũng khá hay, hiệu năng cao và dễ sử dụng - [Koajs - next generation web framework for node.js](http://koajs.com/)

[![](https://4.bp.blogspot.com/-sCicwYtVpcY/VyS-dwEy4YI/AAAAAAAAUBM/5Q1QZ6zVR5YcsV7lgN8MYWfkZvrz6AXtgCK4B/s1600/Screen-Shot-2014-04-11-at-7.49.09-AM.png)](https://blog.duyet.net/2016/04/gioi-thieu-koajs.html)

## Koa.js là gì? ##
Koa là một Web framework Nodejs, được viết bởi team của Expressjs. Koa sử dụng nhiều chức năng mới của ES6, được xem là chưa ổn định với các bản Nodejs dưới 4.0, nhưng mới vừa rồi [Node v6 vừa ra mắt](https://blog.duyet.net/2016/04/ra-mat-nodejs-v6.html), đánh dấu Koajs sẽ là 1 framework mạnh và ổn định hơn.

Koa.js yêu cầu sử dụng Node.js v4.0 trở lên, với các bản 4.0 trở về trước yêu cầu sử dụng thêm flag --harmony để kích hoạt các chức năng mở rộng của Javascript (cụ thể là generator).

```
node --harmony app.js
```

## Vì sao nên sử dụng Koa ##
Như đã PR, koa is next generation web framework. [Koa](http://koajs.com/) chủ yếu tận dụng chức năng generators của Javascript ES6.
Bạn có thể xem bài viết sau để hiểu rõ hơn về Generators này: [function* và yield trong Javascript generator function](https://blog.duyet.net/2016/02/generator-function-javascript.html#.VyTAS4N94_M)

Ngoài ra còn 2 chức năng mới nữa là sử dụng middleware theo từng tầng và xử lý lỗi tốt. Một điểm tôi thấy hay khi sử dụng nữa là Koa có phong cách code rất lite, giúp app nhỏ gọn và dễ kiểm soát.

## Hello world ##

Cài đặt koa bằng npm

```
$ npm install koa
```

Tạo và mở file `app.js` với nội dung: 

```
var koa = require('koa');
var app = koa();

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
```

Khởi động Web server bằng lệnh: 

```
$ node app.js
```

Truy cập trình duyệt bằng địa chỉ: [http://localhost:3000](http://localhost:3000/)

## yielding to * ##
Koa được viết dựa trên co - giúp xử lý generators, thay vì sử dụng callback, Koa nhờ đó có cú pháp đơn giản và sạch sẽ hơn.
Bạn nên đọc thêm về generators và co-routines ở bài viết này: [https://medium.com/code-adventures/174f1fe66127](https://medium.com/code-adventures/174f1fe66127)

Tôi sẽ ví dụ nhanh, với Express từ trước đến giờ, mỗi khi cần truy suất vào database thì chỉ có mỗi cách gọi callback như sau:

```
function(req, res) {
  db.getUser(function(err, u) {
    if (err) return res.status(404).send(err);
    res.send(u)
  });
}
```

Chưa kể là còn gặp phải trường hợp [Callback hell](https://strongloop.com/strongblog/node-js-callback-hell-promises-generators/), nhiều callback lồng vào nhau và đợi lẫn nhau.
Với Koa:

```
function *(next) {
  var user = yield db.getUser();
  this.body = user;
}
```

Koa có thể điều khiển luồng dữ liệu 1 cách trực quan nhất, cái bạn thấy đầu tiên là không cần sử dụng callback. Koa còn tương thích nhiều với các package co-*, cách tiếp cận khác khi làm việc với xử lý bất đồng bộ trong Nodejs. Tôi sẽ nó sâu hơn về co trong một dịp khác.

## Cascading Middleware ##

Nếu bạn đã sử dụng qua Promises hay các framework control flow khác, mọi xử lý chỉ sẽ đi theo 1 luồng duy nhất, hoặc theo cơ chế ném-bắt callback. Koa middleware lại có cách xử lý hoàn toàn khác và mạnh mẽ hơn. 

Theo ghi ở trang chủ, thì koa: yields "downstream", then control flows back "upstream".

Để giải thích, hay xem qua ví dụ về Koa logging sau: 

```
app.use(function *(next){
  var start = new Date;
  yield next;  // <--- yields "downstream" 
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});
```

Biến start sẽ lưu lại thời điểm bắt đầu, sau đó ứng dụng sẽ yields "downstream" đến router và các controller cần xử lý cho đến khi kết thúc. Control sẽ quay back lại hàm (middleware) này, tính thời gian thực thi và log ra màn hình.

Một ví dụ khác khi xử lý kết quả trả về được xử lý ở nhiều nơi khác nhau. Với Express có thể phức tạp hơn nhiều, và phải kết hợp với template engine (như handlebars, ...)

```
app.use(function *() {
  this.body = "...header stuff";
  yield saveResults();
  //could do some other yield here 
  this.body += "...footer stuff"
});

function saveResults*() {
  //save some results
  this.body += "Results Saved!";
  //could do some other yield here
}
```

Tìm hiểu đầy đủ về middleware Koa tại đây: [https://github.com/koajs/koa/blob/master/docs/guide.md](https://github.com/koajs/koa/blob/master/docs/guide.md)

## Koa lightweight ##
Khác với Express với hàng tá các middleware được cài đặt sẵn. Định hướng là 1 framework core tinh gọn, Koa không có bất kì middleware được tích hợp sẵn cả.

Có nhiều chức năng mà bạn sẽ cần phải cài thêm khi sử dụng koa tùy theo nhu cầu: routing, body parsing, basic authentication, static file serving, template rendering, ... Danh sách các middleware được liệt kê ở wiki: [https://github.com/koajs/koa/wiki](https://github.com/koajs/koa/wiki)

Một số middleware nổi bật nên cài như:

- [koa-static](https://github.com/koajs/route)
- [koa-router](https://github.com/alexmingoia/koa-router)
- [koa-body-parser](https://github.com/thomseddon/koa-body-parser)
- [co-views](https://github.com/visionmedia/co-views)
- [co-request](https://github.com/leukhin/co-request)
- [koa-passport](https://github.com/rkusa/koa-passport)
- [koa-session](https://github.com/koajs/session)
- ...

## Next ##
Koa tinh gọn, nên một số framework khác được build sẵn, bổ sung các chức năng mà koa đang thiếu:

- [api-boilerplate](https://github.com/koajs/api-boilerplate) - an API application boilerplate
- [koa-generator](https://github.com/base-n/koa-generator) - Koa' application generator just like express-generator(support 1.x && 2.x)
- [koala](https://github.com/koajs/koala) - a more feature-rich version of Koa (tích hợp sẵn nhiều middlewares có ích)
- [koan](https://github.com/soygul/koan) - Full stack JavaScript Web development boilerplate with Koa and Angular
- [surface](https://github.com/zedgu/surface) - A tiny middleware of RESTful API for koa
- ...

Với những bạn mới, tôi khuyên nên bắt đầu trước với koala hoặc koan.

## Tham khảo ##

- Trang chủ - [http://koajs.com](http://koajs.com/)
- Koa github - [https://github.com/koajs/koa](https://github.com/koajs/koa)
- [Koajs.in](http://koajs.in/) - A complete, easy to view Koa documentation
- [A look at callbacks vs generators vs coroutines](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127#.w70iawu11)
- [Beyond Node.js Express: An Intro to Koa.js and a Preview of Zones](https://strongloop.com/strongblog/node-js-express-introduction-koa-js-zone/)
