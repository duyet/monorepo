---
template: post
title: Nodejs - Các kỹ thuật Crawler, rút trích dữ liệu với Nodejs
date: "2015-08-08"
author: Van-Duyet Le
tags:
- Nodejs
- crawler
modified_time: '2015-08-08T17:37:55.222+07:00'
thumbnail: https://3.bp.blogspot.com/-Cwxzj6-qXVo/VcXRtQa3L4I/AAAAAAAACss/YD6WVCG84JE/s1600/nodejs-crawler.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7607409219779563626
blogger_orig_url: https://blog.duyet.net/2015/08/cac-ky-thuat-crawler-rut-trich-du-lieu.html
slug: /2015/08/cac-ky-thuat-crawler-rut-trich-du-lieu.html
category: Data Engineer
description: Nhân dịp tuyển sinh ĐH này, mình có project về thu thập dữ liệu tuyển sinh của các thí sinh trên trang của các trường ĐH. Project này mục tiêu là thu thập toàn bộ thông tin của thí sinh (SBD, tên, tuổi, điểm các môn, nguyện vọng các ngành, trường mà thí sinh nộp xét tuyển, ...). Điều oái oăm là mỗi trường công bố dữ liệu 1 cách hết sức ... tùm lum và tào lao.
fbCommentUrl: http://blog.duyetdev.com/2015/08/cac-ky-thuat-crawler-rut-trich-du-lieu.html
---

Nhân dịp tuyển sinh ĐH này, mình có project về thu thập dữ liệu tuyển sinh của các thí sinh trên trang của các trường ĐH. Project này mục tiêu là thu thập toàn bộ thông tin của thí sinh (SBD, tên, tuổi, điểm các môn, nguyện vọng các ngành, trường mà thí sinh nộp xét tuyển, ...). Điều oái oăm là mỗi trường công bố dữ liệu 1 cách hết sức ... tùm lum và tào lao.
Có trường hiện đại thì show dữ liệu trực tiếp lên web, trường thì up đại 1 file excel, oái hơn là bỏ vào file pdf :v
Nhiệm vụ của mình là thu thập dữ liệu từ nhiều nguồn thô như vậy một cách tự động. Mỗi trường được viết thành 1 module riêng và có cách để crawler riêng. Bài viết này chủ yếu giới thiệu về các dạng để crawler đặc trưng nhất, và cho thấy được sức mạnh của Nodejs.

![](https://3.bp.blogspot.com/-Cwxzj6-qXVo/VcXRtQa3L4I/AAAAAAAACss/YD6WVCG84JE/s1600/nodejs-crawler.png)

#### Github project ####
Có thể xem thêm code của project tại Github tại đây: [https://github.com/duyet/Crawler-DKXT-DH-2015](https://github.com/duyet/Crawler-DKXT-DH-2015)

## Bóc tách bảng HTML và dò đường (với bảng có phân trang) ##

Đây là cách dễ và cũng là dạng crawler phổ biến nhất. Với bảng có phân trang, chúng ta phải lập trình để spider có thể dò được link của trang tiếp theo cho đến khi lấy hết được nội dung. 

Mình sử dụng package node-crawler ([https://github.com/duyet/node-crawler](https://github.com/duyet/node-crawler))

Cài đặt: 

```
$ npm install crawler
```

Crawler module có khả năng:

- Bóc tách HTML theo DOM 
- Có thể sử dụng selector của jQuery backend để dò và lấy các phần tử trong trang.
- Điều chỉnh được pool size, số lần request, retries (thử lại nếu request thất bại)
- Điều chỉnh độ ưu tiên của các link.

```js
var Crawler = require("crawler");
var url = require('url');

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, result, $) {
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        $('a').each(function(index, a) {
            var toQueueUrl = $(a).attr('href');
            c.queue(toQueueUrl);
        });
    }
});

// Queue just one URL, with default callback
c.queue('http://joshfire.com');

// Queue a list of URLs
c.queue(['http://jamendo.com/','http://tedxparis.com']);

// Queue URLs with custom callbacks & parameters
c.queue([{
    uri: 'http://parishackers.org/',
    jQuery: false,

    // The global callback won't be called
    callback: function (error, result) {
        console.log('Grabbed', result.body.length, 'bytes');
    }
}]);

// Queue using a function
var googleSearch = function(search) {
  return 'http://www.google.fr/search?q=' + search;
};
c.queue({
  uri: googleSearch('cheese')
});

// Queue some HTML code directly without grabbing (mostly for tests)
c.queue([{
    html: '<p>This is a <strong>test</strong></p>'
}]);

```

Đang cập nhật thêm....
