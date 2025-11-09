---
title: 'Linux - một số thủ thuật với trình soạn thảo vim'
date: '2015-04-25'
author: Duyet
tags:
  - Linux
  - Ubuntu
  - Vim
modified_time: '2015-04-25T13:09:47.309+07:00'
thumbnail: https://1.bp.blogspot.com/-Jls16PZ6Obc/VTsuvm57idI/AAAAAAAACU8/AmSffEltsSw/s1600/vim.png
slug: /2015/04/linux-mot-so-thu-thuat-voi-trinh-soan.html
category: Linux
description: Vim (hoặc vi) là một trong những editor mạnh mẽ trên terminal Linux. Sau đây là một vài thủ thuật hay khi sử dụng vim trên Linux.
---

Vim (hoặc vi) là một trong những editor mạnh mẽ trên terminal Linux. Sau đây là một vài thủ thuật hay khi sử dụng vim trên Linux.

![](https://1.bp.blogspot.com/-Jls16PZ6Obc/VTsuvm57idI/AAAAAAAACU8/AmSffEltsSw/s1600/vim.png)

Các lệnh được sử dụng ở chế độ command mode, nếu ở chế độ edit thì bạn có thể chuyển sang chế độ này bằng cách nhấn phím: [esc]

## Căn lề các cột dữ liệu

Lệnh

```
:%!column -t
```

## Chọn theo cột / dòng

Ấn v và dùng phím di chuyển (jkhl) để chọn vùng text theo dòng
Ấn Ctrl+v và dùng phím di chuyển (jkhl) để chọn vùng text theo cột

## Di chuyển cả một cột

- Chọn cả cột
- Ấn Shift + → để dịch cột qua phải, Ấn Shift + ← để dịch cột qua trái.

## Chèn 1 ký tự vào một cột

- Chọn cả cột (dùng ctrl+v)
- Shift + I
- Nhập ký tự muốn chèn.
- esc

## Kết luận

Vim là một công cụ rất mạnh mẽ khi bạn hiểu cách sử dụng nó. Những thủ thuật trên là những tính năng cơ bản nhưng rất hữu ích khi làm việc với dữ liệu hoặc code. Hãy thực hành và sẽ thấy Vim ngày càng trở nên thân thiện hơn!
