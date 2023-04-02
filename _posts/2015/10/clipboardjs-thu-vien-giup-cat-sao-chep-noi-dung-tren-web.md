---
template: post
title: Clipboard.js - thư viện giúp cắt/sao chép nội dung trên web một cách dễ dàng.
date: "2015-10-30"
author: Van-Duyet Le
tags:
- clipboard.js
- Javascript
modified_time: '2016-01-11T02:05:25.683+07:00'
thumbnail: https://3.bp.blogspot.com/-nogpFtDX4JE/VjNskDinauI/AAAAAAAAFfk/ciSSYDvmaKs/s1600/5ab0a950-5fb4-11e5-9602-e73c0b661883.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2216941621948862965
blogger_orig_url: https://blog.duyet.net/2015/10/clipboardjs-thu-vien-giup-cat-sao-chep-noi-dung-tren-web.html
slug: /2015/10/clipboardjs-thu-vien-giup-cat-sao-chep-noi-dung-tren-web.html
category: Javascript
description: Clipboard.js là một thư viện vô cùng gọn nhẹ (2kb) giúp bạn dễ dàng cắt hoặc sao chép nội dung trên trang web một cách dễ dàng. Được sử dụng trong các trường hợp bạn muốn người dùng tự động copy dữ liệu vào trong clipboard mà không cần thực hiện thao tác copy hoặc Ctrl + C.
fbCommentUrl: none
---

Clipboard.js là một thư viện vô cùng gọn nhẹ (2kb) giúp bạn dễ dàng cắt hoặc sao chép nội dung trên trang web một cách dễ dàng. Được sử dụng trong các trường hợp bạn muốn người dùng tự động copy dữ liệu vào trong clipboard mà không cần thực hiện thao tác copy hoặc Ctrl + C.

![](https://3.bp.blogspot.com/-nogpFtDX4JE/VjNskDinauI/AAAAAAAAFfk/ciSSYDvmaKs/s1600/5ab0a950-5fb4-11e5-9602-e73c0b661883.jpg)

Ưu điểm của Clipboard.js là cực kì nhẹ (2kb) và không sử dụng flash.

## Cài đặt ##
Sử dụng npm

```bash
npm install clipboard --save
```

Sử dụng bower

```bash
bower install clipboard --save
```

Hoặc bạn có thể download trực tiếp thư viện bằng [file ZIP tại đây](https://github.com/zenorocha/clipboard.js/archive/master.zip) và sử dụng.

## Cách sử dụng ##
Thêm thư viện vào trang web bằng thẻ script

```html
<!-- 1. Define some markup -->
<button id="btn" data-clipboard-text="1">Copy</button>

<!-- 2. Include library -->
<script src="../dist/clipboard.min.js"></script>

<!-- 3. Instantiate clipboard by passing a HTML element -->
<script>
    var btn = document.getElementById('btn');
    var clipboard = new Clipboard(btn);
</script>
```

### Copy nội dung trong trang từ một element khác ###

![](https://4.bp.blogspot.com/-FCE1AssAJA8/VjNuQuomESI/AAAAAAAAFfs/4kIq61sAw98/s1600/7df57b9c-6050-11e5-9cd1-fbc51d2fd0a7.png)

```html
<!-- Target -->
<textarea id="bar">Mussum ipsum cacilds...</textarea>

<!-- Trigger -->
<button class="btn" data-clipboard-action="cut" data-clipboard-target="#bar">
    Cut to clipboard
</button>
```

### Copy nội dung từ thuộc tính ###

![](https://4.bp.blogspot.com/-MLe6ox0NNlw/VjNuj-y-ovI/AAAAAAAAFf0/kw3VM0U1taY/s1600/6e16cf8c-6050-11e5-9883-1c5681f9ec45.png)

```html
<!-- Trigger -->
<button class="btn" data-clipboard-text="Just because you can doesn't mean you should — clipboard.js">
    Copy to clipboard
</button>
```

Bạn có thể xem thêm các ví dụ và api từ trang chủ của project tại đây: [https://github.com/zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js)
