---
template: post
title: Nodejs - package.json là gì vậy?
date: "2015-02-22"
author: Van-Duyet Le
category: Javascript
tags:
- Nodejs
- NPM
- Package.json
modified_time: '2015-02-22T13:56:30.535+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7493248599588947827
blogger_orig_url: https://blog.duyet.net/2015/02/nodejs-packagejson-la-gi-vay.html
slug: /2015/02/nodejs-packagejson-la-gi-vay.html
description: "Khi bạn bắt đầu làm quen với việc xây dựng 1 trang web với Nodejs, 1 thứ mà bạn vẫn thường luôn thấy trong các source ở github đó là: `package.json`. Vậy nó là gì, tại sao chúng ta luôn cần phải có nó khi xây dựng 1 ứng dụng bằng Nodejs"
fbCommentUrl: none

---

Khi bạn bắt đầu làm quen với việc xây dựng 1 trang web với Nodejs, 1 thứ mà bạn vẫn thường luôn thấy trong các source ở github đó là: `package.json`. Vậy nó là gì, tại sao chúng ta luôn cần phải có nó khi xây dựng 1 ứng dụng bằng Nodejs

## Giới thiệu ##

`package.json` là file đặc biệt, bạn có thể hiểu nó là 1 document giúp bạn biết được trong cái đống code này cần có những gói nào (Nói thêm nodejs xây dựng dựa trên nhiều module gọi là package, quản lý thông quan npm). `Package.json` là file cấu hình của npm, giúp cho npm hiểu nó cần phải cài đặt cái gì, thông tin về ứng dụng, phiên bản, ...

File `package.json` được viết bằng json 

File `package.json` được đặt ở thư mục gốc của project.

Cho xem mắt xíu nè, đây là nội dung thường thấy của 1 file `package.json` 

```js
{
  "name" : "Vote-sc-UIT",
  "description" : "Realtime Vote System base anonymous.",
  "homepage" : "http://project.lvduit.com/nodejs/vote-sc-uit/",
  "keywords" : ["vote", "realtime", "" "functional", "server", "client", "browser"],
  "author" : "Van-Duyet Le <lvduit08@gmail.com>",
  "contributors" : [],
  "dependencies" : {
        "async": "~0.9.0",
        "body-parser": "~1.5.2",
        "bower": "~1.3.8",
        "compression": "~1.0.9",
        "connect-flash": "~0.1.1",
        "connect-mongo": "~0.4.1",
        "consolidate": "~0.10.0",
        "cookie-parser": "~1.3.2",
        "cron": "^1.0.5",
        "express": "~4.7.2"
  },
  "main" : "app.js",
  "version" : "1.1.6"
}
```

## Các thành phần của `Package.json`  ##
`Package.json` chứa rất nhiều thông tin, thường thì ta chỉ quan tâm đến vài thuộc tính chính thôi.

### name ###
Tên của project hoặc package, nên viết hoa cho thuộc tính name. Đây là thuộc tính bắt buộc. Ngoài ra bạn có thể public project của bạn, thì thuộc tính name này sẽ là package name, nên cái này phải là duy nhất nhé.

### version ###
Phiên bản của project. Cách ghi version hiện nay được quy đinh bởi 1 ông nào đó tên Semantic Versioning. Ông quy định thế này, phiên bản phải gồm 3 phần `MAJOR.MINOR.PATCH`
Theo nguyên văn, trong đó:

- `MAJOR` version when you make incompatible API changes
- `MINOR` version when you add functionality in a backwards-compatible manner
- `PATCH` version when you make backwards-compatible bug fixe

Ví dụ: 

```js
{
  "name" : "Vote-sc-UIT",
  "version" : "1.1.3"
}
```

### description ###
Đoạn mô tả của project. Chú ý viết ngắn gọn xúc tích rõ ràng dễ hiểu, không hư cấu nhé.

### author ###
Thông tin về tác giả. Mình hy vọng 1 ngày 1 package nào đó trên npm có tên của bạn nhé.

### dependencies ###

Cái này quan trọng đây. Trong project, bạn sẽ phải sử dụng rất nhiều gói, những gói này đã được viết sẵn, chỉ cần require rồi quất thôi. 

Ví dụ: ta có package `sails` hoặc `express` là framework, `jade` là gói template engine, `socket.io` hỗ trợ ứng dụng realtime, ....

Để làm việc này, bạn cần phải install gói đó bằng npm. Thuộc tính `dependencies` giúp npm biết được cần phải cài đặt những package nào. 

Ví dụ nhé: 

```js
"dependencies" : {
        "async": "*",
        "body-parser": "~1.5.2",
        "bower": "~1.3.8",
        "compression": "~1.0.9",
        "connect-flash": "~0.1.1",
        "connect-mongo": "~0.4.1",
        "consolidate": ">0.10.0",
        "cookie-parser": "~1.3.2",
        "cron": "^1.0.5",
        "express": "~4.7.2"
  },

```

Giá trị trong thuộc tính này là 1 json, gồm tên package và version của package của gói đó. 
Khi có file `package.json` bạn có thể cài các gói này 1 cách tự động bằng lệnh

```shell
$ npm install
```

À, cách ghi version cũng khá quan trọng nhé, nhìn vào ví dụ bạn sẽ thấy 1 số cách ghi sau

- `"*"` Nếu như này thì npm sẽ install cho bạn phiên bản mới nhất của package.
- `"~1.5.2"` dấu ~ cho quy định cho npm sẽ tìm tất cả các phiên bản có dạng 1.5.x (từ >=1.5.0 đến <1.6.0 )
- `"^1.0.5"` version từ 1.0.5 đến <1.1.0
- `">0.10.0"` version phải lớn hơn 0.10.0

## Kết ##

Còn khá nhiều các thuộc tính và quy định trong `package.json`, bạn có thể tìm hiểu kĩ hơn tại đây nhé [https://docs.npmjs.com/files/package.json](https://docs.npmjs.com/files/package.json)
