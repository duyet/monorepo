---
template: post
title: Deploy production Node.js với PM2 và Nginx
date: "2016-04-10"
author: Van-Duyet Le
tags:
- Nodejs
- Tutorial
- Deploy
- Nginx
- PM2
modified_time: '2016-05-02T19:37:15.694+07:00'
thumbnail: https://3.bp.blogspot.com/-hgi6cDJuaP0/VxTAu2i1SII/AAAAAAAATkU/k_reis6UEhAElFCqjjolcrW6_j-bjZUfACK4B/s1600/logo_pm2.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7908338456078969829
blogger_orig_url: https://blog.duyet.net/2016/04/deploy-production-nodejs-pm2-nginx.html
slug: /2016/04/deploy-production-nodejs-pm2-nginx.html
category: Javascript
description: Cách cài đặt và triển khai production Node.js project với Nginx và PM2.
fbCommentUrl: http://blog.duyetdev.com/2016/04/deploy-production-nodejs-pm2-nginx.html
---

Cách cài đặt và triển khai production Node.js project với Nginx và PM2.

![](https://3.bp.blogspot.com/-hgi6cDJuaP0/VxTAu2i1SII/AAAAAAAATkU/k_reis6UEhAElFCqjjolcrW6_j-bjZUfACK4B/s1600/logo_pm2.png)

## Chuẩn bị ##

Đưa code lên server, nên sử dụng Git

```
cd ~/project
git clone https://github.com/saveto-co/saveto && cd saveto
```

Sau đó cài đặt các package (npm, bower), các phần mềm và cơ sở dữ liệu cần thiết, ... 

```
npm install
bower install

# Ví dụ
sudo apt-get install mongodb # mongodb
sudo apt-get install redis-server # redis 
```

## Cài đặt Nginx và PM2 ##

```
sudo apt-get install nginx
sudo npm install -g pm2
```

## Khởi động PM2 ##
Khởi động Webserver sử dụng PM2

```
pm2 start app.js --name "app_name" # hay index.js tùy project
```

Hoặc với các project sử dụng grunt hoặc gulp

```
pm2 start $(which grunt) serve:dist --name "app_name" # production mode
```

```
Output:
┌──────────┬────┬──────┬──────┬────────┬───────────┬────────┬────────────┬──────────┐
│ App name │ id │ mode │ PID  │ status │ restarted │ uptime │     memory │ watching │
├──────────┼────┼──────┼──────┼────────┼───────────┼────────┼────────────┼──────────┤
│ app_name │ 0  │ fork │ 5871 │ online │         0 │ 0s     │ 9.012 MB   │ disabled │
└──────────┴────┴──────┴──────┴────────┴───────────┴────────┴────────────┴──────────┘
```

PM2 sẽ tự động chạy ứng dụng Nodejs, tự động restart khi lỗi. PM2 còn kèm theo nhiều plugin với nhiều chức năng như: cân bằng tải, update source no zero down time (cập nhật mã nguồn mà không làm tắt server), scale (tự động mở rộng khả năng chịu tải), tự động cập nhật source code khi Git được update, ...
Đọc thêm về PM2 tại đây: [https://github.com/Unitech/pm2](https://github.com/Unitech/pm2)

Ví dụ với ứng dụng trên, PM2 chạy ứng dụng ở port 9000, truy cập http://<ip>:9000 để kiểm tra.

## Cấu hình Nginx Reverse Proxy Server ##

Nginx có vai trò như một Reverse Proxy.

![](https://4.bp.blogspot.com/-8LFBF4hC2s0/VxS8sSs0c9I/AAAAAAAATkI/l1QxbaQsm-oS2KsmXjeAANx8OyeR_qLfACK4B/s1600/68747470733a2f2f6173736574732e6469676974616c6f6365616e2e636f6d2f61727469636c65732f6e6f64656a732f6e6f64655f6469616772616d2e706e67.png)

Mở file cấu hình nginx

```
sudo nano /etc/nginx/sites-available/default
```

Thêm hoặc xóa file cấu hình theo nội dung bên dưới 

```
server {
    listen 80;

    server_name example.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Với example.com là domain, thay localhost và port 9000 trùng với thông tin trên server của bạn. Sau đó khởi động lại Nginx

```
sudo service nginx restart
```

## Bonus ##

### Khởi động lại Application ###

```
pm2 restart <appname hoặc appid>
```
Xem App Name hoặc App ID bằng lệnh:

```
$ pm2 status

┌──────────┬────┬─────────┬──────┬────────┬─────────┬────────┬──────────────┬──────────┐
│ App name │ id │ mode    │ pid  │ status │ restart │ uptime │ memory       │ watching │
├──────────┼────┼─────────┼──────┼────────┼─────────┼────────┼──────────────┼──────────┤
│ quick    │ 0  │ cluster │ 8362 │ online │ 0       │ 12m    │ 110.535 MB   │ disabled │
│ quick    │ 1  │ cluster │ 8371 │ online │ 0       │ 12m    │ 111.191 MB   │ disabled │
└──────────┴────┴─────────┴──────┴────────┴─────────┴────────┴──────────────┴──────────┘

```

### PM2 tự động cập nhật mã nguồn khi push lên Git ([link](https://github.com/saveto-co/wiki/wiki/Production)) ###

```
pm2 install pm2-auto-pull
```

```
[PM2][Module] Module downloaded
[PM2] Process launched
[PM2][Module] Module successfully installed and launched
[PM2][Module] : To configure module do
[PM2][Module] : $ pm2 conf <key> <value>
┌──────────┬────┬─────────┬──────┬────────┬─────────┬────────┬──────────────┬──────────┐
│ App name │ id │ mode    │ pid  │ status │ restart │ uptime │ memory       │ watching │
├──────────┼────┼─────────┼──────┼────────┼─────────┼────────┼──────────────┼──────────┤
│ quick    │ 0  │ cluster │ 8362 │ online │ 0       │ 12m    │ 110.535 MB   │ disabled │
│ quick    │ 1  │ cluster │ 8371 │ online │ 0       │ 12m    │ 111.191 MB   │ disabled │
└──────────┴────┴─────────┴──────┴────────┴─────────┴────────┴──────────────┴──────────┘
 Module activated
┌───────────────┬─────────┬────────────┬────────┬─────────┬─────┬─────────────┐
│ Module        │ version │ target PID │ status │ restart │ cpu │ memory      │
├───────────────┼─────────┼────────────┼────────┼─────────┼─────┼─────────────┤
│ pm2-auto-pull │ N/A     │ 9360       │ online │ 0       │ 25% │ 12.586 MB   │
└───────────────┴─────────┴────────────┴────────┴─────────┴─────┴─────────────┘
 Use `pm2 show <id|name>` to get more details about an app
```

Chỉ cần push mã nguồn lên Git, pm2 sẽ tự động pull về và cài đặt mà không cần truy cập lên server để làm bằng tay. Nên để source code trên server ở nhánh production. Xem thêm về [kỹ thuật làm việc trên Git branch](https://blog.duyet.net/2015/07/git-ki-thuat-chia-branch-branch-early.html) để có thể hiểu hơn về mô hình làm việc này.

PM2 còn khá nhiều tính năng hữu ích, comment bên dưới để được tôi hỗ trợ thêm nhé.
