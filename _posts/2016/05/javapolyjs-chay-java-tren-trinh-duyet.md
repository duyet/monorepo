---
template: post
title: 'JavaPoly.js: chạy Java ngay trên trình duyệt Web'
date: "2016-05-21"
author: Van-Duyet Le
tags:
- Nodejs
- Java
- intro-js
- Tutorials
- Javascript
- JavaPoly
modified_time: '2017-08-06T11:41:14.356+07:00'
thumbnail: https://3.bp.blogspot.com/-0PVYXnZKPos/Vz9CsMIpfnI/AAAAAAAAVi0/MHADr9GRYt4DooMtDYj-DesgH9Ba3KcMACK4B/s1600/f1s7ah2zp9vghd2hth1a.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7871567164187374152
blogger_orig_url: https://blog.duyet.net/2016/05/javapolyjs-chay-java-tren-trinh-duyet.html
slug: /2016/05/javapolyjs-chay-java-tren-trinh-duyet.html
category: Javascript
description: Polyfills native, hỗ trợ JVM, bạn có thể import file Jar, biên dịch và chạy trực tiếp mã Java ngay trên trình duyệt Web với JavaPoly, thư viện được viết bằng Javascript.    
fbCommentUrl: none
---

Polyfills native, hỗ trợ JVM, bạn có thể import file Jar, biên dịch và chạy trực tiếp mã Java ngay trên trình duyệt Web với JavaPoly, thư viện được viết bằng Javascript.    

[![](https://3.bp.blogspot.com/-0PVYXnZKPos/Vz9CsMIpfnI/AAAAAAAAVi0/MHADr9GRYt4DooMtDYj-DesgH9Ba3KcMACK4B/s1600/f1s7ah2zp9vghd2hth1a.jpg)](https://blog.duyet.net/2016/05/javapolyjs-chay-java-tren-trinh-duyet.html)

```html
<!-- Include the Polyfill -->
<script src="https://www.javapoly.com/javapoly.js"></script>

<!-- Include your favorite Java libraries (jar files) -->
<script type="text/java" src="http://www.yourdomain.com/jimboxutilities.jar"></script>

<!-- Write your Java code -->
<script type="text/java">
  package com.demo;
  import com.javapoly.dom.Window;

  public class Greeter
  {
    public static void sayHello(String name)
    {
      Window.alert("Hello " + name + ", from Java!");
    }
  }
</script>

<!-- Invoke your Java code from Javascript -->
<script type="text/javascript">
  com.demo.Greeter.sayHello("world");
</script>
```

Thấy hay vậy thôi, chứ hiệu năng và ứng dụng thì mình chưa nghĩ tới.
