---
template: post
title: Cài đặt OpenVPN trên Debian, Ubuntu và CentOS
date: "2015-10-26"
author: Van-Duyet Le
tags:
- Linux
- OpenVPN
- Ubuntu
modified_time: '2016-02-03T13:05:36.649+07:00'
thumbnail: https://1.bp.blogspot.com/-MSVkQL61Px0/Vi483gBYyyI/AAAAAAAAFL4/XtlhpYG-uGU/s1600/Cai-dat-OpenVPN-Server.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8132263938399123512
blogger_orig_url: https://blog.duyet.net/2015/10/cai-at-openvpn-tren-debian-ubuntu-va-centos.html
slug: /2015/10/cai-at-openvpn-tren-debian-ubuntu-va-centos.html
category: Linux
description: OpenVPN là một chương trình mã nguồn mở VPN hoàn toàn miễn phí và đang được xem là giải pháp hoàn hảo nhất cho những ai muốn có một kết nối bảo mật giữa hai mạng. Trong bài này, mình sẽ giới thiệu OpenVPN road warrior installer, một script tự động cài đặt OpenVPN Server rất đơn giản và nhanh chóng.
fbCommentUrl: none
---

OpenVPN là một chương trình mã nguồn mở VPN hoàn toàn miễn phí và đang được xem là giải pháp hoàn hảo nhất cho những ai muốn có một kết nối bảo mật giữa hai mạng. Trong bài này, mình sẽ giới thiệu OpenVPN road warrior installer, một script tự động cài đặt OpenVPN Server rất đơn giản và nhanh chóng.

![](https://1.bp.blogspot.com/-MSVkQL61Px0/Vi483gBYyyI/AAAAAAAAFL4/XtlhpYG-uGU/s1600/Cai-dat-OpenVPN-Server.jpg)

Ảnh: Digital Ocean

## VPN (Virtual Private Network) ##
VPN (Virtual Private Network) là một mạng riêng sử dụng mạng Internet để kết nối các địa điểm hoặc người sử dụng từ xa với một mạng LAN. Thay vì dùng kết nối thật khá phức tạp như đường dây thuê bao số, VPN tạo ra các liên kết ảo được truyền qua Internet giữa mạng riêng của một tổ chức với địa điểm hoặc người sử dụng ở xa.

## Cài đặt OpenVPN trên Debian, Ubuntu và CentOS 

Để bắt đầu quá trình cài đặt bạn chạy lệnh sau:

```
wget git.io/vpn --no-check-certificate -O openvpn-install.sh; bash openvpn-install.sh
```

Sau đó script sẽ tự động cài đặt, cuối cùng bạn sẽ có file clientname.ovpn trong thư mục /root để kết nối tới server.

Để tiếp tục thêm user, bạn chỉ cần sử dụng lệnh bash openvpn-install.sh
