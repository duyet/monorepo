---
template: post
title: Cài đặt Docker trên Ubuntu
date: "2016-05-01"
author: Van-Duyet Le
tags:
- Docker
- How-to
modified_time: '2018-09-10T17:24:35.829+07:00'
thumbnail: https://2.bp.blogspot.com/-PixuaXfP3N8/VyYNLdQQKPI/AAAAAAAAUJE/jpqCnfOYVyYaMwWBl3V2whQlLdxzU70qQCK4B/s1600/docker-swarm-hero2.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8700791234463723602
blogger_orig_url: https://blog.duyet.net/2016/05/cai-dat-docker-tren-ubuntu.html
slug: /2016/05/cai-dat-docker-tren-ubuntu.html
category: Linux
description: Docker cung cấp một nền tảng mở cho các nhà phát triển và sysadmins để xây dựng, đóng gói, vận chuyển và triển khai ứng dụng bất cứ nơi nào, ứng dụng được chạy trong một container lightweight, cùng với khả năng tự động hóa, nhân bản nhanh, gọn nhẹ, ...
fbCommentUrl: none
---

Docker cung cấp một nền tảng mở cho các nhà phát triển và sysadmins để xây dựng, đóng gói, vận chuyển và triển khai ứng dụng bất cứ nơi nào, ứng dụng được chạy trong một container lightweight, cùng với khả năng tự động hóa, nhân bản nhanh, gọn nhẹ, ...

[![](https://2.bp.blogspot.com/-PixuaXfP3N8/VyYNLdQQKPI/AAAAAAAAUJE/jpqCnfOYVyYaMwWBl3V2whQlLdxzU70qQCK4B/s320/docker-swarm-hero2.png)](https://blog.duyet.net/2016/05/cai-dat-docker-tren-ubuntu.html)

Cách cài đặt Docker trên Ubuntu

## Ubuntu 15.04/15.10/16.04 ##

```
sudo apt-get install -y docker.io
```

## Ubuntu 14.04/14.10 ##

```
sudo apt-get update
sudo apt-get install curl
curl -fsSL https://get.docker.com/ | sh
```

Nếu muốn chạy Docker với user non-root, không cần sử dụng sudo. Chạy lệnh sau để add user của bạn vào Group docker 

```
sudo usermod -aG docker <your user>
```

[![](https://2.bp.blogspot.com/-Q8SGltLUeAg/VyYL31jQpXI/AAAAAAAAUHI/seScH5q1DLkJfgdGJBTZtVChC6QfgLwfwCLcB/s1600/Screenshot%2Bfrom%2B2016-05-01%2B20-59-24.png)](https://2.bp.blogspot.com/-Q8SGltLUeAg/VyYL31jQpXI/AAAAAAAAUHI/seScH5q1DLkJfgdGJBTZtVChC6QfgLwfwCLcB/s1600/Screenshot%2Bfrom%2B2016-05-01%2B20-59-24.png)

Chúc bạn thành công.

## Tham khảo ##

- Ảnh: Docker.com
- Slide: Why docker? - [https://talk.duyet.net/why-docker/](http://why-docker.talk.duyetdev.com/)
- [https://saveto.co/t/docker](https://saveto.co/t/docker)
- [Docker là gì? Cơ bản về Docker](https://blog.duyet.net/2015/12/docker-la-gi-co-ban-ve-docker.html#.VyYMd4N94_M)
