---
title: 'Git - Phục hồi code cũ'
date: '2015-01-25'
author: Duyet
category: Git
tags:
  - Tutorial
  - Git
thumbnail: https://raw.githubusercontent.com/git/git-scm.com/main/public/images/logos/downloads/Git-Logo-2Color.png
slug: /2015/01/git-recovering-old-code.html
description: Git là một công cụ mạnh mẽ để quản lý dự án, được sử dụng phổ biến hiện nay. Dưới đây là một số trường hợp mà bạn có thể cần phục hồi mã nguồn do lỗi, hoặc các tình huống khác mà bạn thường gặp
---

Git là một công cụ mạnh mẽ để quản lý dự án, hiện đang được sử dụng rộng rãi. Đôi khi, bạn có thể cần khôi phục mã nguồn sau khi thực hiện sai lầm, code không chính xác, hoặc gặp phải nhiều tình huống khác. Dưới đây là một số trường hợp cụ thể mà bạn có thể gặp phải và cách xử lý:

![Git Logo](https://raw.githubusercontent.com/git/git-scm.com/main/public/images/logos/downloads/Git-Logo-2Color.png)

## 1. Khi chỉnh sửa mã nguồn nhưng chưa thêm vào stage

Nếu bạn đã chỉnh sửa mã nguồn nhưng chưa thêm vào stage, bạn có thể sử dụng các lệnh sau để khôi phục lại trạng thái ban đầu:

```bash
$ git clean -df
$ git checkout -- .
```

**⚠️ Lưu ý:** `git clean -df` sẽ xóa tất cả các file chưa được theo dõi (untracked files) và thư mục. Hãy kiểm tra kỹ trước khi thực hiện bằng lệnh `git clean -dn` (dry-run) để xem những file nào sẽ bị xóa.

## 2. Khi đã thêm vào stage nhưng chưa commit

Nếu bạn đã thêm các thay đổi vào stage nhưng chưa commit, bạn có thể sử dụng lệnh sau để đưa các thay đổi ra khỏi stage và dọn dẹp thư mục làm việc:

```bash
$ git reset HEAD
$ git clean -df
```

## 3. Khi đã commit nhưng chưa push

Nếu bạn đã commit nhưng chưa push, bạn có thể sử dụng lệnh sau để hoàn tác commit:

```bash
$ git reset HEAD~1 --hard
```

**⚠️ Cảnh báo:** Lệnh `git reset --hard` sẽ xóa vĩnh viễn các thay đổi. Hãy chắc chắn bạn không cần những thay đổi này nữa trước khi thực hiện. Nếu chỉ muốn giữ lại các thay đổi, sử dụng `git reset HEAD~1 --soft` hoặc `git reset HEAD~1` (mixed mode).

## 4. Khi đã commit và đã push

Trong trường hợp bạn đã commit và push, nếu mã nguồn đã được người khác fetch và sử dụng, việc thu hồi thay đổi không đơn giản. Tuy nhiên, bạn có thể tạo một commit mới đảo ngược những thay đổi đã push bằng lệnh:

```bash
$ git revert HEAD~1..HEAD
```

Sử dụng các lệnh trên giúp bạn xử lý hiệu quả các tình huống khôi phục mã nguồn trong Git, đảm bảo quy trình làm việc mượt mà và tránh những sai lầm không đáng có.

---

**📝 Cập nhật 2025:** Từ Git phiên bản 2.23 trở đi, Git đã giới thiệu các lệnh mới dễ hiểu hơn:
- `git restore <file>` - Thay thế cho `git checkout -- <file>` (khôi phục file)
- `git restore --staged <file>` - Thay thế cho `git reset HEAD <file>` (bỏ file ra khỏi staging area)
- `git switch <branch>` - Thay thế cho `git checkout <branch>` (chuyển branch)

Các lệnh cũ vẫn hoạt động, nhưng các lệnh mới được khuyến nghị sử dụng vì rõ ràng và dễ hiểu hơn.
