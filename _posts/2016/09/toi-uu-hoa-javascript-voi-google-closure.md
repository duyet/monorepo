---
template: post
title: Tối ưu hóa Javascript với Google Closure Compiler
date: "2016-09-14"
author: Van-Duyet Le
tags:
- Optimize
- Javascript
- Gulp
- Node.js
- Google Closure
- Tối ưu
- Webpack
- Node
modified_time: '2016-09-14T11:46:14.393+07:00'
thumbnail: https://2.bp.blogspot.com/-XJmHynlIbNA/V9jI1Lbj5hI/AAAAAAAAduA/igD5n31EEUcfvwq_Y06IX2cPgsuoEKxZQCK4B/s1600/image00.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5575661335809480469
blogger_orig_url: https://blog.duyet.net/2016/09/toi-uu-hoa-javascript-voi-google-closure.html
slug: /2016/09/toi-uu-hoa-javascript-voi-google-closure.html
category: News
description: Closure Compiler là 1 dự án của Google giúp Javascript tải và chạy nhanh hơn. Không phải là biên dịch từ Javascript sang mã máy, mà Closure biên dịch từ Javascript sang better-Javascript. Tức là tự động viết lại Javascript sao cho tối ưu hóa nhất mà kết quả không thay đổi.
fbCommentUrl: none
---

[Closure Compiler](https://developers.google.com/closure/compiler/) là 1 dự án của Google giúp Javascript tải và chạy nhanh hơn. Không phải là biên dịch từ Javascript sang mã máy, mà Closure biên dịch từ Javascript sang better-Javascript. Tức là tự động viết lại Javascript sao cho tối ưu hóa nhất mà kết quả không thay đổi.

Closure sẽ đọc Javascript, thống kê, loại bỏ dead code, kiểm tra các biến và mối quan hệ giữa chúng, kiểu dữ liệu có hợp lý hay không, viết lại (rewrite) và nén sao cho tối ưu nhất có thể.

[![](https://2.bp.blogspot.com/-XJmHynlIbNA/V9jI1Lbj5hI/AAAAAAAAduA/igD5n31EEUcfvwq_Y06IX2cPgsuoEKxZQCK4B/s320/image00.png)](https://blog.duyet.net/2016/09/toi-uu-hoa-javascript-voi-google-closure.html)
Closure được triển khai sử dụng ở các dạng:

- Công cụ dòng lệnh command line (Java)
- Tools online, paste code vào và xuất ngay kết quả: [https://closure-compiler.appspot.com/home ](http://saveto.co/y2JGR5)
- [A RESTful API](https://developers.google.com/closure/compiler/docs/gettingstarted_api?csw=1).
- Build Systems: [Plugin cho Webpack hoặc Gulp](http://saveto.co/uRbdqp)

![](https://2.bp.blogspot.com/-Vt2-0KTh03o/V9jKPy7cOhI/AAAAAAAAduM/V1eWOzLo9pMSuSNHd2ccFhHtygyj4Ys2gCK4B/s1600/Screenshot%2Bfrom%2B2016-09-14%2B10-33-05.png)

Giao diện Web service

## closure-compiler-js ##

closure-compiler-js là project sử dụng được closure-compiler (Java) trên Javascript. Cài đặt closure-compiler-js qua npm

```
npm install --save google-closure-compiler-js
```

Mặc định Closure hỗ trợ chuyển ES6 sang ES5 và tối ưu hóa code

```js
const compile = require('google-closure-compiler-js').compile;

const flags = {
  jsCode: [{src: 'const x = 1 + 2;'}],
};
const out = compile(flags);
console.info(out.compiledCode);  // will print 'var x = 3;\n'
```

### Webpack  ###
Cấu hình webpack như bên dưới:

```js
const ClosureCompiler = require('google-closure-compiler-js').webpack;
const path = require('path');

module.exports = {
  entry: [
    path.join(__dirname, 'app.js')
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.min.js'
  },
  plugins: [
    new ClosureCompiler({
      options: {
        languageIn: 'ECMASCRIPT6',
        languageOut: 'ECMASCRIPT5',
        compilationLevel: 'ADVANCED',
        warningLevel: 'VERBOSE',
      },
    })
  ]
};
```

## Tham khảo  ##
Còn khá nhiều chức năng và tham số như angularPass, polymerPass, rewritePolyfills, ...

- Closure Compiler - [https://developers.google.com/closure/compiler/](https://developers.google.com/closure/compiler/)
- Work through the [Application Hello World](https://developers.google.com/closure/compiler/docs/gettingstarted_app).
- Closure Source Code - [https://github.com/google/closure-compiler](https://github.com/google/closure-compiler)
- Closure Compiler JS - [https://github.com/google/closure-compiler-js](https://github.com/google/closure-compiler-js)
