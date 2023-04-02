---
template: post
title: Docker - cài đặt Odoo 8/9 trên Docker
date: "2016-02-03"
author: Van-Duyet Le
tags:
- Tutorial
- Docker
- Dockerfile
- Odoo
- DevOps
modified_time: '2016-02-10T12:46:43.686+07:00'
thumbnail: https://3.bp.blogspot.com/-wtT1nv3Ugjw/VrGtMM6_XVI/AAAAAAAAPC8/l7qi3IkqGCg/s1600/odoo-docker-big-_495x160.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-9055619614904735005
blogger_orig_url: https://blog.duyet.net/2016/02/docker-cai-at-odoo-89-tren-docker.html
slug: /2016/02/docker-cai-at-odoo-89-tren-docker.html
category: Linux
description: Hướng dẫn cài đặt Odoo 8/9 trên Server Ubuntu chỉ bằng vài bước đơn giản
fbCommentUrl: none
---

Docker là một trong những giải pháp đóng gói và cài đặt có xu hướng phát triển mạnh hiện nay. Tôi đã có vài lần [giới thiệu](https://blog.duyet.net/2015/12/docker-la-gi-co-ban-ve-docker.html) và seminar về khả năng của Docker.

Odoo là một hệ thống lớn, tích hợp các module E-commerce (TMDT), ERP (hoạch định tài nguyên doanh nghiệp), CRM (quan hệ khách hàng), quản lý kho bãi, ... Triển khai cho doanh nghiệp với từng quy mô và quy trình khác nhau một cách linh hoạt. Odoo hiện đang được triển khai cho nhiều doanh nghiệp lớn tại VN và trên thế giới.

Trang chủ Odoo: [https://www.odoo.com](https://www.odoo.com/)

Sau tôi sẽ hướng dẫn cài đặt Odoo 8/9 trên Server Ubuntu chỉ bằng vài bước đơn giản.

![](https://3.bp.blogspot.com/-wtT1nv3Ugjw/VrGtMM6_XVI/AAAAAAAAPC8/l7qi3IkqGCg/s1600/odoo-docker-big-_495x160.jpg)

## Cài đặt Docker  

Tôi sử dụng Ubuntu 15.10, bạn có thể xem cách cài đặt Docker cho từng loại hệ điều hành treentrang của Docker: [https://docs.docker.com/engine/installation/ubuntulinux/](https://docs.docker.com/engine/installation/ubuntulinux/)

## Cài đặt PostgreSQL ##

PostgreSQL được cài đặt qua Docker:

```
docker run -d -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo --name db postgres
```

PostgreSQL sẽ được tự động tải về và cài đặt với User và password là odoo.

## Cài đặt Odoo 8/9  ##
Bản odoo mới nhất hiện tại là Odoo 9, ảnh Docker chính thức của Odoo tại Docker Hub. Pull và chạy Odoo Image.

```
docker run -p 127.0.0.1:8069:8069 --name odoo --link db:db -t odoo
```

Cài Odoo 8.0

```
docker run -p 127.0.0.1:8069:8069 --name odoo --link db:db -t odoo:8.0
```

Xong. Mở trình duyệt và truy cập: [http://localhost:8069](http://localhost:8069/)

## Mở rộng ##
Stop và restart Odoo instance

```
docker stop odoo
docker start -a odoo
```

Mount custom addons

```
docker run -v /path/to/addons:/mnt/extra-addons -p 127.0.0.1:8069:8069 --name odoo --link db:db -t odoo

```

Chạy song song nhiều Odoo instance cùng 1 lúc

```
docker run -p 127.0.0.1:8070:8069 --name odoo2 --link db:db -t odoo
docker run -p 127.0.0.1:8071:8069 --name odoo3 --link db:db -t odoo

```
