---
title: Notibar.js
date: '2017-03-04'
author: Duyet
tags:
  - Javascript
  - Side Project
modified_time: '2018-09-10T17:22:11.270+07:00'
thumbnail: https://2.bp.blogspot.com/-aWA0Q8jTEM8/WLpunYKc57I/AAAAAAAAjz8/AoGD9qpGYaE1OHeqi5QrBJcgm0HCJgnOACLcB/s1600/Screenshot%2Bfrom%2B2017-03-04%2B14-35-54.png
slug: /2017/03/notibarjs.html
category: Project
description: Notibar.js - Lightweight notification bar, no dependency.
---

Notibar.js - Lightweight notification bar, no dependency.

[![](https://2.bp.blogspot.com/-aWA0Q8jTEM8/WLpunYKc57I/AAAAAAAAjz8/AoGD9qpGYaE1OHeqi5QrBJcgm0HCJgnOACLcB/s1600/Screenshot%2Bfrom%2B2017-03-04%2B14-35-54.png)](https://github.com/duyet/notibar.js)

```html
<script
  type="text/javascript"
  src="https://duyetdev.github.io/notibar.js/notibar.js"
></script>
<script type="text/javascript">
  notiBar(
    '<strong>notibar.js</strong> by <a href="https://duyet.net">duyetdev</a>  :))',
  )
</script>
```

See example: https://duyetdev.github.io/notibar.js/example.html

## More custom

```js
notiBar({
  message:
    '<strong>notibar.js</strong> by <a href="https://duyet.net">duyetdev</a>  :))',
  closeButton: true,
  font: 'sans-serif',
  fontSize: '13px',
  minHeight: '41px',
  color: '#2895F1',
  bgColor: '#f0f9ff',
  borderBottomColor: '#96c4ea',
})
```

Github: [https://github.com/duyet/notibar.js](https://github.com/duyet/notibar.js)
