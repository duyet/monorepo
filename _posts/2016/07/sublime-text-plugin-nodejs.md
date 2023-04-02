---
template: post
title: Sublime Text Plugin nào cho lập trình viên Node.js
date: "2016-07-20"
author: Van-Duyet Le
tags:
- Tutorial
- sublime text
- Tutorials
- Javascript
- React
- Node.js
- Node
modified_time: '2016-07-20T11:16:14.977+07:00'
thumbnail: https://3.bp.blogspot.com/-Vk9xy2-YHhQ/V476BZ29wmI/AAAAAAAAaC8/dzgxlK1P5nQ-GNPbynkCDUxxHmwYl4rxACK4B/s1600/package-control-duyetdev.gif
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1764480450440533459
blogger_orig_url: https://blog.duyet.net/2016/07/sublime-text-plugin-nodejs.html
slug: /2016/07/sublime-text-plugin-nodejs.html
category: Web
description: Hôm nay mình sẽ giới thiệu 1 số plugin cần có để lập trình Node.js trên Sublime.
fbCommentUrl: none

---

Trước mình có viết 1 bài về giới thiệu Sublime Text, các [plugin hay cho lập trình viên PHP](https://blog.duyet.net/2014/03/sublime-text-3-editor-manh-me-cho-lap.html). Hôm nay mình sẽ giới thiệu 1 số plugin cần có để lập trình Node.js trên Sublime.

[![](https://3.bp.blogspot.com/-Vk9xy2-YHhQ/V476BZ29wmI/AAAAAAAAaC8/dzgxlK1P5nQ-GNPbynkCDUxxHmwYl4rxACK4B/s1600/package-control-duyetdev.gif)](https://blog.duyet.net/2016/07/sublime-text-plugin-nodejs.html)

## [HTML-CSS-JS Prettify](https://packagecontrol.io/packages/HTML-CSS-JS%20Prettify) ##
Plugin này cho phép bạn định dạng pretty code cho Javascript, HTML, CSS và cả JSON. Bạn có thể tùy chỉnh lại định dạng cho phù hợp với phong cách cá nhân hoặc của cả team, hỗ trợ local config bằng file `.jsbeautifyrc`.

Cài đặt:

1. Nhấn `Ctrl+Shift+P` hoặc `Cmd+Shift+P`
2. Gõ `install`, chọn `Package Control: Install Package`
3. Gõ `prettify`, chọn `HTML-CSS-JS Prettify`

## [Nodejs](https://packagecontrol.io/packages/Nodejs) ##
Plugin cung cấp chức năng tự động completion code, gợi ý hàm cho các module, một số công cụ để lập trình Node (run code, debug, Uglify, NPM trực tiếp trong Sublime, Build, ...).

[![](https://4.bp.blogspot.com/-tARsdYCr6hw/V47mwpshkBI/AAAAAAAAaB8/RvpFLnPwwBcjTJgGMBDDYesZgqlKBDeCgCK4B/s1600/node-plugin-subl.png)](https://4.bp.blogspot.com/-tARsdYCr6hw/V47mwpshkBI/AAAAAAAAaB8/RvpFLnPwwBcjTJgGMBDDYesZgqlKBDeCgCK4B/s1600/node-plugin-subl.png)

Cài đặt:

1. Nhấn `Ctrl+Shift+P` hoặc `Cmd+Shift+P` trên Linux/Windows/OS X
2. Gõ  `install`, chọn `Package Control: Install Package`
3. Gõ `node`, chọn `Nodejs `

## [Java​Script & Node​JS Snippets](https://packagecontrol.io/packages/JavaScript%20%26%20NodeJS%20Snippets) ##
Snippets giúp bạn tiết kiệm thời gian viết code rất nhiều. Nhất là các hàm dài và khó nhớ của Javascript.

[![](http://i.giphy.com/3o6ZsSVyRWQtoSJVkc.gif)](http://i.giphy.com/3o6ZsSVyRWQtoSJVkc.gif)

Cài đặt:

1. Nhấn `Ctrl+Shift+P` hoặc  `Cmd+Shift+P` trên Linux/Windows/OS X
2. Gõ `install`, chọn `Package Control: Install Package`
3. Tìm và chọn `Java​Script & Node​JS Snippets`

## [JSHint](https://packagecontrol.io/packages/JSHint) ##
Công cụ kiểm tra lỗi cú pháp cho Javascript và Node.js

[![](https://2.bp.blogspot.com/-J7nE0oaEXqk/V471ZPhhaeI/AAAAAAAAaCI/h98jbEXf_pc0JHCNbJfuMYKGU1I7Sp6_wCLcB/s1600/jshint-duyetdev.png)](https://2.bp.blogspot.com/-J7nE0oaEXqk/V471ZPhhaeI/AAAAAAAAaCI/h98jbEXf_pc0JHCNbJfuMYKGU1I7Sp6_wCLcB/s1600/jshint-duyetdev.png)

Để cài JSHint trong sublime, trước tiên cần cài JSHint Package bằng NPM.

```
sudo npm install -g jshint
```

Sau đó cài đặt JSHint bằng Package Control như bình thường.

## [Babel](https://packagecontrol.io/packages/Babel) ##
Babel đã quá nổi tiếng rồi, Package Babel hỗ trợ coding ES6, React với tệp mở rộng JSX.

[![](https://2.bp.blogspot.com/-hHnqzrhlgUY/V472sFiVLNI/AAAAAAAAaCY/cRVWJSBtvBg2xI_Qp3EP-ML9xgBP6i1AQCK4B/s640/8e99bbdc99a285708a1495a6e3dd68916753906e.png)](https://2.bp.blogspot.com/-hHnqzrhlgUY/V472sFiVLNI/AAAAAAAAaCY/cRVWJSBtvBg2xI_Qp3EP-ML9xgBP6i1AQCK4B/s1600/8e99bbdc99a285708a1495a6e3dd68916753906e.png)

Cài đặt:

1. Nhấn `Ctrl+Shift+P` hoặc `Cmd+Shift+P` trên Linux/Windows/OS X
2. Gõ `install`, chọn `Package Control: Install Package`
3. Tìm và chọn `Babel`

## [Babel Snippets](https://packagecontrol.io/packages/Babel%20Snippets) ##
Tương tự Java​Script & Node​JS Snippets, Babel Snippets cung cấp danh sách các snippets hữu ích cho React và ES6.

[![](https://4.bp.blogspot.com/-n959RoTjV9s/V474ccvmq_I/AAAAAAAAaCs/3_KB3VeL8VwpgAkwFEK9hYb4Nj2mDahRwCK4B/s1600/babel-snippets-duyetdev.gif)](https://4.bp.blogspot.com/-n959RoTjV9s/V474ccvmq_I/AAAAAAAAaCs/3_KB3VeL8VwpgAkwFEK9hYb4Nj2mDahRwCK4B/s1600/babel-snippets-duyetdev.gif)

Cài đặt:

1. Nhấn `Ctrl+Shift+P` hoặc `Cmd+Shift+P` trên Linux/Windows/OS X
2. Gõ `install`, chọn `Package Control: Install Package`
3. Tìm và chọn `Babel Snippets`
