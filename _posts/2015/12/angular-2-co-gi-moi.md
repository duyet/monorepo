---
template: post
title: Angular 2 có gì mới?
date: "2015-12-20"
author: Van-Duyet Le
tags:
- data binding
- Angular
- angular 2
modified_time: '2016-01-11T02:00:01.346+07:00'
thumbnail: https://1.bp.blogspot.com/-ns1tQ1-Aw4E/VnZPOxT1x7I/AAAAAAAAMGI/0am16xApXRU/s1600/angularjs_logo.svg_-650x401.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1819946190652739302
blogger_orig_url: https://blog.duyet.net/2015/12/angular-2-co-gi-moi.html
slug: /2015/12/angular-2-co-gi-moi.html
category: Javascript
description: Cách đây vài hôm Angular 2 chính thức ra mắt, phiên bản Beta
fbCommentUrl: none
---

Cách đây vài hôm Angular 2 chính thức ra mắt, phiên bản Beta. Theo như t[henextweb](http://thenextweb.com/dd/2015/12/16/angular-2-hits-beta-and-its-a-big-deal-for-the-future-of-the-web/), angular 2 hứa hẹn sẽ là tương lai mới của công nghệ Web hiện đại hiện nay.

![](https://1.bp.blogspot.com/-ns1tQ1-Aw4E/VnZPOxT1x7I/AAAAAAAAMGI/0am16xApXRU/s1600/angularjs_logo.svg_-650x401.png)
Angular 2 có nhiều điểm mới, nhìn sơ bộ có thể thấy angular có thiết kế mới, sử dụng ES6, hiệu suất và tốc độ được nâng cao

- Performance: Angular 2  cung cấp phương thức detection nhanh hơn, template precompilation để tăng tốc độ render ở client, bootstrap time nhanh hơn, view caching, lazy loading, sử dụng bộ nhớ ít hơn, immutable data structures, hỗ trợ incremental loading đối với dependencies injection và hàng tá thứ khác làm cho nó nhanh hơn.
- Hỗ trợ template tốt hơn – Angular 2 có cú pháp template mới dễ đọc hơn, bỏ bớt một số directive, tích hợp tốt hơn với Web Component. Trong tương lai họ còn mong muốn tạo ra tool hỗ trợ báo lỗi ngay trong lúc viết code như các ngôn ngữ compile.
- Angular 2, ứng dụng được phân tách thành hai phần đó là application layer và render layer. Điều này cho phép Angular có thể chạy trên những môi trường khác ngoài browser như Web Workers hay thậm chí là server.

### AtScript ###
AtScript là cú pháp mở rộng của ES6, ngôn ngữ này được dùng để phát triển Angular 2.0. Tuy nhiên bạn vẫn có thể sử dụng Javacript/ES5 thuần để code ứng dụng Angular 2.
### Templating và Data Binding ###

- Dynamic Loading: chức này hiện là điểm thiếu xót trong Angular 1.0, chức năng cho phép lập trình viên thêm directives hoặc controller một cách tự động.
- Templating: Template sẽ đươc biên dịch bất đồng bộ, giúp tăng tốc độ của ứng dụng.
- Directives: Angular 2.0 cung cấp 3 loại directives:

- Component Directives: tái sử dụng code (template, css, js,..) dưới dạng components.
- Decorator Directives
- Template Directives

### Routing Solution ###

Router trong angular ban đầu được thiết kế để định nghĩa cho 1 số dạng route trong ứng dụng, nhưng nếu ứng dụng một khi lớn, việc định nghĩa từng route sẽ vô cùng khó khăn. Angular đã thiết kế lại route giúp sử dụng một cách đơn giản hơn. 

- Simple JSON-based Route Config (Cấu hình bằng cú phá
- Optional Convention over Configuration
- Static, Parameterized and Splat Route Patterns
- URL Resolver
- Query String Support (Hỗ trợ Query String, ví dụ: /post?id=122)
- Use Push State or Hashchange
- Navigation Model (For Generating a Navigation UI)
- Document Title Updates
- 404 Route Handling
- Location Service
- History Manipulation

### Child Router ###

Child Router biến mỗi components thành một ứng dụng nhỏ hơn, mỗi ứng dụng này lại có 1 bộ router riêng.

### Screen Activator ###

Cái này chưa rõ, mình sẽ tìm hiểu sau.

### Logging ###

Angular 2 nay sử dụng thêm bộ logging service mới tên là [diary.js](https://github.com/angular/diary.js/tree/master) - rất hữu ích trong debug và kiểm soát ứng dụng. 

### Scope ###

$scope sẽ được loại bỏ trong Angular 2
