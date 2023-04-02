---
template: post
title: Git - Chỉnh sửa git vừa commit
date: "2015-08-07"
author: Van-Duyet Le
tags:
- Git
- git commit
modified_time: '2015-08-07T22:14:16.153+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1552016978334911994
blogger_orig_url: https://blog.duyet.net/2015/08/git-chinh-sua-git-vua-commit.html
slug: /2015/08/git-chinh-sua-git-vua-commit.html
category: Git
description: Cách sửa commit 
fbCommentUrl: none

---

Cách để thêm file vào commit gần đây nhất, hoặc chỉnh sửa commit message, ta có thể dùng tham số `--amend`.

`git commit --amend` cho phép bạn cập nhật commit gần nhất.

## Sửa commit message

```bash
$ git add <files>$đ git commit -m 
$ git commit -m "implement feature A"

# Change commit messsageđ
$ git commit --amend
```

## Thêm file bị thiếu vào commit gần nhất, và sửa commit message

```
$ git add <files>
$ git commit -m "feat: implement feature A"

$ git add missing_file.rs
$ git commit --amend 
```

## Thêm file bị thiếu vào commit gần nhất, và KHÔNG sửa commit message

```
$ git add <files>
$ git commit -m "feat: implement feature A"

$ git add missing_file.rs
$ git commit --amend --no-edit 
```

