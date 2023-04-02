---
template: post
title: Nodejs - Giới thiệu SailsJS framework.
date: "2015-08-08"
author: Van-Duyet Le
tags:
- Nodejs
- sails
- sailsjs
modified_time: '2016-05-14T13:36:49.370+07:00'
thumbnail: https://4.bp.blogspot.com/-s5C5wk5JYDQ/VcX1QdZWrhI/AAAAAAAACs8/Kw28tJWqIzY/s1600/sailsjs.PNG
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4332880434128439754
blogger_orig_url: https://blog.duyet.net/2015/08/gioi-thieu-sailsjs-framework.html
slug: /2015/08/gioi-thieu-sailsjs-framework.html
category: Javascript
description: 'SailsJS là một framework với mong muốn tạo ra một NodeJS framework "dễ sử dụng và đầy đủ mọi thứ" như Ruby on Rails.'
fbCommentUrl: none
---

SailsJS là một framework với mong muốn tạo ra một NodeJS framework "dễ sử dụng và đầy đủ mọi thứ" như Ruby on Rails.

![](https://4.bp.blogspot.com/-s5C5wk5JYDQ/VcX1QdZWrhI/AAAAAAAACs8/Kw28tJWqIzY/s1600/sailsjs.PNG)

Xây dựng bên trên ExpressJS, SailsJS tận dụng được những điểm mạnh của framework này, đồng thời tích hợp thêm khá nhiều thứ hay ho khác như:

- Socket.io giúp đồng bộ realtime dữ liệu giữa client và server, đây cũng là điểm mạnh được đội ngũ phát triển SailsJS quảng bá nhiều nhất.
- ORM Waterline giúp bạn khai báo và quản lý database tốt hơn, đồng thời có thể chuyển qua lại giữa những loại database khác nhau: MySQL, MongoDB,...
- MVC model: Nếu dùng ExpressJS, bạn phải tự config để có được một cấu trúc source theo mô hình này, thì với SailsJS, nó đã được tích hợp sẵn.

Trang chủ: [http://sailsjs.org/](http://sailsjs.org/)
Getting Started: [http://sailsjs.org/get-started](http://sailsjs.org/get-started)

## Cài đặt ##
Cài đặt sails cực kì dễ, với 1 lệnh npm 

```
$ sudo npm -g install sails
```

Với Windows hoặc Mac thì không cần sudo

```
npm -g install sails
```

## Tạo ứng dụng đầu tiên ##
Tạo ứng dụng Sails bằng lệnh

```
$ sails new testProject
```

Tiếp theo là lệnh lift, lift có tác dụng khởi động Server

```
cd testProject
sails lift
```

Mở trình duyệt và truy cập địa chỉ: [http://localhost:1337](http://localhost:1337/)

Tiếp theo các bạn tự khám phá nhé. Mình sẽ chi tiết ở một bài viết sau.
