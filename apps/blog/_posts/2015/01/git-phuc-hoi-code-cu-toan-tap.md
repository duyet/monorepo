---
title: 'Git - Phục hồi code cũ toàn tập'
date: '2015-01-25'
category: Git
tags:
  - Reset
  - Git
  - Commit
modified_time: '2016-03-01T12:14:34.454+07:00'
thumbnail: https://2.bp.blogspot.com/-sVvs3hQG6DM/VMRzlSdIUFI/AAAAAAAATBA/wBYhBdej6nA/s1600/Git-Logo-2Color.png
slug: /2015/01/git-phuc-hoi-code-cu-toan-tap.html
description: Git là công cụ mạnh để quản lý project, được sử dụng hầu hết phổ biến hiện nay. Một vài trường hợp bạn cần phải phục hồi code đểu, code ngủ gật, bla bla. Các bạn thường sẽ gặp một số trường hợp sau
---

Git là một công cụ mạnh mẽ để quản lý dự án, được sử dụng rộng rãi hiện nay. Đôi khi, bạn có thể cần phục hồi mã nguồn sau khi thực hiện nhầm, code không chính xác, và nhiều tình huống khác. Dưới đây là một số trường hợp bạn có thể gặp phải:

![](https://2.bp.blogspot.com/-sVvs3hQG6DM/VMRzlSdIUFI/AAAAAAAATBA/wBYhBdej6nA/s1600/Git-Logo-2Color.png)

## 1. Khi chỉnh sửa mã nguồn nhưng chưa thêm vào stage

```bash
$ git clean -df
$ git checkout -- .
```

## 2. Khi đã thêm vào stage nhưng chưa commit

```bash
$ git reset HEAD
$ git clean -df
```

## 3. Khi đã commit nhưng chưa push

```bash
$ git reset HEAD~1 --hard
```

## 4. Khi đã commit và đã push

Trong trường hợp này, nếu đã push và có người khác đã fetch và sử dụng mã nguồn của bạn, không thể đơn giản thu hồi mã nguồn. Tuy nhiên, bạn có thể sử dụng lệnh revert để tạo một commit mới đảo ngược những thay đổi đã push.

```bash
$ git revert HEAD~1..HEAD
```
