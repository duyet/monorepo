---
template: post
title: Linux - Đường dẫn tuyệt đối và đường dẫn tương đối
date: "2015-02-15"
author: Van-Duyet Le
category: Linux
tags:
- Linux
modified_time: '2015-02-16T12:47:50.156+07:00'
thumbnail: https://1.bp.blogspot.com/-7Vz3G6MLhWs/VOAh4mrkK4I/AAAAAAAACG4/DURQJ5i71pE/s1600/Screenshot%2Bfrom%2B2015-02-15%2B11%3A33%3A35.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1424511096744401353
blogger_orig_url: https://blog.duyet.net/2015/02/linux-duong-dan-tuyet-doi-va-duong-dan-tuong-doi.html
slug: /2015/02/linux-duong-dan-tuyet-doi-va-duong-dan-tuong-doi
description: Trong linux, khi làm việc trên server hay đơn giản hơn là làm việc trên ternimal, ít nhiều bạn cũng phải rớ tới các file và thư mục, bay nhảy qua lại. Nhưng 1 điều bạn nhất định phải biết, đó là đường dẫn.
fbCommentUrl: none

---

Trong linux, khi làm việc trên server hay đơn giản hơn là làm việc trên ternimal, ít nhiều bạn cũng phải rớ tới các file và thư mục, bay nhảy qua lại. Nhưng 1 điều bạn nhất định phải biết, đó là đường dẫn.

## Đường dẫn tuyệt đối ##
Đường dẫn tuyệt đối của một tệp tin hay thư mục luôn bắt đầu bởi `/` (root) và tiếp theo sau đó là chuỗi các thư mục mà nó đi xuyên qua cho đến khi tới đích. Tóm lại, một đường dẫn tuyệt đối là đường dẫn bắt đầu bởi `/ `(root)
Ví dụ :

1. Khi bạn đang đứng trong thư mục lvduit, thư mục con của home (hay còn có thể nói home là thư mục mẹ của `lvduit`) thì đường dẫn tuyệt đối của của thư mục `lvduit` sẽ là `/home/lvduit`.
2. Đường dẫn tuyệt đối của tệp tin `xxx`, tệp tin con của thư mục mẹ là abc, và abc là thư mục con của `lvduit`, thì đường dẫn của `xxx` sẽ là `/home/lvduit/abc/xxx`.

Chốt: đường dẫn tuyệt đối bắt đầu bằng dấu /

## Đường dẫn tương đối ##
Đối với đường dẫn tương đối thì người sử dụng không đòi hỏi phải bắt đầu từ `/` (root). Đường dẫn tương đối bắt đầu đi từ thư mục hiện tại. Một đường dẫn tương đối thường bắt đầu với tên của một thư mục hoặc tệp tin, kết hợp với các thư mục đặt biệt sau

- Dấu `.` (dấu chấm), thư mục `.` là thư mục đặc biệt, liên kết (biểu thị) đến thư mục hiện thời (working directory). 
- Dấu `..` (hai chấm) liên kết (biểu thị) cho thư mục mẹ của thư mục hiện thời.

Ví dụ: ráng đọc từng dòng shell nha =]]

![](https://1.bp.blogspot.com/-7Vz3G6MLhWs/VOAh4mrkK4I/AAAAAAAACG4/DURQJ5i71pE/s1600/Screenshot%2Bfrom%2B2015-02-15%2B11%3A33%3A35.png)

Ví dụ khác: 
Giả sử là bạn đang đứng trong thư mục `/home/lvduit` trong cây thư mục.
Từ đây thì đường dẫn `abc/xxx` sẽ là đường dẫn tương đối của tệp tin xxx.
Còn` /home/lvduit/abc/xxx` sẽ là đường dẫn tuyệt đối.

## Kết ##
Về thư mục gốc

```shell
[lvduit@lvduit ~]$ cd /
```

Nhảy đến 1 vị trí bất kì khi biết địa chỉ tuyệt đối

```shell
[lvduit@lvduit ~]$ cd /usr/lib/
```

Di chuyển đến thư mục con nằm trong thư mục hiện tại

```shell
[lvduit@lvduit ~]$ cd docs  # hoặc ./docs
```

Di chuyển đến thư mục mẹ

```shell
[lvduit@lvduit ~]$ cd ..
[lvduit@lvduit ~]$ cd ../..  # di chuyển đến thư mục mẹ 2 lần
```

Bây giờ, giả sử bạn đang làm việc trong thư mục `/mnt/data/linux`. Sau đó bạn chuyển sang thư mục `/etc/sysconfig`. Để quay trở lại thư mục `/mnt/data/linux`, bạn gõ:

```shell
$ cd -
```

Lệnh cd không có tham số, sẽ đưa bạn về nhà, dù bất kể bạn đang ở đâu

```shell
[lvduit@lvduit ~]$ pwd
/net/ftp/pub/html
[lvduit@lvduit ~]$ cd
[lvduit@lvduit ~]$ pwd
/home/lvduit
```

Tương tự vậy, thư mục ~ cũng cho phép bạn về nhà bằng cách này

```shell
[lvduit@lvduit ~]$ cd ~
```

## Bonus ##
Mọi thắc mắc, bạn có thể comment bên dưới, liên hệ qua mail (lvduit08 at gmail.com).

I hope it will be useful for you :))