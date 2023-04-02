---
template: post
title: Grunt - lỗi ENOSPC
date: "2016-04-08"
author: Van-Duyet Le
tags:
- Nodejs
- Grunt
- Grunt task
- Fix
modified_time: '2016-05-02T19:37:37.873+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-9058579827600528969
blogger_orig_url: https://blog.duyet.net/2016/04/grunt-loi-enospc.html
slug: /2016/04/grunt-loi-enospc.html
category: News
description: Trường hợp lỗi trên Grunt khi listen file change để restart server.
fbCommentUrl: none
---

Trường hợp lỗi trên Grunt khi listen file change để restart server.

```
Waiting...Fatal error: watch ENOSPC   
```

Khắc phục, tăng max_user_watches trên Linux:

```
npm dedupe
```

Hoặc 

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
