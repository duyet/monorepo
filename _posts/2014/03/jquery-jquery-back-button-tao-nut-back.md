---
title: '[jQuery] Jquery Back Button - Tạo nút back bằng jQuery'
date: '2014-03-02'
category: Javascript
tags:
  - Javascript
  - Tutorials
  - jQuery
modified_time: '2023-06-07'
slug: /2014/03/jquery-jquery-back-button-tao-nut-back.html
description: Jquery Back Button làm việc giống như nút Back trên trình duyệt, nó sẽ chuyển bạn đến trang trước đó.
---

JQuery Back Button là một phương thức hoạt động tương tự như nút Back trên trình duyệt, cho phép người dùng trở về trang trước đó một cách thuận tiện.

Dưới đây là cách sử dụng JQuery Back Button để thực hiện chức năng này:


```html
<button type="button" id="mybutton"></button>

<script>
  $(document).ready({
       $('#mybutton').click(function(){
           parent.history.back();
           return false;
       });
  })
</script>
```

Với mã này, bạn có thể áp dụng chức năng của JQuery Back Button cho bất kỳ phần tử HTML nào, chẳng hạn như `<p>`, `<a>`, `<div>`, ...

Chúc bạn thành công.
