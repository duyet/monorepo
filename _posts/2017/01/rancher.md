---
template: post
title: Rancher - Quản lý Docker Container bằng UI
date: "2017-01-23"
author: Van-Duyet Le
tags:
- Data Engineer
- Docker
- Rancher
- Container
- Swarm
- Kubernete
modified_time: '2018-07-20T10:14:07.356+07:00'
thumbnail: https://3.bp.blogspot.com/-QUh_PaavDSA/WIWWTCtiTXI/AAAAAAAAies/LvVHTtMjnAglcdCB8uZfGsgJVfz7dirXQCLcB/s1600/ezgif.com-optimize.gif
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-807383324529952289
blogger_orig_url: https://blog.duyet.net/2017/01/rancher.html
slug: /2017/01/rancher.html
category: Linux
description: "Rancher giúp quản lý Docker bằng UI Web một cách tiện dụng, mọi thao tác đều trên UI. Rancher còn tích hợp Shell trên Docker, App catalog, ..."
fbCommentUrl: http://blog.duyetdev.com/2017/01/rancher.html
---

Rancher giúp quản lý Docker bằng UI Web một cách tiện dụng, mọi thao tác đều trên UI. Rancher còn tích hợp Shell trên Docker, App catalog, ...

![](https://3.bp.blogspot.com/-QUh_PaavDSA/WIWWTCtiTXI/AAAAAAAAies/LvVHTtMjnAglcdCB8uZfGsgJVfz7dirXQCLcB/s1600/ezgif.com-optimize.gif)

## Rancher  ##
Trang chủ: [http://rancher.com](http://rancher.com/)

Mình đang dùng cái này, khá là hay và mạnh, Rancher có thể quản lý các container trên Cluster lớn, Docker Swarm, Mesos hay Kubernete. Kết nối các Host trên EC2, Linode, Azure ... bằng API. Quản lý kết nối giữa các Container, port, metric monitor, ...

Cài đặt:

```
$ sudo docker run -d --restart=unless-stopped -p 8080:8080 rancher/server
```

Đợi 1 tí rồi mở trình duyệt truy cập http://ip:8080

Sau khi truy cập, add thêm host, ở đây bạn điền IP của máy chứ không được dùng localhost. Dùng lệnh ifconfig để xem IP.

[![](https://2.bp.blogspot.com/-ZNdccIt171E/WIWf49g7kCI/AAAAAAAAifM/34Bct08_snIQ6vyXaotfHRUwlUt8mmO2ACLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-16-05.png)](https://2.bp.blogspot.com/-ZNdccIt171E/WIWf49g7kCI/AAAAAAAAifM/34Bct08_snIQ6vyXaotfHRUwlUt8mmO2ACLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-16-05.png)

Chọn custom (hoặc EC2, Azure, ... nếu bạn có tài khoản trên các dịch vụ này). Copy và paste ở mục 5 vào máy (có cài sẵn docker) để Connect máy đó đến rancher server. Mình dùng chính máy hiện tại:

```
sudo docker run -e CATTLE_AGENT_IP="192.168.43.190"  -d --privileged -v /var/run/docker.sock:/var/run/docker.sock -v /var/lib/rancher:/var/lib/rancher rancher/agent:v1.1.3 http://192.168.43.190:8080/v1/scripts/EF9E0EF70666B471341A:1485151200000:euIPqkfQVLtbJMRI5XVR2dPNxE
```

Một số hình ảnh:

[![](https://1.bp.blogspot.com/-1hKUnRQ9LK4/WIWeT5rWQYI/AAAAAAAAifA/8pGwYa_kPbQKJ9cbp9jkXF5UNxGSY37ygCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-09-51.png)](https://1.bp.blogspot.com/-1hKUnRQ9LK4/WIWeT5rWQYI/AAAAAAAAifA/8pGwYa_kPbQKJ9cbp9jkXF5UNxGSY37ygCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-09-51.png)

[![](https://3.bp.blogspot.com/-2gWNWEjGE-U/WIWi5lBbGzI/AAAAAAAAifc/aAHTrwz8Mo4fTgHdwiZF0JK0e0nGLhbLQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-13-20.png)](https://3.bp.blogspot.com/-2gWNWEjGE-U/WIWi5lBbGzI/AAAAAAAAifc/aAHTrwz8Mo4fTgHdwiZF0JK0e0nGLhbLQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-13-20.png)

[![](https://3.bp.blogspot.com/-OTSv6FqIqSE/WIWi5jeom-I/AAAAAAAAifk/UiWOM7ksi9ksxk2aM5n0PCE2JAxA5OFzACLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-18-13.png)](https://3.bp.blogspot.com/-OTSv6FqIqSE/WIWi5jeom-I/AAAAAAAAifk/UiWOM7ksi9ksxk2aM5n0PCE2JAxA5OFzACLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-18-13.png)

[![](https://3.bp.blogspot.com/-qMgreqGJ2uo/WIWi5kLLYxI/AAAAAAAAifg/yePcp0yqL1suNEtGFXjYUcSCEtRUmudpQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-24-41.png)](https://3.bp.blogspot.com/-qMgreqGJ2uo/WIWi5kLLYxI/AAAAAAAAifg/yePcp0yqL1suNEtGFXjYUcSCEtRUmudpQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-24-41.png)

[![](https://4.bp.blogspot.com/-XQH4w7AXw0Q/WIWi6WORpjI/AAAAAAAAifo/QGpuiJaQdEocIEE_xVBMaRQm44o61yQawCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-25-25.png)](https://4.bp.blogspot.com/-XQH4w7AXw0Q/WIWi6WORpjI/AAAAAAAAifo/QGpuiJaQdEocIEE_xVBMaRQm44o61yQawCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-25-25.png)

[![](https://3.bp.blogspot.com/-nA_vLKRMUwM/WIWi6QXCAvI/AAAAAAAAifs/Unjdghoaz3IUk2L90s7xTvYOWeqH3WElgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-25-43.png)](https://3.bp.blogspot.com/-nA_vLKRMUwM/WIWi6QXCAvI/AAAAAAAAifs/Unjdghoaz3IUk2L90s7xTvYOWeqH3WElgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-25-43.png)

[![](https://2.bp.blogspot.com/-TiGhoLmImvY/WIWi6ofMU3I/AAAAAAAAifw/RwXLO-0483sNqW2UX8zOFXP1GubPO74YQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-26-17.png)](https://2.bp.blogspot.com/-TiGhoLmImvY/WIWi6ofMU3I/AAAAAAAAifw/RwXLO-0483sNqW2UX8zOFXP1GubPO74YQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-26-17.png)

[![](https://2.bp.blogspot.com/-iQd5Yzrmx70/WIWi9AwIHZI/AAAAAAAAif0/TIEDwMbdsOAQ7e5k2UqcI-LW8sYOdEnWQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-26-51.png)](https://2.bp.blogspot.com/-iQd5Yzrmx70/WIWi9AwIHZI/AAAAAAAAif0/TIEDwMbdsOAQ7e5k2UqcI-LW8sYOdEnWQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-26-51.png)

[![](https://4.bp.blogspot.com/-xDG1rOxh3Ow/WIWi9AlYinI/AAAAAAAAif8/Wx0a0GbxydowoVa3UZiigS61NmJtLb7pgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-27-10.png)](https://4.bp.blogspot.com/-xDG1rOxh3Ow/WIWi9AlYinI/AAAAAAAAif8/Wx0a0GbxydowoVa3UZiigS61NmJtLb7pgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-27-10.png)

[![](https://2.bp.blogspot.com/-9QXAsVmvzUY/WIWi9E_5mNI/AAAAAAAAif4/6HWzOhnndF4CZB4l9YQv03P34xjEG4f8wCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-27-31.png)](https://2.bp.blogspot.com/-9QXAsVmvzUY/WIWi9E_5mNI/AAAAAAAAif4/6HWzOhnndF4CZB4l9YQv03P34xjEG4f8wCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-27-31.png)

[![](https://4.bp.blogspot.com/-5pz5RUB17T8/WIWi-y9-iDI/AAAAAAAAigA/xvsSn26K_DY6Bl3F8DApv-rwWjZkEWOKQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-27-43.png)](https://4.bp.blogspot.com/-5pz5RUB17T8/WIWi-y9-iDI/AAAAAAAAigA/xvsSn26K_DY6Bl3F8DApv-rwWjZkEWOKQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-27-43.png)

[![](https://1.bp.blogspot.com/-VxORm2ey2oc/WIWi_B9klWI/AAAAAAAAigE/SJfU3mInHdUnAkgn9D_1sfYezS37R8sNgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-28-27.png)](https://1.bp.blogspot.com/-VxORm2ey2oc/WIWi_B9klWI/AAAAAAAAigE/SJfU3mInHdUnAkgn9D_1sfYezS37R8sNgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B13-28-27.png)

## Tham khảo ##

- Rancher - [http://rancher.com/rancher/](http://rancher.com/rancher/)
- Installing Rancher Server - [http://docs.rancher.com/rancher/v1.3/en/installing-rancher/installing-server/](http://docs.rancher.com/rancher/v1.3/en/installing-rancher/installing-server/)
