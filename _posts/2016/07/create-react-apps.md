---
template: post
title: 'Create React apps: công cụ generate React chính thức từ Facebook, không cần
  cấu hình.'
date: "2016-07-25"
author: Van-Duyet Le
tags:
- Redux
- Tutorial
- Tutorials
- React
- facebook
modified_time: '2016-07-25T09:31:24.499+07:00'
thumbnail: https://3.bp.blogspot.com/-HahL2Dcmo7o/V5Vz1SQORXI/AAAAAAAAaMM/HomR1n60e4oKER20VhEDSIZQag-nQqptwCK4B/s1600/create-react-app.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2331782777537838966
blogger_orig_url: https://blog.duyet.net/2016/07/create-react-apps.html
slug: /2016/07/create-react-apps.html
category: Javascript
description: Facebook ra mắt công cụ mới Create React App - generate ra React starter project.
fbCommentUrl: http://blog.duyetdev.com/2016/07/create-react-apps.html
---

Một thông tin mới cực kỳ hấp dẫn với cộng đồng [React trong tuần này](http://saveto.co/AIqXFq)! Facebook ra mắt công cụ mới **Create React App** - generate ra React starter project. Cài đặt rất nhanh và không cần phải cấu hình (react, webpack, ...) gì cả, project nhỏ gọn, không có quá nhiều dependencies. Cùng tìm hiểu nhanh về công cụ này.

[![](https://3.bp.blogspot.com/-HahL2Dcmo7o/V5Vz1SQORXI/AAAAAAAAaMM/HomR1n60e4oKER20VhEDSIZQag-nQqptwCK4B/s1600/create-react-app.png)](https://blog.duyet.net/2016/07/create-react-apps.html#.V5V54XV97OQ)
Khi nào cần đến Redux, React Router, ... bạn có thể dụng npm install để cài đặt sau.

## Quick Start ##
Cài đặt create-react-app bằng npm, thêm `-g` flag (để "globally").

```
sudo npm install -g create-react-app
```

Sau khi cài, ta sử dụng lệnh create-react-app để generate a project:

```
create-react-app hello-awesomeness && cd hello-awesomeness
```

Đợi cho cho đến khi cài đặt package cần thiết hoàn thành. create-react-app cũng tự động cấu hình ứng dụng. Sau khi cài đặt xong ta được cấu trúc project như thế này:

```
favicon.ico
index.html
package.json
node_modules/
README.md
src/
   App.css
   App.js
   index.css
   index.js
   logo.svg
```

Cuối cùng để build và run, sử dụng lệnh:  

```
npm start
```

Rất nhanh chóng là bạn đã có thể bắt đầu code cho project mới rồi, không cần các bước cấu hình quá phức tạp.

![](https://3.bp.blogspot.com/-uMo1EyHerQg/V5V49HgNy_I/AAAAAAAAaMY/R9jonvqbrqo3B0l7H8wtzZ-kTpuYPwFJgCLcB/s1600/create-react-app.png)

## Tham khảo ##

- [https://github.com/facebookincubator/create-react-app](http://saveto.co/AIqXFq)
- [Create React App: The Fast, Official, and Build-Free Way to Create React Projects](https://daveceddia.com/create-react-app-official-project-generator/)
