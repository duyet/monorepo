---
template: post
title: Propel - Machine learning for Javascript
date: "2018-03-01"
author: Van-Duyet Le
tags:
- Data Engineer
- Nodejs
- intro-js
- Javascript
- Intro-library
- Intro
- Machine Learning
modified_time: '2018-07-20T10:14:07.558+07:00'
thumbnail: https://4.bp.blogspot.com/-rCCLsL2bgWA/WpgsDSlK8nI/AAAAAAAAqrM/4Ijx-Bt0yvYMe29D7W48z97lGge2IZDHgCLcBGAs/s1600/Propel.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-9058581583681731758
blogger_orig_url: https://blog.duyet.net/2018/03/propel-machine-learning-for-javascript.html
slug: /2018/03/propel-machine-learning-for-javascript.html
category: Machine Learning
description: Propel cung cấp cơ chế GPU-backed giống như thư viện Numpy trên Python, propel có thể cung cấp 1 kiến trúc rất mạnh cho các thuật toán Machine learning trên Javascript, như hỗ trợ tính toán rất mạnh và nhanh, như các tính toán trên ma trận, list, plot, ...
fbCommentUrl: none
---

[Propel](http://propelml.org/) cung cấp cơ chế GPU-backed giống như thư viện Numpy trên Python, propel có thể cung cấp 1 kiến trúc rất mạnh cho các thuật toán Machine learning trên Javascript, như hỗ trợ tính toán rất mạnh và nhanh, như các tính toán trên ma trận, list, plot, ...

Với ưu điểm trên Javascript, Propel có thể chạy ở mọi nơi (từ browser đến natively trên Node).
Cả 2 môi trường trên thư viện đều có thể sử dụng sức mạnh của GPU. Trên trình duyệt, thư viện sử dụng WebGL thông qua [deeplearn.js](https://deeplearnjs.org/), còn trên Node nó sử dụng TensorFlow's [C API](https://www.tensorflow.org/install/install_c).

[![](https://4.bp.blogspot.com/-rCCLsL2bgWA/WpgsDSlK8nI/AAAAAAAAqrM/4Ijx-Bt0yvYMe29D7W48z97lGge2IZDHgCLcBGAs/s1600/Propel.png)](https://4.bp.blogspot.com/-rCCLsL2bgWA/WpgsDSlK8nI/AAAAAAAAqrM/4Ijx-Bt0yvYMe29D7W48z97lGge2IZDHgCLcBGAs/s1600/Propel.png)

Trang chủ: [http://propelml.org](http://propelml.org/)

Cài đặt trên Node:

```
npm install propel
```

```js
import { grad } from "propel";
```

Sử dụng trên trình duyệt:

```html
<script src="https://unpkg.com/propel@3.1.0"></script>
```

- References: [http://propelml.org/references.html](http://propelml.org/references.html)
- Propel Notebook: [http://propelml.org/notebook](http://propelml.org/notebook)
