---
template: post
title: gpu.js - Tăng tốc Javascript với GPU
date: "2017-07-26"
author: Van-Duyet Le
tags:
- GPU
- intro-js
- Javascript
modified_time: '2017-07-26T22:18:53.281+07:00'
thumbnail: https://1.bp.blogspot.com/-X7Kr5VOlHrs/WXiyj88TKTI/AAAAAAAAmTo/zXoRm7bqaOM-DSDvG1EEBlHaN52T5Tp_gCK4BGAYYCw/s1600/687474703a2f2f6770752e726f636b732f696d672f6f67696d6167652e706e67.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2176122338353487366
blogger_orig_url: https://blog.duyet.net/2017/07/gpujs.html
slug: /2017/07/gpujs.html
category: Web
description: Mình lướt github và vô tình thấy thư viện gpu.js này. gpu.js tự động compile mã Javascript thành một ngôn ngữ ánh xạ khác, và chạy trên GPU nhờ vào WebGL API. Nếu máy trình duyệt không có GPU, mã JS vẫn được thực thi bình thường.
fbCommentUrl: none
---

Mình lướt github và vô tình thấy thư viện [gpu.js](http://gpu.rocks/) này. gpu.js tự động compile mã Javascript thành một ngôn ngữ ánh xạ khác, và chạy trên GPU nhờ vào WebGL API. Nếu máy trình duyệt không có GPU, mã JS vẫn được thực thi bình thường.

![](https://1.bp.blogspot.com/-X7Kr5VOlHrs/WXiyj88TKTI/AAAAAAAAmTo/zXoRm7bqaOM-DSDvG1EEBlHaN52T5Tp_gCK4BGAYYCw/s640/687474703a2f2f6770752e726f636b732f696d672f6f67696d6167652e706e67.png)
Ví dụ về phép nhân ma trận 512x512 trên gpu.js

```js
const gpu = new GPU();

// Create the GPU accelerated function from a kernel
// function that computes a single element in the
// 512 x 512 matrix (2D array). The kernel function
// is run in a parallel manner in the GPU resulting
// in very fast computations! (...sometimes)
const matMult = gpu.createKernel(function(a, b) {
    var sum = 0;
    for (var i = 0; i < 512; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
}).setDimensions([512, 512]);

// Perform matrix multiplication on 2 matrices of size 512 x 512
const c = matMult(a, b);
```

Khi chạy benchmark ở [trang chủ](http://gpu.rocks/), tùy vào cấu hình máy bạn, thường phép tính này nhanh hơn 1-15x lần.

[![](https://3.bp.blogspot.com/-LYVs-Hn-dbA/WXixNemXumI/AAAAAAAAmTY/4jNUMj9nKKYR-Czzls_MGFcGcpZq5n4bACLcBGAs/s1600/Screenshot%2Bfrom%2B2017-07-26%2B22-11-18.png)](https://3.bp.blogspot.com/-LYVs-Hn-dbA/WXixNemXumI/AAAAAAAAmTY/4jNUMj9nKKYR-Czzls_MGFcGcpZq5n4bACLcBGAs/s1600/Screenshot%2Bfrom%2B2017-07-26%2B22-11-18.png)

## Tham khảo 

- https://github.com/gpujs/gpu.js
- http://gpu.rocks
