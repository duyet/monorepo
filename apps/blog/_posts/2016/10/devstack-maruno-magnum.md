---
title: Openstack - App Catalog và Docker trên Devstack
date: '2016-10-29'
author: Duyet
tags:
  - Docker
  - Python
  - Openstack
modified_time: '2018-09-01T22:32:19.992+07:00'
thumbnail: https://2.bp.blogspot.com/-8mDGZPymnKU/WBSIXCWaybI/AAAAAAAAfaM/pIubRdw6SrkJLB4Sm8oLQJ1D7quLU8rxwCEw/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-55.png
slug: /2016/10/devstack-maruno-magnum.html
category: News
description: DevStack là giúp triển khai mô hình Openstack cho Developers, có thể chạy trên Single-Machine
---

DevStack là giúp triển khai mô hình Openstack cho Developers, có thể chạy trên Single-Machine.  
Trong bài này sẽ hướng dẫn cách cài đặt DevStack, với các module mở rộng như **Magnum \[1\]** (triển khai Containers trên Openstack), **Murano** \[2\] (Application catalogs), ...

[![](https://2.bp.blogspot.com/-8mDGZPymnKU/WBSIXCWaybI/AAAAAAAAfaM/pIubRdw6SrkJLB4Sm8oLQJ1D7quLU8rxwCEw/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-55.png)](https://blog.duyet.net/2016/10/devstack-maruno-magnum.html)

## Môi trường 

DevStack yêu cầu chạy trên HDH **Linux**. Các hệ điều hành Linux mà bạn có thể sử dụng như: **Ubuntu 14.04/16.04, Fedora 23/24, CentOS/RHEL 7, cũng như Debian và OpenSUSE.**  
Trong bài này tất cả ví dụ được sử dụng trên **CentOS 7**, các hệ điều hành khác tương tự

Cài đặt git

```bash
sudo yum install git
```

Cài Git trên Ubuntu

```bash
sudo apt-get install git
```

Cài đặt user **stack** (không cài đặt **devstack** dưới tài khoản root)

```bash
sudo su -
adduser stack
echo "stack ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
exit
su stack
```

## Cài đặt Devstack với module Murano và Magnum

Murano project là dự án application catalog của **Openstack**, cho phép lập trình viên có thể public các ứng dụng dưới dạng cloud-ready, người dùng có thể triển khai, cài đặt các ứng dụng này chỉ **với vài nút bấm**.

Ví dụ về Murano:

[![](https://2.bp.blogspot.com/-PC036z2KBHQ/WBR70SPyJaI/AAAAAAAAfZg/AZsICBqFE0k1KjX2pgaYj0dG30IlyCZUwCK4B/s1600/murano1.png)](https://2.bp.blogspot.com/-PC036z2KBHQ/WBR70SPyJaI/AAAAAAAAfZg/AZsICBqFE0k1KjX2pgaYj0dG30IlyCZUwCK4B/s1600/murano1.png)

Tải và cấu hình Devstack

```bash
cd ~
git clone https://git.openstack.org/openstack-dev/devstack
cd devstack
git checkout stable/mitaka
```

Tạo file `local.conf` để cấu hình cài đặt Devstack, nội dung file `local.conf` được giải thích lần lượt như sau, file hoàn chỉnh ở bên dưới:

```ini
[[local|localrc]]
# Credentials
ADMIN_PASSWORD=123456
DATABASE_PASSWORD=$ADMIN_PASSWORD
RABBIT_PASSWORD=$ADMIN_PASSWORD
SERVICE_PASSWORD=$ADMIN_PASSWORD
SERVICE_TOKEN=$ADMIN_PASSWORD
SWIFT_PASSWORD=$ADMIN_PASSWORD
enable_service rabbit
# Ensure we are using neutron networking rather than nova networking
disable_service n-net
enable_service q-svc
enable_service q-agt
enable_service q-dhcp
enable_service q-l3
enable_service q-meta
enable_service neutron
```

Bắt đầu file cấu hình, ta đặt Password cho Admin và các services khác mặc định là 123456. Bật và tắt một số services mặc định của Devstack. Tiếp tục file:

```ini
# Disable LBaaS(v1) service
disable_service q-lbaas
# Enable LBaaS(v2) services
enable_service q-lbaasv2
enable_service octavia
enable_service o-cw
enable_service o-hk
enable_service o-hm
enable_service o-api
```

Tắt LBaaS v1 và bật v2. Tiếp theo:

```ini
# Enable heat plugin
enable_plugin heat https://git.openstack.org/openstack/heat
# Enable barbican services
enable_plugin barbican https://git.openstack.org/openstack/barbican
enable_plugin neutron-lbaas https://git.openstack.org/openstack/neutron-lbaas
enable_plugin octavia https://git.openstack.org/openstack/octavia
```

Magnum yêu cầu bật plugin Heat, Barbican là REST API services giúp quản lý an toàn mật khẩu, mã hóa và X.509 Certificates.

```ini
enable_plugin murano git://git.openstack.org/openstack/murano
enable_service murano-cfapi
enable_plugin ceilometer git://git.openstack.org/openstack/ceilometer
# Enable magnum plugin after dependent plugins
enable_plugin magnum https://git.openstack.org/openstack/magnum
# Optional:  uncomment to enable the Magnum UI plugin in Horizon
enable_plugin magnum-ui https://github.com/openstack/magnum-ui
# enable swift in devstack for Docker 2.0
enable_service s-proxy
enable_service s-object
enable_service s-container
enable_service s-account
```

Bật các modules Magnum, UI và Murano. Cuối cùng ta được file local.conf hoàn chỉnh như sau \[3\]:

<script src="https://gist.github.com/duyet/1fe56d669bf5587f1cdc3bd8b7aabc07.js"></script>

Chạy lệnh sau và đợi Devstack tự động Clone các phần thiếu và tự động cấu hình cài đặt. Đi pha 1 hoặc vài ly cà phê rồi đợi, cài đặt thường diễn ra trong vòng 30 phút - vài tiếng tùy cấu hình server.

```bash
./stack.sh
```

## Hoàn tất và sử dụng

Truy cập http://localhost/dashboard, sử dụng tài khoản admin/123456

[![](https://2.bp.blogspot.com/-Qlcm007QthA/WBSIWhGNn2I/AAAAAAAAfZ8/3zqB_AvN-Osu2kED5XIA_tHZwceYglWEQCLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-25-58.png)](https://2.bp.blogspot.com/-Qlcm007QthA/WBSIWhGNn2I/AAAAAAAAfZ8/3zqB_AvN-Osu2kED5XIA_tHZwceYglWEQCLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-25-58.png)

[![](https://1.bp.blogspot.com/-H5Y6oNV7cJA/WBSIWvFtlaI/AAAAAAAAfZ0/Pt4ZYk3icFs1tCAo0vaRPSJE4G_GKzzjQCLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-26-32.png)](https://1.bp.blogspot.com/-H5Y6oNV7cJA/WBSIWvFtlaI/AAAAAAAAfZ0/Pt4ZYk3icFs1tCAo0vaRPSJE4G_GKzzjQCLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-26-32.png)

[![](https://3.bp.blogspot.com/-WBKgs6w-hfk/WBSIWxa6U2I/AAAAAAAAfaA/6kw2R29TumUg9L2kSAj-NFBuyJTmz72YwCLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-29.png)](https://3.bp.blogspot.com/-WBKgs6w-hfk/WBSIWxa6U2I/AAAAAAAAfaA/6kw2R29TumUg9L2kSAj-NFBuyJTmz72YwCLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-29.png)

[![](https://1.bp.blogspot.com/-8mDGZPymnKU/WBSIXCWaybI/AAAAAAAAfaI/3qIRB7fMTVUc0k7qYdQ9D14Qe64aWsTSACLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-55.png)](https://1.bp.blogspot.com/-8mDGZPymnKU/WBSIXCWaybI/AAAAAAAAfaI/3qIRB7fMTVUc0k7qYdQ9D14Qe64aWsTSACLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-55.png)

[![](https://4.bp.blogspot.com/-sJkQ7GdcHko/WBSIXGi4KzI/AAAAAAAAfaE/JG3-vBF4AAM9AGsbEMbkVBIVnjXtUAcoACLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-29-36.png)](https://4.bp.blogspot.com/-sJkQ7GdcHko/WBSIXGi4KzI/AAAAAAAAfaE/JG3-vBF4AAM9AGsbEMbkVBIVnjXtUAcoACLcB/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-29-36.png)

## Một số lỗi hay gặp

Danh sách các lỗi hay gặp và cách xử lý

**Error ./stack.sh line 488: generate-subunit command not found**

```bash
wget https://bootstrap.pypa.io/get-pip.py
sudo python get-pip.py
sudo pip install -U os-testr
```

**ImportError: No module named osc_lib**

```bash
sudo pip install osc-lib
```

**ImportError: No module from neutron_lib.db import model.base**

```bash
sudo pip install neutron-lib
```

**sudo permission install python-openstackclient**

```bash
sudo pip install python-openstackclient
```

## Tham khảo

\[1\] https://wiki.openstack.org/wiki/Magnum  
\[2\] https://wiki.openstack.org/wiki/Murano  
\[3\] https://gist.github.com/duyet/1fe56d669bf5587f1cdc3bd8b7aabc07
