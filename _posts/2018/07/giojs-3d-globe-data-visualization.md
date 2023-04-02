---
template: post
title: Gio.js - 3D Globe Data Visualization
date: "2018-07-01"
author: Van-Duyet Le
tags:
- Javascript
- Visualization
- 3D
- Three.js
modified_time: '2018-07-01T23:20:16.007+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7359085333120004671
blogger_orig_url: https://blog.duyet.net/2018/07/giojs-3d-globe-data-visualization.html
slug: /2018/07/giojs-3d-globe-data-visualization.html
thumbnail: https://1.bp.blogspot.com/-fyu1xILKsuE/XUf7uXmrSAI/AAAAAAABFMw/FPCRz3qQR8k7_8iIPSoRkm-zBslPkdFDwCLcBGAs/s1600/Screen%2BShot%2B2019-08-05%2Bat%2B4.49.34%2BPM.png
category: Web
description: Gio.js là thư viện nguồn mở để visualization 3D globe, xây dựng dựa trên thư viện **Three.js**. Gio.js cực kỳ dễ sử dụng và dễ customize.
fbCommentUrl: none
---

**[Gio.js](https://github.com/syt123450/giojs)** là thư viện nguồn mở để visualization 3D globe, xây dựng dựa trên thư viện **Three.js**.  
Gio.js cực kỳ dễ sử dụng và dễ customize.  

![](https://1.bp.blogspot.com/-fyu1xILKsuE/XUf7uXmrSAI/AAAAAAABFMw/FPCRz3qQR8k7_8iIPSoRkm-zBslPkdFDwCLcBGAs/s1600/Screen%2BShot%2B2019-08-05%2Bat%2B4.49.34%2BPM.png)


## Cài đặt

Include Three.js dependency và Gio.js library:  
  
```html
<script src="https://threejs.org/build/three.min.js"></script>
<script src="https://raw.githack.com/syt123450/giojs/master/build/gio.min.js"></script>
```

  
Tạo thẻ `<div>` để render:  
  

```html
<!DOCTYPE HTML>
<html>
<head>

  <!-- include three.min.js library-->
  <script src="three.min.js"></script>

  <!-- include gio.min.js library-->
  <script src="gio.min.js"></script>

</head>
<body>

  <!-- container to draw 3D Gio globe-->
  <div id="globalArea"></div>

</body>
</html>
```
  
Khởi tạo và render dữ liệu:  
  

```html
<script>

    // get the container to hold the IO globe
    var container = document.getElementById( "globalArea" );

    // create controller for the IO globe, input the container as the parameter
    var controller = new GIO.Controller( container );

    // use addData() API to add the the data to the controller, know more about data format check out documentation about data: http://giojs.org/html/docs/dataIntro.html
    controller.addData( data );

    // call the init() API to show the IO globe in the browser
    controller.init();

</script>
```

  
Xem ví dụ tại [Codepen](https://codepen.io/syt123450/pen/VXNdgM).  

## References

*   Gio.js API document: [http://giojs.org/html/docs/index.html](http://giojs.org/html/docs/index.html)
*   [https://github.com/syt123450/giojs](https://github.com/syt123450/giojs)