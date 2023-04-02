---
template: post
title: 'Git - Phục hồi code cũ toàn tập '
date: "2015-01-25"
author: Unknown
tags:
- Reset
- Git
- Commit
modified_time: '2016-03-01T12:14:34.454+07:00'
thumbnail: https://2.bp.blogspot.com/-sVvs3hQG6DM/VMRzlSdIUFI/AAAAAAAATBA/wBYhBdej6nA/s1600/Git-Logo-2Color.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7367160734569236842
blogger_orig_url: https://blog.duyet.net/2015/01/git-phuc-hoi-code-cu-toan-tap.html
slug: /2015/01/git-phuc-hoi-code-cu-toan-tap.html
description: Git là công cụ mạnh để quản lý project, được sử dụng hầu hết phổ biến hiện nay. Một vài trường hợp bạn cần phải phục hồi code đểu, code ngủ gật, bla bla. Các bạn thường sẽ gặp một số trường hợp sau

---

Git là công cụ mạnh để quản lý project, được sử dụng hầu hết phổ biến hiện nay. Một vài trường hợp bạn cần phải phục hồi code đểu, code ngủ gật, bla bla. Các bạn thường sẽ gặp một số trường hợp sau

![](https://2.bp.blogspot.com/-sVvs3hQG6DM/VMRzlSdIUFI/AAAAAAAATBA/wBYhBdej6nA/s1600/Git-Logo-2Color.png)

## 1. Vừa chỉnh code xong, chưa add ##

```
$ git clean -df
$ git checkout -- .
```

## 2. Lỡ tay add nhưng chưa commit  ##

```
$ git reset HEAD 
$ git clean -df 
```

## 3. commit rồi, mà hên chưa push  ##

```
$ git reset HEAD~1 --hard
```

## 4. commit rồi, ngứa tay push luôn  ##
Push lên rồi, có nghĩa là có thể đã có người fetch về sử dụng rồi, mà người ta đã lấy rồi thì không có chuyện giựt lại. Trong trường hợp này bạn cần đính chính lại: "À, nãy tao nhầm, lấy cái này nè". 
Vì thế, ta push 1 commit khác, nội dung là ngược lại cái vừa push để đính chính. 

```
$ git revert HEAD~1..HEAD
```

# Kết  #
Bạn thấy đấy, Git là công cụ quản lý source code vô cùng mạnh mẽ, nó giúp bạn làm việc nhanh hơn và dễ dàng hơn. 
