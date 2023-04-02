---
template: post
title: Tensorflow - cài đặt trên Docker
date: "2016-02-05"
author: Van-Duyet Le
tags:
- Tensorflow
- Docker
- Machine Learning
- Howto
modified_time: '2016-02-05T23:48:54.687+07:00'
thumbnail: https://2.bp.blogspot.com/-ALrzO2lz1Hk/VrTSHtGlC8I/AAAAAAAAPHE/ZFPNvhh_PPA/s1600/CYJ-8P4WkAQtAqp.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4129099079213361357
blogger_orig_url: https://blog.duyet.net/2016/02/cai-dat-tensorflow-tren-docker.html
slug: /2016/02/cai-dat-tensorflow-tren-docker.html
category: Machine Learning
description: Docker luôn là giải pháp đóng gói và triển khai các ứng dụng 1 cách nhanh chóng và an toàn. Sau mình xin hướng dẫn các cài đặt Tensorflow trong môi trường container của Docker.
fbCommentUrl: none
---

Docker luôn là giải pháp đóng gói và triển khai các ứng dụng 1 cách nhanh chóng và an toàn. Sau mình xin hướng dẫn các cài đặt Tensorflow trong môi trường container của Docker.

![](https://2.bp.blogspot.com/-ALrzO2lz1Hk/VrTSHtGlC8I/AAAAAAAAPHE/ZFPNvhh_PPA/s400/CYJ-8P4WkAQtAqp.png)

## Cài đặt Docker  ##
Mình sử dụng Ubuntu 15.10, bạn có thể xem cách cài đặt Docker cho từng loại hệ điều hành treentrang của Docker: [https://docs.docker.com/engine/installation/ubuntulinux/](https://docs.docker.com/engine/installation/ubuntulinux/)

## Launch a Docker ##
Google cung cấp 4 bản Docker của Tensorflow:

- b.gcr.io/tensorflow/tensorflow: TensorFlow CPU binary image.
- b.gcr.io/tensorflow/tensorflow:latest-devel: CPU Binary image plus source code.
- b.gcr.io/tensorflow/tensorflow:latest-gpu: TensorFlow GPU binary image.
- b.gcr.io/tensorflow/tensorflow:latest-devel-gpu: GPU Binary image plus source code. 

Lựa chọn bản Docker phù hợp với nhu cầu sử dụng.

Sau khi cài đặt và khởi động Docker container. Chạy lệnh sau để tự động cài đặt môi trường Tensorflow:

```
$ docker run -it b.gcr.io/tensorflow/tensorflow
```

Nếu sử dụng Tensorflow có hỗ trợ GPU, cần phải thêm các tham số để Docker thiết lập GPU, cái này hơi phức tạp, nên Google có viết sẵn 1 script [ở đây](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/tools/docker/docker_run_gpu.sh), chỉ cần tải về và sử dụng, câu lệnh sẽ là:

```
wget https://github.com/tensorflow/tensorflow/blob/master/tensorflow/tools/docker/docker_run_gpu.sh
chmod +x ./docker_run_gpu.sh
./docker_run_gpu.sh b.gcr.io/tensorflow/tensorflow:gpu
```

## Kiểm tra cài đặt ##
Vui lòng xem phần kiểm tra cài đặt trong [bài viết sau](https://blog.duyet.net/2016/02/tensorflow-huong-dan-cai-at-tren-ubuntu.html).
