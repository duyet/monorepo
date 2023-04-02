---
template: post
title: Openstack - App Catalog và Docker trên Devstack
date: "2016-10-29"
author: Van-Duyet Le
tags:
- Docker
- Python
- Javascript
- Magnum
- Openstack
- DevStack
- Maruno
- Horizon
modified_time: '2018-09-01T22:32:19.992+07:00'
thumbnail: https://2.bp.blogspot.com/-8mDGZPymnKU/WBSIXCWaybI/AAAAAAAAfaM/pIubRdw6SrkJLB4Sm8oLQJ1D7quLU8rxwCEw/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-55.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-9066740408293011856
blogger_orig_url: https://blog.duyet.net/2016/10/devstack-maruno-magnum.html
slug: /2016/10/devstack-maruno-magnum.html
category: News
description: DevStack là giúp triển khai mô hình Openstack cho Developers, có thể chạy trên Single-Machine
fbCommentUrl: http://blog.duyetdev.com/2016/10/devstack-maruno-magnum.html
---

DevStack là giúp triển khai mô hình Openstack cho Developers, có thể chạy trên Single-Machine.  
Trong bài này sẽ hướng dẫn cách cài đặt DevStack, với các module mở rộng như **Magnum \[1\]** (triển khai Containers trên Openstack), **Murano** \[2\] (Application catalogs), ...  
  

[![](https://2.bp.blogspot.com/-8mDGZPymnKU/WBSIXCWaybI/AAAAAAAAfaM/pIubRdw6SrkJLB4Sm8oLQJ1D7quLU8rxwCEw/s1600/Screenshot%2Bfrom%2B2016-10-29%2B18-28-55.png)](https://blog.duyet.net/2016/10/devstack-maruno-magnum.html)

  

## Môi trường 

DevStack yêu cầu chạy trên HDH **Linux**. Các hệ điều hành Linux mà bạn có thể sử dụng như: **Ubuntu 14.04/16.04, Fedora 23/24, CentOS/RHEL 7, cũng như Debian và OpenSUSE.**  
Trong bài này tất cả ví dụ được sử dụng trên **CentOS 7**, các hệ điều hành khác tương tự  
  
Cài đặt git  
  

    sudo yum install git

  
Cài Git trên Ubuntu  
  

    sudo apt-get install git

  
Cài đặt user **stack** (không cài đặt **devstack** dưới tài khoản root)  
  

    sudo su -adduser stackecho "stack ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoersexitsu stack

  

## Cài đặt Devstack với module Murano và Magnum

Murano project là dự án application catalog của **Openstack**, cho phép lập trình viên có thể public các ứng dụng dưới dạng cloud-ready, người dùng có thể triển khai, cài đặt các ứng dụng này chỉ **với vài nút bấm**.  
  
Ví dụ về Murano:  

[![](https://2.bp.blogspot.com/-PC036z2KBHQ/WBR70SPyJaI/AAAAAAAAfZg/AZsICBqFE0k1KjX2pgaYj0dG30IlyCZUwCK4B/s1600/murano1.png)](https://2.bp.blogspot.com/-PC036z2KBHQ/WBR70SPyJaI/AAAAAAAAfZg/AZsICBqFE0k1KjX2pgaYj0dG30IlyCZUwCK4B/s1600/murano1.png)

  
Tải và cấu hình Devstack  
  

    cd ~git clone https://git.openstack.org/openstack-dev/devstackcd devstackgit checkout stable/mitaka

  
Tạo file `local.conf` để cấu hình cài đặt Devstack, nội dung file `local.conf` được giải thích lần lượt như sau, file hoàn chỉnh ở bên dưới:  
  

    [[local|localrc]]# CredentialsADMIN_PASSWORD=123456DATABASE_PASSWORD=$ADMIN_PASSWORDRABBIT_PASSWORD=$ADMIN_PASSWORDSERVICE_PASSWORD=$ADMIN_PASSWORDSERVICE_TOKEN=$ADMIN_PASSWORDSWIFT_PASSWORD=$ADMIN_PASSWORDenable_service rabbit# Ensure we are using neutron networking rather than nova networkingdisable_service n-netenable_service q-svcenable_service q-agtenable_service q-dhcpenable_service q-l3enable_service q-metaenable_service neutron

  
Bắt đầu file cấu hình, ta đặt Password cho Admin và các services khác mặc định là 123456. Bật và tắt một số services mặc định của Devstack. Tiếp tục file:  
  

    # Disable LBaaS(v1) servicedisable_service q-lbaas# Enable LBaaS(v2) servicesenable_service q-lbaasv2enable_service octaviaenable_service o-cwenable_service o-hkenable_service o-hmenable_service o-api

  
Tắt LBaaS v1 và bật v2. Tiếp theo:  
  

    # Enable heat pluginenable_plugin heat https://git.openstack.org/openstack/heat# Enable barbican servicesenable_plugin barbican https://git.openstack.org/openstack/barbicanenable_plugin neutron-lbaas https://git.openstack.org/openstack/neutron-lbaasenable_plugin octavia https://git.openstack.org/openstack/octavia

  
Magnum yêu cầu bật plugin Heat, Barbican là REST API services giúp quản lý an toàn mật khẩu, mã hóa và X.509 Certificates.  
  

    enable_plugin murano git://git.openstack.org/openstack/muranoenable_service murano-cfapienable_plugin ceilometer git://git.openstack.org/openstack/ceilometer# Enable magnum plugin after dependent pluginsenable_plugin magnum https://git.openstack.org/openstack/magnum# Optional:  uncomment to enable the Magnum UI plugin in Horizonenable_plugin magnum-ui https://github.com/openstack/magnum-ui# enable swift in devstack for Docker 2.0enable_service s-proxyenable_service s-objectenable_service s-containerenable_service s-account

  
Bật các modules Magnum, UI và Murano. Cuối cùng ta được file local.conf hoàn chỉnh như sau \[3\]:



<script src="https://gist.github.com/duyet/1fe56d669bf5587f1cdc3bd8b7aabc07.js"></script>


Chạy lệnh sau và đợi Devstack tự động Clone các phần thiếu và tự động cấu hình cài đặt. Đi pha 1 hoặc vài ly cà phê rồi đợi, cài đặt thường diễn ra trong vòng 30 phút - vài tiếng tùy cấu hình server.  
  

    ./stack.sh

  

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

    wget https://bootstrap.pypa.io/get-pip.pysudo python get-pip.pysudo pip install -U os-testr

**ImportError: No module named osc\_lib**  

    sudo pip install osc-lib

**ImportError: No module from neutron\_lib.db import model.base**  

    sudo pip install neutron-libb

  
**sudo permission install python-openstackclient**

    sudo pip install python-openstackclient

## Tham khảo

\[1\] https://wiki.openstack.org/wiki/Magnum  
\[2\] https://wiki.openstack.org/wiki/Murano  
\[3\] https://gist.github.com/duyet/1fe56d669bf5587f1cdc3bd8b7aabc07