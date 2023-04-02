---
template: post
title: Checklist tối ưu hiệu năng React
date: "2019-03-03"
author: Van-Duyet Le
category: Web
tags:
- React
- Web
modified_time: '2019-03-03T21:35:03.766+07:00'
blogger_orig_url: https://blog.duyet.net/2019/03/react-performance-checklist.html
slug: /2019/03/react-performance-checklist.html
description: Muốn tối ưu hiệu năng React, sau đây là checklist để tăng tốc website sử dụng React
thumbnail: https://3.bp.blogspot.com/-bFgY2B1OocY/XHtXsk5vO7I/AAAAAAAA6jw/58sdPt44VxEgItEdWIo6nhCaVnHsEbcmQCK4BGAYYCw/s1600/zoomed.png
fbCommentUrl: none
---

Muốn tối ưu hiệu năng React, sau đây là checklist để tăng tốc website sử dụng React

![](https://3.bp.blogspot.com/-bFgY2B1OocY/XHtXsk5vO7I/AAAAAAAA6jw/58sdPt44VxEgItEdWIo6nhCaVnHsEbcmQCK4BGAYYCw/s640/zoomed.png)

![](https://3.bp.blogspot.com/-88w00Q65w1k/XHtYDuYn0CI/AAAAAAAA6j8/DmpotG_Kdhw7vQFdUmG61iic8hsErpG9wCK4BGAYYCw/s800/zoom-in-and-out-39ba82394205242af7c37ccb3a631f4d.gif)


1. **Công cụ do hiệu năng render của từng Component React:**
    - Chrome DevTools Performance panel
    - React DevTools profiler
    ![](https://2.bp.blogspot.com/-0U97Y5kWbSo/XHtYIHrQFFI/AAAAAAAA6kE/f4wpIccSVxYs2d0VXhN4fthLdJsePpOIgCK4BGAYYCw/s640/flame-chart-3046f500b9bfc052bde8b7b3b3cfc243-53c76.png)

2. **Giảm thiểu tối đa việc các component re-renders:**
    - Override shouldComponentUpdate để kiểm soát việc re-render
    - Sử dụng `PureComponent` class components
    - Sử dụng `React.memo` functional components
    - Memoize Redux selectors (`reselect` là một ví dụ)
    - Virtualize super long lists (`react-window` là một ví dụ)

3. **Công cụ đo hiệu năng app-level với Lighthouse**
4. **Tối ưu hiệu năng ở mức ứng dụng**

    - Nếu bạn không sử dụng server-side rendering, cắt nhỏ components với `React.lazy`
    - Nếu bạn sử dụng server-side rendering, cắt nhỏ components với thư viện, giống như `loadable-components`
    - Sử dụng service worker để cache files. `Workbox` sẽ giúp bạn rất nhiều trong việc cache resouce.
    - Nếu bạn sử dụng server-side rendering, sử dụng streams thay vì strings (sử dụng `renderToNodeStream` và `renderToStaticNodeStream`)
    - Không thể Server-side rendering? Sử dụng `pre-render` như một biện pháp thay thế. Hãy sử dụng `react-snap`.
    - Hãy chắc chắn trang React của bạn luôn accessible. Hãy sử dụng `React A11y` và `react-axe`.
    ![](https://3.bp.blogspot.com/--uiWbFavkUY/XHtXQ6MCMlI/AAAAAAAA6jk/85GdmBjk6TMbh6hTTD4uHcPADt_x0WxnQCK4BGAYYCw/s400/react-a11y.png)
    - Sử dụng web app manifest nếu bạn muốn user truy cập trang của bạn trên device homescreen.
    ![](https://1.bp.blogspot.com/-sRZFyclVMdk/XHtUZAojwwI/AAAAAAAA6jU/kO1B1tkD-Z86ONRfBVC318y4om4SG9_PgCLcBGAs/s400/webmanifest.png)