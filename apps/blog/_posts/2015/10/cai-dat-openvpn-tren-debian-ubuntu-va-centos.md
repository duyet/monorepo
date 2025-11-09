---
title: Cài đặt OpenVPN trên Debian, Ubuntu và CentOS
date: '2015-10-26'
author: Duyet
tags:
  - Linux
  - Ubuntu
modified_time: '2016-02-03T13:05:36.649+07:00'
thumbnail: https://1.bp.blogspot.com/-MSVkQL61Px0/Vi483gBYyyI/AAAAAAAAFL4/XtlhpYG-uGU/s1600/Cai-dat-OpenVPN-Server.jpg
slug: /2015/10/cai-dat-openvpn-tren-debian-ubuntu-va-centos.html
category: Linux
description: OpenVPN là một chương trình mã nguồn mở VPN hoàn toàn miễn phí và đang được xem là giải pháp hoàn hảo nhất cho những ai muốn có một kết nối bảo mật giữa hai mạng. Trong bài này, mình sẽ giới thiệu OpenVPN road warrior installer, một script tự động cài đặt OpenVPN Server rất đơn giản và nhanh chóng.
---

OpenVPN là một chương trình mã nguồn mở VPN hoàn toàn miễn phí và đang được xem là giải pháp hoàn hảo nhất cho những ai muốn có một kết nối bảo mật giữa hai mạng. Trong bài này, mình sẽ giới thiệu OpenVPN road warrior installer, một script tự động cài đặt OpenVPN Server rất đơn giản và nhanh chóng.

> **Lưu ý 2025:** Bài viết này được viết năm 2015. OpenVPN vẫn là giải pháp VPN đáng tin cậy trong 2025, nhưng bạn nên xem xét các phiên bản gần đây (2.4+, 2.5+, 2.6+) và các giải pháp hiện đại khác như WireGuard. Script được đề cập có thể đã lỗi thời - hãy kiểm tra nguồn cập nhật trước khi sử dụng.

## VPN (Virtual Private Network)

VPN (Virtual Private Network) là một mạng riêng sử dụng mạng Internet để kết nối các địa điểm hoặc người sử dụng từ xa với một mạng LAN. Thay vì dùng kết nối thật khá phức tạp như đường dây thuê bao số, VPN tạo ra các liên kết ảo được truyền qua Internet giữa mạng riêng của một tổ chức với địa điểm hoặc người sử dụng ở xa.

## Cài đặt OpenVPN trên Debian, Ubuntu và CentOS

Để bắt đầu quá trình cài đặt bạn chạy lệnh sau:

```bash
wget git.io/vpn --no-check-certificate -O openvpn-install.sh; bash openvpn-install.sh
```

> **Cảnh báo:** URL `git.io/vpn` có thể không còn hoạt động. Nên tìm kiếm script cập nhật từ [AndrewVos/openvpn-install](https://github.com/anandvos/openvpn-install) hoặc [Nyr/openvpn-install](https://github.com/Nyr/openvpn-install) trên GitHub để có phiên bản hiện tại.

Sau đó script sẽ tự động cài đặt, cuối cùng bạn sẽ có file clientname.ovpn trong thư mục /root để kết nối tới server.

Để tiếp tục thêm user, bạn chỉ cần sử dụng lệnh bash openvpn-install.sh

## Các lựa chọn hiện đại (2025)

OpenVPN vẫn đáng tin cậy, nhưng bạn cũng nên xem xét:

- **WireGuard**: Giải pháp VPN hiện đại, nhẹ và nhanh hơn OpenVPN, đã được tích hợp vào kernel Linux
- **OpenVPN 2.6+**: Các phiên bản gần đây với cải thiện bảo mật và hiệu suất
- **OpenVPN 3 (OpenVPN Cloud)**: Phiên bản enterprise với quản lý tập trung

Nên kiểm tra tài liệu chính thức của OpenVPN để có thông tin về bảo mật, cập nhật, và các tùy chọn cấu hình tối ưu.
