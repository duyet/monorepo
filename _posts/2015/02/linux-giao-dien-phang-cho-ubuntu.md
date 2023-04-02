---
template: post
title: Linux - Giao diện phẳng cho Ubuntu
date: "2015-02-17"
author: Van-Duyet Le
tags:
- Linux
- Ubuntu
- Tweak
modified_time: '2015-02-17T19:48:16.078+07:00'
thumbnail: https://4.bp.blogspot.com/-NPt92Fq9HCQ/VOMvXySpZSI/AAAAAAAACIA/12wdtDOP7ZA/s1600/Screenshot%2Bfrom%2B2015-02-17%2B19%3A07%3A47.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-763610203044718576
blogger_orig_url: https://blog.duyet.net/2015/02/linux-giao-dien-phang-cho-ubuntu.html
slug: /2015/02/linux-giao-dien-phang-cho-ubuntu.html
description: Giao diện phẳng ngày nay tại đang là trào lưu rất mạnh mẽ và Ubuntu đã có dự định chuyển sang giao diện phẳng. Gần đây nhiều bạn có hỏi giao diện hiện mình đang dùng là gì. Bài viết này sẽ hướng dẫn các bạn thay đổi theme tạo giao diện phẳng đẹp mắt cho Ubuntu cũng như các Distros khác của Linux.
fbCommentUrl: http://blog.duyetdev.com/2015/02/linux-giao-dien-phang-cho-ubuntu.html

---

Giao diện phẳng ngày nay tại đang là trào lưu rất mạnh mẽ và Ubuntu đã có dự định chuyển sang giao diện phẳng. Gần đây nhiều bạn có hỏi giao diện hiện mình đang dùng là gì. Bài viết này sẽ hướng dẫn các bạn thay đổi theme tạo giao diện phẳng đẹp mắt cho Ubuntu cũng như các Distros khác của Linux.

![](https://4.bp.blogspot.com/-NPt92Fq9HCQ/VOMvXySpZSI/AAAAAAAACIA/12wdtDOP7ZA/s1600/Screenshot%2Bfrom%2B2015-02-17%2B19%3A07%3A47.png)

## Unity Tweak Tool ##
Unity Tweak Tool  là một tiện ích dùng để tinh chỉnh Unity Destop. Với Unity Tweak Tool chúng ta có thể chỉnh Launcher, Dash, Panel, Switcher, Webapp… và nhiều thứ khác nữa. Nếu bạn nào đã cài thì bỏ qua bước này.
Đầu tiên mở Terminal, gõ lệnh sau để cài đặt

```shell
sudo add-apt-repository ppa:freyja-dev/unity-tweak-tool-daily
sudo apt-get update
sudo apt-get install unity-tweak-tool

```

## Cài đặt theme Paper ##

![](https://1.bp.blogspot.com/-suZQyfA_AKA/VOMwgPQGoMI/AAAAAAAACIM/mY7jbmp4S04/s1600/paper-screenshot.png)
Theme Paper là một theme làm cho giao diện của chúng ta phẳng và đẹp hơn. Nó dựng lại theo thiết kế Material mới của Google hay Android 5.
Mở Terminal và chạy từng lệnh sau:

```shell
sudo add-apt-repository ppa:snwh/pulp
sudo apt-get update && sudo apt-get install paper-gtk-theme paper-icon-theme
```

Vào dash (Gõ phím Windows), tìm và chạy phần mềm Unity Tweak Tool, tìm mục Theme và icon, chọn mục paper là xong.

![](https://1.bp.blogspot.com/-tlyVQNwgTpw/VOMxTiVA81I/AAAAAAAACIU/VwQCPfqnDFQ/s1600/Screenshot%2Bfrom%2B2015-02-17%2B19%3A16%3A04.png)

![](https://3.bp.blogspot.com/-6-XeD68qQTQ/VOM1C7ejC7I/AAAAAAAACIs/KOynVRg1chM/s1600/Screenshot%2Bfrom%2B2015-02-17%2B19%3A31%3A55.png)

## Cài đặt Icon Numix ##
Bộ Numix này mình cũng rất thích, bạn có thể dùng kết hợp 2 cái này (mình đang dùng theme paper, với icon của Numix :))

Chạy các lệnh sau

```shell
sudo add-apt-repository ppa:numix/ppa
sudo apt-get update
sudo apt-get install numix-gtk-theme numix-icon-theme numix-icon-theme-circle

```

Bộ icon tuyệt đẹp của Numix   
![](https://4.bp.blogspot.com/-NBT6wQnwsb8/VOM2EmxzVZI/AAAAAAAACI4/vbeh3iG3Ge4/s1600/Screenshot%2Bfrom%2B2015-02-17%2B19%3A36%3A27.png)

## Bonus ##

Bạn thấy đấy, với Linux: nguồn mở - mọi thứ đều rất dễ để tùy chỉnh. Bạn có thể search thêm theme trên Google, download thêm một số bộ font của Material (Lato, Seoge, ...), chỉnh sửa tùy thích trên Tweak để có giao diện vừa ý nhé. 

Thắc mắc có thể comment bên dưới, chúc thành công :]]
