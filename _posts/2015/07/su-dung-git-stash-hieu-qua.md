---
template: post
title: Git - Sử dụng git stash hiệu quả
date: "2015-07-14"
author: Van-Duyet Le
tags:
- Git
- Github
- Thủ thuật
modified_time: '2016-03-01T12:14:08.804+07:00'
thumbnail: https://1.bp.blogspot.com/-3yYbNqRb-g4/VaUEdtFF9QI/AAAAAAAACm0/yuduSPkQak8/s1600/git.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4410144024472170290
blogger_orig_url: https://blog.duyet.net/2015/07/su-dung-git-stash-hieu-qua.html
slug: /2015/07/su-dung-git-stash-hieu-qua.html
category: Git
description: Git là công cụ cực kì hiệu quả để quản lý source code và cũng cực kì phổ biến khi gần như mọi công ty hay team develope sử dụng. Bài viết sau của bạn Lê Việt Tú đăng trên Kipalog hướng dẫn cách sử dụng Git stash một cách hiệu quả.
fbCommentUrl: none

---

Git là công cụ cực kì hiệu quả để quản lý source code và cũng cực kì phổ biến khi gần như mọi công ty hay team develope sử dụng. Bài viết sau của bạn Lê Việt Tú đăng trên [Kipalog](http://kipalog.com/posts/Su-dung-git-stash-hieu-qua) hướng dẫn cách sử dụng Git stash một cách hiệu quả.

![](https://1.bp.blogspot.com/-3yYbNqRb-g4/VaUEdtFF9QI/AAAAAAAACm0/yuduSPkQak8/s640/git.png)

## Lưu lại thay đổi ##

`Git stash` được sử dụng khi muốn lưu lại các thay đổi **chưa commit**, thường rất hữu dụng khi bạn muốn đổi sang 1 branch khác mà lại đang làm dở ở branch hiện tại.

Muốn lưu toàn bộ nội dung công việc đang làm dở, bạn có thể sử dụng `git stash` như sau

```
# or just "git stash"
```

Khi này branch đã trở nên "sạch sẽ" và `git status` sẽ cho thấy bạn có thể chuyển sang branch tuỳ thích. Bạn có thể `git stash` **bao nhiêu lần tuỳ thích** và mỗi lần đó git sẽ lưu toàn bộ lần thay đổi đó như 1 phần tử trong 1 stack.

## Lấy lại thay đổi ##

Sau khi đã git stash 1 hoặc vài lần, bạn có thể xem lại danh sách các lần lưu thay đổi bằng câu lệnh

```
$ git stash list
stash@{0}: WIP on <branch-name>: <lastest commit>
stash@{1}: WIP on <branch-name>: <lastest commit>
stash@{2}: WIP on <branch-name>: <lastest commit>

```

Nếu muốn xem cả nội dung của từng thay đổi thì thêm option `-p`

```
$ git stash list -p

```

hoặc xem nội dung cụ thể hơn nữa của lần thay đổi thứ 1:

```
$ git stash show stash@{1}

```

Khi muốn apply lại thay đổi từ stash lần 1 bạn có thể

```
$ git stash apply stash@{1}

```

## Xoá các thay đổi không cần thiết ##

Đôi khi bạn muốn lấy lại thay đổi và xoá nội dung thay đổi lưu trong stack đi, khi đó bạn có thể

```
$ git stash apply stash@{1}
$ git stash drop stash@{1}

```

hoặc đơn giản hơn là

```
$ git stash pop stash@{1}

```

Thậm chí nếu muốn xoá *toàn bộ stack* thì có thể dùng `clear`

```
$ git stash clear
```
