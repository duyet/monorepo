---
template: post
title: Đóng gói và triển khai ứng dụng Nodejs bằng Docker
date: "2016-05-01"
author: Van-Duyet Le
tags:
- ahihi.club
- Docker image
- Nodejs
- Docker
- koa
- Dockerfile
- saveto.co
- Docker build
modified_time: '2018-09-10T17:23:15.023+07:00'
thumbnail: https://1.bp.blogspot.com/-PdJFod9lQSU/VyYyDa_nEnI/AAAAAAAAUaE/CpGySWOh_TMGvZGjYqpcSHtTft7yi7tjwCK4B/s1600/1-_MtS4HqN2srTcrSyet61DQ.jpeg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5166007528308230925
blogger_orig_url: https://blog.duyet.net/2016/05/dockerizing-nodejs.html
slug: /2016/05/dockerizing-nodejs.html
category: Linux
description: Hướng dẫn cách đóng gói và build image docker cho ứng dụng Nodejs một cách cơ bản nhất.
fbCommentUrl: none
---

[Docker ra đời](https://blog.duyet.net/2015/12/docker-la-gi-co-ban-ve-docker.html#.VyYMd4N94_M) cho giải pháp đóng gói, vận chuyển và triển khai ứng dụng hết sức nhanh chóng và đơn giản. Với Docker, các thành viên trong team (cũng như với người muốn trải nghiệm thử project) sẽ triển khai ngay được môi trường ứng dụng mà không phải mất nhiều thời gian, công việc của SysAdmin cũng nhẹ nhàng hơn.

Bài sau tôi sẽ hướng dẫn cách đóng gói và build image docker cho ứng dụng Nodejs một cách cơ bản nhất.

[![](https://1.bp.blogspot.com/-PdJFod9lQSU/VyYyDa_nEnI/AAAAAAAAUaE/CpGySWOh_TMGvZGjYqpcSHtTft7yi7tjwCK4B/s400/1-_MtS4HqN2srTcrSyet61DQ.jpeg)](https://blog.duyet.net/2016/05/dockerizing-nodejs.html)

## Cài đặt Docker ##
Tôi sử dụng Ubuntu, [xem cách cài Docker trên Ubuntu](https://blog.duyet.net/2016/05/cai-dat-docker-tren-ubuntu.html). Với các nền tảng khác, xem tại trang Guide tại trang chủ Docker ([https://docs.docker.com/engine/installation/](https://docs.docker.com/engine/installation/)).

## Chuẩn bị ứng dụng cần đóng gói ##
Bạn chuẩn bị ứng dụng Nodejs cần đóng gói và triển khai. Ở đây tôi sẽ sử dụng [source](https://github.com/saveto-co/saveto) của trang [https://saveto.co](https://saveto.co/) viết bằng [Koajs](https://blog.duyet.net/2016/04/gioi-thieu-koajs.html). Mã nguồn tải về ở đây: [https://github.com/saveto-co/saveto](https://github.com/saveto-co/saveto)

Mỗi ứng dụng viết bằng Nodejs bắt buộc đều phải có `package.json`, lưu thông tin về các gói cần thiết, nhiều thông tin khác về tên, phiên bản, ...

```
{
  "name": "quick-koa",
  "version": "1.0.0",
  "description": "Quick by Koa",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "keywords": [
    "Quick",
    "shorten",
    "link",
    "jslab",
    "duyetdev"
  ],
  "homepage": "http://saveto.co",
  "repository": "git://github.com/duyet/quick.git",
  "author": "Van-Duyet Le <me@duyet.net>",
  "license": "MIT",
  "dependencies": {
    "bcrypt-nodejs": "0.0.3",
    "co": "^4.6.0",
    ...
    "validator": "^4.8.0"
  },
  "devDependencies": {
    "nodemon": "^1.8.1"
  }
}
```

[Saveto.co](http://saveto.co/) còn có thêm `bower.json` mô tả những thư viện frontend nào sẽ được sử dụng.

## Tạo Dockerfile ##
`Dockerfile` sẽ mô tả các bước để Docker build ảnh của ứng dụng, gồm các layer nào.

```
touch Dockerfile
```

Mở file `Dockerfile` bằng Editor. Đầu tiên, cần định nghĩa ứng dụng sẽ build trên image nào. Do saveto.co yêu cầu Nodejs >= v4.0, tôi sẽ sử dụng bản Nodejs 5.11 ổn định. Danh sách các image Nodejs có [tại đây](https://hub.docker.com/_/node/).

```
FROM node:5.11
```

Maintainer mô tả về người build docker image

```
MAINTAINER Van-Duyet Le <me@duyet.net>
```

Kế tiếp, ta tạo thư mục chứa source code trong Docker container:

```
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
```

Docker Image gốc là Nodejs nên sẽ có sẵn NPM, tiếp tôi sẽ copy `package.json` vào và cài đặt các package ứng dụng yêu cầu:

```
# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
```

Sử dụng `COPY` để đưa hết source code vào container:

```
# Bundle app source
COPY . /usr/src/app
```

Cài thêm Bower và chạy Bower để cài các thư viện frontend

```
# Install and run Bower
RUN npm install -g bower
RUN bower install
```

Saveto.co mặc định chạy ở port `6969`, tôi sử dụng `EXPOSE` để mở PORT 6969 trên Container, thay `6969` bằng port ứng dụng của bạn:

```
EXPOSE 6969
```

Cuối cùng quan trọng nhất là lệnh để khởi động ứng dụng Nodejs, lệnh CMD sẽ chạy `npm start`, cũng như start `node app.js` được định nghĩa trong `package.json`

```
CMD [ "npm", "start" ]
```

Tôi được file Dockerfile hoàn chỉnh như thế này:

```
FROM node:5.11

MAINTAINER Van-Duyet Le <me@duyet.net>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install NPM
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Install and run Bower
RUN npm install -g bower
RUN bower install

EXPOSE 6969

CMD ["npm","start"]
```

## Build image  ##
Cd đến thư mục chứa Dockerfile, chạy lệnh bên dưới để build image. --tag dùng để đặt tên cho ảnh dễ nhớ, nhớ đừng bỏ xót dấu chấm ở cuối

```
$ docker build -t duyetdev/saveto .
```

[![](https://4.bp.blogspot.com/-jD52kEZB4-8/VyYuFInnraI/AAAAAAAAUZ0/-c21J642VJoPF0pHN44nNf1owMfg7F1rACLcB/s1600/Screenshot%2Bfrom%2B2016-05-01%2B23-25-04.png)](https://4.bp.blogspot.com/-jD52kEZB4-8/VyYuFInnraI/AAAAAAAAUZ0/-c21J642VJoPF0pHN44nNf1owMfg7F1rACLcB/s1600/Screenshot%2Bfrom%2B2016-05-01%2B23-25-04.png)

Sau khi build thành công, xem lại danh sách Docker image bằng:

```
root@duyetdev:~/saveto# docker images 

REPOSITORY                         TAG                 IMAGE ID            CREATED             SIZE
node                               5.11                8593e962b570        9 days ago          644.3 MB
duyetdev/saveto                    latest              5e8c25e32c8b        5 minutes ago       1.067 GB

```

## Run the image ##
Run docker image với tùy chọn -d sẽ chạy container dưới background, tùy chọn -p sẽ mapping port của máy thật (public) với port của container (private)

```
root@duyetdev:~/saveto# docker run -p 6969:6969 -d duyetdev/saveto
62cd21863c2fce3a1e9076d07c68fb32c0172d37c5fb9f2ea536a16a12fa527b
```

62cd21863c2fce3a1e9076d07c68fb32c0172d37c5fb9f2ea536a16a12fa527b là ID của container. 
Xem danh sách các container và log đang chạy:

```
# Get container ID
$ docker ps

# Print app output
$ docker logs <container id>

```

Nếu cần truy cập vào container đang chạy, sử dụng:

```
# Enter the container
$ docker exec -it <container id> /bin/bash
```

Test: truy cập thử ứng dụng bằng trình duyệt: [http://localhost:6969](http://localhost:6969/)

![](https://4.bp.blogspot.com/-lBI9EPH-ck4/VyYy72_trTI/AAAAAAAAUaM/O8qnBPlgyv4oWGDEqs2O5zXiE6aRIfmHwCLcB/s1600/Screenshot%2Bfrom%2B2016-05-01%2B23-45-24.png)

Chúc bạn thành công.

## Tham khảo thêm ##

- [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Docker là gì? Cơ bản về Docker](https://blog.duyet.net/2015/12/docker-la-gi-co-ban-ve-docker.html#.VyYMd4N94_M)
- [Cài đặt Docker trên Ubuntu](https://blog.duyet.net/2016/05/cai-dat-docker-tren-ubuntu.html)

(Ảnh: Airpair)
