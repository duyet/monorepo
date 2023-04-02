---
template: post
title: Git - Cách xem nội dung 1 file ở branch khác
date: "2015-08-25"
author: Van-Duyet Le
tags:
- view file
- Git
- Khái niệm git
modified_time: '2015-08-25T22:46:46.932+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1693445441755466472
blogger_orig_url: https://blog.duyet.net/2015/08/git-cach-xem-noi-dung-1-file-o-branch-khac.html
slug: /2015/08/git-cach-xem-noi-dung-1-file-o-branch-khac.html
category: Git
description: 'Nếu bạn đang ở 1 nhánh, và bạn muốn xem nội dung của 1 file nằm ở trên nhánh khác mà không cần phải checkout.'
fbCommentUrl: none
---

Nếu bạn đang ở 1 nhánh, và bạn muốn xem nội dung của 1 file nằm ở trên nhánh khác mà không cần phải checkout. Bạn có thể thực hiện xem nhanh bằng lệnh:

```
$ git show branch:file
```

Ví dụ bạn đang ở branch new-thing, và cần xem thử file app/controllers/AuthController.js nằm ở other-branch, bạn gõ như sau:

```
$ git show other-branch:app/controllers/AuthController.js
```

Vậy là bạn đã có thể xem nhanh nội dung file AuthController.js mà không cần phải checkout other-branch.
