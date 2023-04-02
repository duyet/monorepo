---
template: post
title: Autotrack turns 1.0
date: "2016-09-01"
author: Van-Duyet Le
tags:
- Track.js
- Announment
- intro-js
- Google Analytics
- AutoTrack
- Announce
modified_time: '2017-08-06T11:41:14.281+07:00'
thumbnail: https://4.bp.blogspot.com/-iLc0CpE-jZs/V8ftpMNqYkI/AAAAAAAAcro/TjcwWkEVSLY4Bz6p0FE6wBwE28oN-91zQCK4B/s1600/autotrack.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2914961772508345979
blogger_orig_url: https://blog.duyet.net/2016/09/autotrack-turns-10.html
slug: /2016/09/autotrack-turns-10.html
category: Javascript
description: Autotrack là thư viện Javascript sử dụng với analytics.js, cung cấp cho lập trình viên nhiều công cụ hơn để theo dõi hoạt động người dùng trên web.
---

Autotrack là thư viện Javascript sử dụng với [analytics.js](https://developers.google.com/analytics/devguides/collection/analyticsjs/?utm_campaign=analytics_discussion_autotrackturns1_080216&amp;utm_source=gdev&amp;utm_medium=blog), cung cấp cho lập trình viên nhiều công cụ hơn để theo dõi hoạt động người dùng trên web.

[![](https://4.bp.blogspot.com/-iLc0CpE-jZs/V8ftpMNqYkI/AAAAAAAAcro/TjcwWkEVSLY4Bz6p0FE6wBwE28oN-91zQCK4B/s1600/autotrack.png)](https://4.bp.blogspot.com/-iLc0CpE-jZs/V8ftpMNqYkI/AAAAAAAAcro/TjcwWkEVSLY4Bz6p0FE6wBwE28oN-91zQCK4B/s1600/autotrack.png) 
Autotrack là project mã nguồn mở của Google Analytics, host tại Github.

Github: [https://github.com/googleanalytics/autotrack](https://github.com/googleanalytics/autotrack)

Autotrack vừa mới ra mắt phiên bản ổn định 1.0, hiện cung cấp nhiều plugins đi kèm như: Impression Tracker, Clean URL Tracker, Page Visibility Tracker, ...

### Để sử dụng: ###
1. Chèn autotrack,js vào website

```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/autotrack/1.0.1/autotrack.js"></script>
```
2. Include vào ga

```html
<script>
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', 'UA-XXXXX-Y', 'auto');

// Replace the following lines with the plugins you want to use.
ga('require', 'eventTracker');
ga('require', 'outboundLinkTracker');
ga('require', 'urlChangeTracker');
// ...

ga('send', 'pageview');
</script>
```

Bạn cũng có thể tìm hiểu thêm về Autotrack demo và Tools tại đây: https://ga-dev-tools.appspot.com/autotrack/

![](https://1.bp.blogspot.com/-lpnd0DzoKGE/V8fvaVPq7eI/AAAAAAAAcr4/EkOYxE_3E6AdwcxqimoT4v6LcfLV9tr-wCK4B/s1600/Screen%2BShot%2B2016-09-01%2Bat%2B4.05.30%2BPM.png)
