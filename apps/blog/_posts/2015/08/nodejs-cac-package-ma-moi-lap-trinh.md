---
title: Nodejs - Các package mà mọi lập trình viên Nodejs đều phải biết.
date: '2015-08-07'
author: Duyet
tags:
  - Node.js
  - NPM
modified_time: '2015-08-07T20:38:19.130+07:00'
slug: /2015/08/nodejs-cac-package-ma-moi-lap-trinh.html
category: Javascript
description: Nodejs module (hay npm module) giúp lập trình viên Nodejs phát triển ứng dụng cực nhanh, lý do là các việc cần xử lý hầu hết là các module đã giải quyết cho chúng ta rồi. Sau mình sẽ liệt kê danh sách các module mà bất cứ ai khi bắt đầu học Nodejs đều phải biết.
---

> **⚠️ Lưu ý (2025)**: Bài viết này được viết năm 2015. Nhiều package được đề cập không còn được khuyên dùng cho các dự án mới. Tham khảo phần ghi chú bên cạnh mỗi package để cập nhật thông tin.

Nodejs module (hay npm module) giúp lập trình viên Nodejs phát triển ứng dụng cực nhanh, lý do là các việc cần xử lý hầu hết là các module đã giải quyết cho chúng ta rồi. Sau mình sẽ liệt kê danh sách các module mà bất cứ ai khi bắt đầu học Nodejs đều phải biết.

1. [express](https://www.npmjs.com/package/express)(Fast, unopinionated, minimalist web framework) - Đây là một trong những module (hay framework) được sử dụng nhiều nhất, expressjs là bộ khung giúp bạn dựng các ứng dụng web trên Nodejs, bạn có thể dễ dàng custom router, controller, ... với express.
2. [async](https://www.npmjs.com/package/async)(Higher-order functions and common patterns for asynchronous code) - workflow của nodejs chạy theo hướng bất đồng bộ và callback, đây là một trong những điểm mạnh của nodejs. Nhưng đây lại là nỗi khốn khổ của phần lớn begginner bởi không thể kiểm soát được các luồng của async. Async là module giúp bạn khử bất đồng bộ, chạy các hàm 1 cách tuần tự. **[Lưu ý 2025: Lỗi thời - Sử dụng native `Promise` và `async/await` thay thế]**
3. [lodash](https://www.npmjs.com/package/lodash)(The modern build of lodash modular utilities) - lodash giúp bạn tăng sức mạnh cho ứng dụng javascript và nodejs với các hàm mở rộng để xử lý chuỗi, mảng, object, ...
4. [underscore](https://www.npmjs.com/package/underscore)(JavaScript's functional programming helper library.) - cũng giống như lodash, underscore có thể xử lý ở frontend lẫn backend, 2 package này do 2 tác giả khác nhau phát triển, nhưng về cơ bản đều có những chức năng giống nhau. **[Lưu ý 2025: Lỗi thời - Lodash được ưa thích hơn, hoặc dùng native JS methods]**
5. [bower](https://www.npmjs.com/package/bower)(The browser package manager) - trình quản lý resource (css, js...), được phát triển bởi twitter. Bower giúp bạn quản lý, cập nhật và cài đặt các thư viện frontend cực kì dễ dàng, chỉ với 1 dòng lệnh. **[⚠️ DEPRECATED 2017 - KHÔNG dùng cho dự án mới. Dùng npm/yarn hoặc bundler hiện đại (Vite, Webpack, esbuild)]**
6. [moment](https://www.npmjs.com/package/moment)(Parse, validate, manipulate, and display dates) - Cung cấp các hàm helper để xử lý, tính toán, xác thực, hiển thị, ... thời gian trong javascript. **[Lưu ý 2025: Maintainers không khuyến cáo cho dự án mới. Thay thế bằng date-fns, Day.js, hoặc js-Temporal API]**
7. [mysql](https://www.npmjs.com/package/mysql)(A node.js driver for mysql. It is written in JavaScript, ...) - mysql.js giúp bạn dễ dàng kết nối đến cơ sở dữ liệu mysql bằng Nodejs. **[Lưu ý 2025: Xem xét mysql2/promise để hỗ trợ tốt hơn và type safety]**
8. [grunt](https://www.npmjs.com/package/grunt)(The JavaScript Task Runner) - Grunt giúp tự động hóa các công việc mà bạn phải lặp đi lặp lại. Ví dụ bạn cho thể lập trình cho grunt tự động nén js, css, dọn file tạm, migrate database, kiểm tra các lỗi sau đó khởi động server web. **[Lưu ý 2025: Lỗi thời - Sử dụng Turbo, Vite, Webpack, esbuild, hoặc npm scripts thay thế]**
9. [socket.io](https://www.npmjs.com/package/socket.io)(node.js realtime framework server) - Socket.io là package giúp tạo các ứng dụng realtime bằng kết nối socket.
10. [mongoose](https://www.npmjs.com/package/mongoose) (Mongoose MongoDB ODM) - mongoose có sẵn các hàm giúp tương tác đến CSDL MongoDB một cách dễ dàng.

Còn tiếp ... Mình sẽ cố gắng cập nhật thêm danh sách này, mới mỗi package sẽ có bài giới thiệu và hướng dẫn cụ thể sau.
