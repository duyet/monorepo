---
template: post
title: jQuery - Smooth page scrolling với TweenMax
date: "2014-04-15"
cateory: Javascript
tags: 
- Javascript
- jquery
modified_time: '2014-04-15T17:08:24.345+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5394235747184161246
blogger_orig_url: https://blog.duyet.net/2014/04/jquery-smooth-page-scrolling-voi.html
slug: /2014/04/jquery-smooth-page-scrolling-voi.html
description: Trong tutorial này, mình sẽ hướng dẫn các bạn có được hiệu ứng cuộn trang 1 cách mượt mà. Hiện chức năng này có sẵn trên firefox, hay chrome,.. nhưng không phải Client nào cũng được bật chức năng này. Trong bài viết mình sẽ sử dụng TweenMax và ScrollToPlugin

---

Trong tutorial này, mình sẽ hướng dẫn các bạn có được hiệu ứng cuộn trang 1 cách mượt mà. Hiện chức năng này có sẵn trên firefox, hay chrome,.. nhưng không phải Client nào cũng được bật chức năng này. Trong bài viết mình sẽ sử dụng [TweenMax](https://www.greensock.com/tweenmax/) và [ScrollToPlugin](https://api.greensock.com/js/com/greensock/plugins/ScrollToPlugin.html).

## Ý tưởng ##
Ý tưởng khá đơn giản, ta sử dụng [snippet](https://blog.bassta.bg/2013/05/get-mousewheel-event-delta/) này, bắt event lăn chuột và [TweenMax](https://www.greensock.com/tweenmax/) và [ScrollToPlugin](https://api.greensock.com/js/com/greensock/plugins/ScrollToPlugin.html) để tạo hiệu ứng.

## Code ##

Đầu tiên load các plugin jQuery, TweenMax và ScrollToPlugin, mình sử dụng các script từ các CDN sau: 

```html
<script src="https://code.jquery.com/jquery-1.9.1.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenMax.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/latest/plugins/ScrollToPlugin.min.js"></script>

```

Hoặc bạn cũng có thể download source code ở cuối bài viết và upload lên hosting của bạn cũng được.

Và code của chúng ta, bạn có thể chèn trực tiếp vào trong thẻ head, cuối footer hay lưu thành file .js và include bằng thẻ <script>

```

$(function(){ 

        var $window = $(window);
 var scrollTime = 1.2;
 var scrollDistance = 170;

 $window.on("mousewheel DOMMouseScroll", function(event){

  event.preventDefault(); 

  var delta = event.originalEvent.wheelDelta/120 || -event.originalEvent.detail/3;
  var scrollTop = $window.scrollTop();
  var finalScroll = scrollTop - parseInt(delta*scrollDistance);

  TweenMax.to($window, scrollTime, {
   scrollTo : { y: finalScroll, autoKill:true },
    ease: Power1.easeOut,
    overwrite: 5       
   });

 });
});

```

Nếu bạn muốn cuộn nhanh hơn, tăng biến scrollTime lên với số thích hợp, còn muốn chậm lại thì giảm nó xuống.

Code: [Download Files](https://bassta.bg/downloads/smooth-page-scroll.zip) | [View Demo](https://bassta.bg/demos/smooth-page-scroll/)

Chúc bạn thành công!
