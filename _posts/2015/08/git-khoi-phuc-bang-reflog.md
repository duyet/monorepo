---
template: post
title: Git - Khôi phục bằng reflog sau khi xóa commit hoặc branch
date: "2015-08-07"
author: Van-Duyet Le
tags:
- reflog
- Git
- khôi phục
modified_time: '2015-08-07T13:04:07.964+07:00'
thumbnail: https://1.bp.blogspot.com/-3KF--ZtRoJ8/VcRHZTobPXI/AAAAAAAACsA/ytQrNZKU_1Q/s1600/reflog-duyetdev.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4815343375083184130
blogger_orig_url: https://blog.duyet.net/2015/08/git-khoi-phuc-bang-reflog.html
slug: /2015/08/git-khoi-phuc-bang-reflog.html
category: Git
description: 'Nhiều khi bạn lỡ tay reset hard, xóa commit, xóa branch, ... Có rất ít người biết cách để khôi phục, nhiều bạn còn "trâu bò" hơn khi quyết định.... ngồi code lại. Hầu hết chúng ta có thể cứu nhờ vào cỗ máy thời gian của Git: reflog'
fbCommentUrl: none

---

Nhiều khi bạn lỡ tay reset hard, xóa commit, xóa branch, ... Có rất ít người biết cách để khôi phục, nhiều bạn còn "trâu bò" hơn khi quyết định.... ngồi code lại. Hầu hết chúng ta có thể cứu nhờ vào cỗ máy thời gian của Git: reflog

## Xem reflog để khôi phục lại 1 commit bất kì ##

Reflog như cỗ máy thời gian, nó ghi lại toàn bộ những gì bạn đã làm, kể cả khi bạn xóa 1 commit nào đó. 

```
0979a9e HEAD@{1}: reset: moving to HEAD~
4d77eb9 HEAD@{2}: commit: Add UI for data showcase.
0979a9e HEAD@{3}: commit: Finish UAF module, need update xls file normaly
4d3afe9 HEAD@{8}: commit: Finish UFM Module
c1fe83d HEAD@{9}: commit: Add faculty to model
b5d314a HEAD@{10}: commit: Add faculty_code
c528ae5 HEAD@{11}: pull: Fast-forward
...
```


`0979a9e` hoặc `HEAD@{3}` là id của commit `Finish UAF module, need update xls file normaly`
Để khôi phục lại commit đó

```
git reset --hard 0979a9e
HEAD is now at 0979a9e Finish UAF module, need update xls file normaly

```

## Lỡ tay reset --hard ##
Tương tự như trên, ta xem lại reflog

```
$ git reset --hard HEAD~

```
Kết quả sẽ là

```
0979a9e HEAD@{1}: reset: moving to HEAD~
4d77eb9 HEAD@{2}: commit: Add UI for data showcase.
0979a9e HEAD@{3}: commit: Finish UAF module, need update xls file normaly
237e662 HEAD@{4}: commit: Add noti token update in UFM module
2e99cad HEAD@{5}: commit: Add run shell script, fix out of memory
712d37c HEAD@{6}: commit: Fix priority, SGU doesn't have priority value
295779f HEAD@{7}: pull: Fast-forward
....

```

![](https://1.bp.blogspot.com/-3KF--ZtRoJ8/VcRHZTobPXI/AAAAAAAACsA/ytQrNZKU_1Q/s1600/reflog-duyetdev.png)


`0979a9e` là commit reset HEAD, `4d77eb9` là commit bị mất bạn cần sẽ nhảy đến.  Để khôi phục

```
git reset --hard 0979a9e
HEAD is now at 0979a9e Finish UAF module, need update xls file normaly

```

## Lỡ xóa branch ##
Trong trường hợp bạn lỡ xóa branch bằng `branch -D`  thì cũng có thể dễ dàng khôi phục như trường hợp mất commit.

```
$ git br -D duyetdev
Deleted branch duyetdev (was 700674f).

```

Ta xem lại lịch sử bằng **reflog**

```
$ git reflog

9b48127 HEAD@{0}: checkout: moving from duyetdev to master
788674f HEAD@{1}: reset: moving to 788674f
```

Trạng thái muốn quay lại là `788674f`, vì thế

```
$ git branch develop 788674f
$ git checkout develop
```

Và chúng ta sẽ quay lại branch vừa bị xóa lúc nãy.

## Kết ##
Reflog là một công cụ mạnh mẽ trong git, nó như cỗ máy thời gian giúp ta khôi phục bất cứ chỗ nào, đây không phải là công cụ duy nhất nhưng có thể ó sẽ là cứu cánh cuối cùng mỗi khi "lỡ dại" đấy nhé. Chúc bạn thành công :D 
