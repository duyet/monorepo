---
title: Git - Chỉnh sửa git vừa commit
date: '2015-08-07'
author: Duyet
tags:
  - Git
  - git commit
modified_time: '2015-08-07T22:14:16.153+07:00'
slug: /2015/08/git-chinh-sua-git-vua-commit.html
category: Git
description: Cách sửa commit
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
