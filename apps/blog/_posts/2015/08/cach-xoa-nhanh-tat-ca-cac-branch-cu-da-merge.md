---
title: Git - Cách xóa nhanh tất cả các branch cũ đã merge vào branch master
date: '2015-08-25'
author: Duyet
tags:
  - Git
  - Tutorial
  - Github
modified_time: '2015-08-25T22:58:57.734+07:00'
slug: /2015/08/cach-xoa-nhanh-tat-ca-cac-branch-cu-da-merge.html
category: Git
description: Nếu bạn có rất nhiều branch trên repo, mỗi branch phát triển 1 chức năng của dự án. Trong số chúng có nhiều branch đã hoàn thành, và đã được merge vào branch chính (master) chẳng hạn, mình gọi các branch này là branch cũ.
---

Nếu bạn có rất nhiều branch trên repo, mỗi branch phát triển 1 chức năng của dự án. Trong số chúng có nhiều branch đã hoàn thành, và đã được merge vào branch chính (master) chẳng hạn, mình gọi các branch này là branch cũ.

Vậy branch cũ không còn phải code nữa, chúng ta chỉ cần tìm đến và xóa đi cho repo sạch đẹp là được. Nhưng mình thì hơi lười, hoặc là có khoảng vài trăm branch cũ như thế, ngồi xóa thì mòn răng.

Mình giới thiệu 1 thủ thuật để xóa các branch cũ đã merge vào branch hiện tại, như sau:

```
$ git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

Các branch đang dev vẫn còn được giữ lại.
