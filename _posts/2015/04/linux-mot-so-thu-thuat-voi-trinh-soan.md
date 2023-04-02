---
template: post
title: 'Linux - một số thủ thuật với trình soạn thảo vim '
date: "2015-04-25"
author: Van-Duyet Le
tags:
- Linux
- Ubuntu
- VIM
modified_time: '2015-04-25T13:09:47.309+07:00'
thumbnail: https://1.bp.blogspot.com/-Jls16PZ6Obc/VTsuvm57idI/AAAAAAAACU8/AmSffEltsSw/s1600/vim.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8548628604283448899
blogger_orig_url: https://blog.duyet.net/2015/04/linux-mot-so-thu-thuat-voi-trinh-soan.html
slug: /2015/04/linux-mot-so-thu-thuat-voi-trinh-soan.html
category: Linux
description: Vim (hoặc vi) là một trong những editor trên ternimal mạnh mẽ trên Linux. Sau đây là 1 vài thủ thuật hay khi sử dụng vim trên linux.
fbCommentUrl: none

---

Vim (hoặc vi) là một trong những editor trên ternimal mạnh mẽ trên Linux. Sau đây là 1 vài thủ thuật hay khi sử dụng vim trên linux.

![](https://1.bp.blogspot.com/-Jls16PZ6Obc/VTsuvm57idI/AAAAAAAACU8/AmSffEltsSw/s1600/vim.png)

Các lệnh được sử dụng ở chế độ command mode, nếu ở chế độ edit thì bạn có thể chuyển sang chế độ này bằng cách nhấn phím: [esc]

## Căn lề các cột dữ liệu ##
Lệnh

```
:%!column -t
```

## Chọn theo cột / dòng ##
Ấn v và dùng phím di chuyển (jkhl) để chọn vùng text theo dòng
Ấn Ctrl+v và dùng phím di chuyển (jkhl) để chọn vùng text theo cột

## Di chuyển cả một cột ##

- Chọn cả cột
- Ấn Shift + → để dịch cột qua phải, Ấn Shift + ← để dịch cột qua trái.

## Chèn 1 ký tự vào một cột ##

- Chọn cả cột (dùng ctrl+v)
- Shift + I
- Nhập ký tự muốn chèn.
- esc
