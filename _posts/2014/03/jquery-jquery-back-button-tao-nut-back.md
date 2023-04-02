---
template: post
title: "[jQuery] Jquery Back Button - Tạo nút back bằng jQuery"
date: "2014-03-02"
author: Unknown
category: Javascript
tags:
- Javascript
- Tutorials
- jQuery
modified_time: '2014-03-02T16:23:11.225+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6403606179442339490
blogger_orig_url: https://blog.duyet.net/2014/03/jquery-jquery-back-button-tao-nut-back.html
slug: /2014/03/jquery-jquery-back-button-tao-nut-back.html
description: Jquery Back Button làm việc giống như nút Back trên trình duyệt, nó sẽ chuyển bạn đến trang trước đó.

---

Jquery Back Button làm việc giống như nút Back trên trình duyệt, nó sẽ chuyển bạn đến trang trước đó.

Bây giờ chúng ta sẽ thử viết nó trên jQuery để xem nó hoạt động như thế nào.

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

Bạn có thể sử dụng nó cho mọi đối tượng như `<p>`, `<a>`, `<div>`, ...

Chúc bạn thành công.
