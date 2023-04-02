---
template: post
title: Nodejs - Giới thiệu Yeoman, Grunt và Bower
date: "2015-04-20"
author: Van-Duyet Le
tags:
- Nodejs
- Grunt
- Bower
- Yeoman
modified_time: '2015-05-17T11:50:32.805+07:00'
thumbnail: https://1.bp.blogspot.com/-S3xORsBBOes/VTUU2dzVT9I/AAAAAAAACTw/v0XhVPBgDfE/s1600/bower.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2942387526104683237
blogger_orig_url: https://blog.duyet.net/2015/04/nodejs-gioi-thieu-yeoman-grunt-va-bower.html
slug: /2015/04/nodejs-gioi-thieu-yeoman-grunt-va-bower.html
category: Javascript
description: Chuyển từ PHP sang Nodejs thật có nhiều cái bỡ ngỡ. Cấu trúc được viết dưới dạng None-Blocking tăng tốc độ xử lý và chịu tải lên cực cao. Ứng dụng cũng được viết nhanh hơn rất nhiều nhờ các package và trình quản lý gói npm. Trong bài viết này mình sẽ giới thiệu về 1 số tools mà hầu như mọi lập trình viên Nodejs nào cũng cần phải biết qua, đó là Bower, NPM, Grunt và Yeoman.
fbCommentUrl: none

---

Chuyển từ PHP sang Nodejs thật có nhiều cái bỡ ngỡ. Cấu trúc được viết dưới dạng None-Blocking tăng tốc độ xử lý và chịu tải lên cực cao. Ứng dụng cũng được viết nhanh hơn rất nhiều nhờ các package và trình quản lý gói npm. Trong bài viết này mình sẽ giới thiệu về 1 số tools mà hầu như mọi lập trình viên Nodejs nào cũng cần phải biết qua, đó là Bower, NPM, Grunt và Yeoman.

## Giới thiệu Bower ##

Bower ([http://bower.io](http://bower.io/)) là công cụ quản lý các packages và components frontend cho web. Được viết bởi Twitter Inc. Nó có thể tìm kiếm, cài đặt hoặc gỡ bõ các gói thư viện (package) web như Javascript, CSS, HTML.

![](https://1.bp.blogspot.com/-S3xORsBBOes/VTUU2dzVT9I/AAAAAAAACTw/v0XhVPBgDfE/s1600/bower.png)

### Cài đặt ###

Trước khi cài đặt, bạn phải chắc chắc rằng đã cài đặt thành công Nodejs và Npm. Sau khi đã cài xong ta tiến hành cài đặt bower bằng câu lệnh sau:

```
$ npm install -g bower
```

### Cách cài đặt gói thông qua Bower  ###

Ta có thể sử dụng bower để cài đặt một package, ví dụ cài đặt jquery. Tạo một thư mục và chạy lệnh.

```
$ bower install jquery
```

Bên cạnh đó, ta còn có thể cài đặt 1 phiên bản đặc biệt của package bằng cách thêm dấu thăng (#) và số hiện phiên bản sau tên của package.

```
$ bower install jquery#1.7.0
```

Bên cạnh đó ta còn có thể sử dụng bower với git.

```
$ bower install https://github.com/lvduit/javascript.git
```

Giả sử bạn muốn sử dụng thư viện bootstrap, nhưng bạn không chắc chắn thư viện nào sẽ sử dụng. Ta có thể sử dụng bower để tìm kiếm xem có những thư viện nào có tên boostrap.

```
$ bower search boostrap
```

Xem các package đã cài đặt

Để xem các package đã cài đặt trong thư mục project hiện tại,

```
$ bower list
```

Mình sẽ nói chi tiết hơn về Bower ở một bài viết khác.

## Giới thiệu Grunt ##

Grunt ([http://gruntjs.com](http://gruntjs.com/)) là tool tự động hoá cho các dự án Nodejs. Ta có thể Minify code, biên dịch, unit test, validate, ... Bạn có thể tự động hoá mọi công việc để giảm effort.

![](https://2.bp.blogspot.com/-bEpKWPHnB0k/VTUVwgNafOI/AAAAAAAACT4/WelLMu7wB-U/s1600/grunt.png)

## Với thiệu về Yeoman ##

Trang chủ: [yeoman.io](http://yeoman.io/)

![](https://3.bp.blogspot.com/-iWaRUE9laHg/VTUQLSe3r4I/AAAAAAAACTk/BQhQmLPIiMo/s1600/yeoman.png)

Yeoman (yo) là 1 công cụ tạo khung, lên khung các app mới, hỗ trợ bạn generate các đoạn script, frameworks, ...bằng Nodejs, Angularjs, ... Yeoman không chỉ là tools mà còn được sử dụng như là 1 workflow, tập hợp các "best practices" giúp cho việc phát triển ứng dụng Nodejs một cách nhanh chóng và dễ dàng hơn.
Dễ dàng tạo phần khung sườn cho những dự án mới, với các template tuỳ chỉnh được thông qua dòng lệnh. Yeoman còn tạo config cho Grunt và đưa vào các task Grunt cần cho việc build app.

Chức năng:

- Yeoman hiện tại có các bộ generator cho Angular, Backbone, React, Polymer và hơn [1500+ projects khác](http://yeoman.io/generators). 
- Hệ thống build process hỗ trợ minify script và css, tối ưu ảnh và HTML, biên dịch coffeescript, sass, less.
- Tất cả các script và js đều được tự động chạy qua JSHint để đảm bảo script được viết best-practives. Các bạn có thể tìm hiểu thêm về JSHint và CssHint. 
- Tối ưu ảnh cực tốt (OptiPNG và JPEGTran).
- Package Management: có thể tìm kiếm, cài đặt packages mới thông quan terminal mà không cần mở trình duyệt. 
- PhantomJS Unit Testing.

Yeoman + Bower + Grunt - Bộ 3 song hành

![](https://4.bp.blogspot.com/-RfsS9jWKACs/VTUWnPxbkPI/AAAAAAAACUA/st104-Cz0zg/s1600/workflow.c3cc.jpg)

### Cài đặt Yeoman ###

```
$ npm install -g yo
```

Sau khi cài đặt, bạn cần phải cài các bộ generator tương ứng, cần thiết cho app của bạn.
Danh sách các bộ Generators bạn có thể tìm thấy ở đây: [http://yeoman.io/generators](http://yeoman.io/generators)

Ví dụ ở đây mình muốn cài bộ Generator angular-fullstack "AngularJS with an Express server", để bắt đầu dựng 1 khung cho project mới của mình. Angular Fullstack bao gồm Expressjs để xử lý phần Server, Angular để xử lý API phía Clients.

```
$ npm install -g generator-angular-fullstack
```

Tạo thư mục mới để bắt đầu code nào:

```
$ mkdir lvduit-project && cd $_
```

Chạy Yeomam yo angular-fullstack

```
$ yo angular-fullstack
```

Tuỳ theo mỗi bộ Generators mà sẽ có các câu hỏi khác nhau để build bộ khung cho bạn.

Ở đây ngày Yeo hỏi mình sử dụng Javascript hay CoffeeScript, chọn Javascript, nhấn Enter

![](https://1.bp.blogspot.com/-JS4IVTQ76pE/VTUZ0WWP0sI/AAAAAAAACUM/Y4E3uTeypDc/s1600/yeo-gen-1.png)

Template sử dụng HTML thuần hay Jade.
Stylesheets là CSS, Sass, Stylus hay less.
Bla bla ...

![](https://3.bp.blogspot.com/-v5ljyFQlBCg/VTUbE1af25I/AAAAAAAACUY/Wb39OZzT_cc/s1600/yeo-gen-2.png)

Sau khi trải qua hết các bước "tra khảo", mọi công việc còn lại Yeoman sẽ làm tất: chạy bower để cài đặt các component, chạy npm cài đặt các package nodejs, tạo grunt task, ...

![](https://2.bp.blogspot.com/-rWE7j79ddcs/VTUcP7G-CAI/AAAAAAAACUk/1zpNC_27ZTk/s1600/yeo-gen-3.png)

Ok như vậy là bạn đã có thể bắt đầu code được rồi đấy, thật là dễ dàng và nhanh chóng để có 1 bộ khung cho ứng dụng.
Không dừng ở đó, bạn cũng còn có thể tạo bổ sung thêm các module nhỏ (như Angular module, Express module, CRUD, ...) bằng yo, bạn có thể xem thêm chi tiết về những cái này tại trang Github của Yeo Generator.

## Kết ##
Thật dễ dàng khi bắt đầu xây dựng các ứng dụng Nodejs với sự hỗ trợ của Yeoman và các trình quản lý gói. Mình sẽ cố gắng bổ sung các bài viết chi tiết về Bower, Grunt, Gulp, Npm, ...

Yeoman Tutorial: [http://yeoman.io/codelab.html](http://yeoman.io/codelab.html)
Search Bower Package: [http://bower.io/search](http://bower.io/search)
Bower Getting Started: [http://bower.io/#getting-started](http://bower.io/#getting-started)
