---
template: post
title: Webfont.js - Web Font Loader
date: "2016-06-04"
author: Van-Duyet Le
tags:
- Tutorial
- intro-js
- Tutorials
- Javascript
- Web Font
- webfont.js
modified_time: '2017-08-06T11:41:14.305+07:00'
thumbnail: https://4.bp.blogspot.com/-H539bJlNjPU/V1L9FlbhUUI/AAAAAAAAW_E/W_wtHvUOpbgR0ke51a_6F0tkAHvq54drgCK4B/s1600/web-font-performance.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4641198387186010113
blogger_orig_url: https://blog.duyet.net/2016/06/web-font-loader.html
slug: /2016/06/web-font-loader.html
category: Javascript

description: Web Font Loader (webfont.js) 
fbCommentUrl: none
---

Web Font Loader (`webfont.js`) cho phép bạn sử dụng các Fonts tùy chỉnh trên Web. Giúp điều khiển fonts 1 cách linh động hơn bằng Javascript, thay vì thẻ `<link>` hoặc CSS, linh động tùy chỉnh các tham số, tối ưu tốc độ tải và dễ sử dụng hơn.

Web Font Loader hỗ trợ load fonts từ [Google Fonts](http://www.google.com/fonts/), [Typekit](http://www.typekit.com/), [Fonts.com](http://fonts.com/), and [Fontdeck](http://fontdeck.com/), cũng như self-hosted web fonts.

[![](https://4.bp.blogspot.com/-H539bJlNjPU/V1L9FlbhUUI/AAAAAAAAW_E/W_wtHvUOpbgR0ke51a_6F0tkAHvq54drgCK4B/s400/web-font-performance.png)](https://blog.duyet.net/2016/06/web-font-loader.html)

`Webfont.js` được Google và Typekit cùng nhau phát triển.

## Cài đặt ##
Để sử dụng, chỉ cần load webfont.js và liệt kê các Fonts cần sử dụng. Bạn có thể sử dụng Google Fonts bằng cách sau:

```html
<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js"></script>
<script>
  WebFont.load({
    google: {
      families: ['Droid Sans', 'Droid Serif']
    }
  });
</script>
```

[Web Font Loader](https://github.com/typekit/webfontloader) cũng hỗ trợ tải bất đồng bộ (asynchronously), giúp trang tải nhanh hơn mà không cần quan tâm Font có load hay chưa.

```html
<script>
   WebFontConfig = {
      typekit: { id: 'xxxxxx' },
      google: {
          families: ['Droid Sans', 'Droid Serif:bold', 'Open Sans Condensed:300,700']
      }
   };

   (function(d) {
      var wf = d.createElement('script'), s = d.scripts[0];
      wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';
      s.parentNode.insertBefore(wf, s);
   })(document);
</script>
```

Tốc độ có thể được tăng lên, nhưng cách này có thể gây nên tình trạng [Flash of Unstyled Text (FOUT)](http://help.typekit.com/customer/portal/articles/6852). Tức là giao diện bị vỡ do Fonts chưa tải kịp. Trường hợp FOUT có thể được fix bằng nhiều cách, WebFont.js hỗ trợ 1 số API sự kiện cho biết trạng thái tải font, để hiển thị trạng thái đang Loading nếu bạn muốn. Xem thêm ở đây: https://helpx.adobe.com/typekit/using/font-events.html

## Tham khảo ##

- Web Font Loader | [Github](https://github.com/typekit/webfontloader)
- Web Font Loader | [Google Developers](https://developers.google.com/fonts/docs/webfont_loader)
- Font events | [Typekit Help](https://helpx.adobe.com/typekit/using/font-events.html) 
- Ảnh: keycdn.com
