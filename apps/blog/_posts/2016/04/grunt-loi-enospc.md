---
title: Grunt - lỗi ENOSPC
date: '2016-04-08'
author: Duyet
tags:
  - Node.js
  - Tutorial
  - Javascript
modified_time: '2016-05-02T19:37:37.873+07:00'
slug: /2016/04/grunt-loi-enospc.html
category: News
description: Trường hợp lỗi trên Grunt khi listen file change để restart server.
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
