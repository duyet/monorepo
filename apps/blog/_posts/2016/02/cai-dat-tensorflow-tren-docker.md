---
title: Tensorflow - cài đặt trên Docker
date: '2016-02-05'
author: Duyet
tags:
  - Tensorflow
  - Docker
  - Machine Learning
  - Tutorial
modified_time: '2025-11-09T00:00:00.000+07:00'
thumbnail: https://2.bp.blogspot.com/-ALrzO2lz1Hk/VrTSHtGlC8I/AAAAAAAAPHE/ZFPNvhh_PPA/s1600/CYJ-8P4WkAQtAqp.png
slug: /2016/02/cai-dat-tensorflow-tren-docker.html
category: Machine Learning
description: Docker luôn là giải pháp đóng gói và triển khai các ứng dụng 1 cách nhanh chóng và an toàn. Sau mình xin hướng dẫn các cài đặt Tensorflow trong môi trường container của Docker.
---

Docker luôn là giải pháp đóng gói và triển khai các ứng dụng 1 cách nhanh chóng và an toàn. Sau mình xin hướng dẫn các cài đặt Tensorflow trong môi trường container của Docker.

![](https://2.bp.blogspot.com/-ALrzO2lz1Hk/VrTSHtGlC8I/AAAAAAAAPHE/ZFPNvhh_PPA/s400/CYJ-8P4WkAQtAqp.png)

## Cài đặt Docker

Mình sử dụng Ubuntu 15.10, bạn có thể xem cách cài đặt Docker cho từng loại hệ điều hành tren trang của Docker: [https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/)

## Launch a Docker

Google/TensorFlow cung cấp các bản Docker của Tensorflow trên Docker Hub:

- `tensorflow/tensorflow:latest`: TensorFlow CPU binary image (Python 3).
- `tensorflow/tensorflow:latest-devel`: CPU Binary image plus source code.
- `tensorflow/tensorflow:latest-gpu`: TensorFlow GPU binary image (requires NVIDIA Docker).
- `tensorflow/tensorflow:latest-devel-gpu`: GPU Binary image plus source code.

Lựa chọn bản Docker phù hợp với nhu cầu sử dụng.

Sau khi cài đặt và khởi động Docker container. Chạy lệnh sau để tự động cài đặt môi trường Tensorflow:

```bash
$ docker run -it tensorflow/tensorflow:latest
```

Để chạy Jupyter notebook từ trong container, thêm port mapping:

```bash
$ docker run -it -p 8888:8888 tensorflow/tensorflow:latest
```

Nếu sử dụng Tensorflow có hỗ trợ GPU, cần phải cài đặt NVIDIA Docker runtime trước. Sau đó, chạy lệnh sau:

```bash
$ docker run -it --gpus all tensorflow/tensorflow:latest-gpu
```

Lưu ý: GPU support yêu cầu:
- NVIDIA Docker runtime được cài đặt
- NVIDIA GPU driver tương thích
- CUDA toolkit tương ứng với phiên bản TensorFlow

## Kiểm tra cài đặt

Vui lòng xem phần kiểm tra cài đặt trong [bài viết sau](https://blog.duyet.net/2016/02/tensorflow-huong-dan-cai-at-tren-ubuntu.html).

## Cập nhật cho 2025: Các phương pháp hiện đại

Bài viết này được viết năm 2016. Dưới đây là những cập nhật quan trọng để sử dụng TensorFlow trên Docker trong 2025:

### TensorFlow 2.x vs 1.x
- Bài viết gốc sử dụng TensorFlow 0.6.0 (rất cũ)
- TensorFlow 2.x đã là tiêu chuẩn kể từ 2019
- API đã thay đổi đáng kể, hãy sử dụng tài liệu tại [tensorflow.org](https://tensorflow.org)

### Docker Compose cho setup phức tạp
Thay vì chạy Docker commands trực tiếp, sử dụng Docker Compose cho các project lớn:

```yaml
version: '3.8'
services:
  tensorflow:
    image: tensorflow/tensorflow:latest
    ports:
      - "8888:8888"  # Jupyter notebook
    volumes:
      - ./data:/workspace/data
      - ./notebooks:/workspace/notebooks
    working_dir: /workspace
```

### Python phiên bản
- TensorFlow 2.x yêu cầu Python 3.8+
- Python 2.7 không còn được hỗ trợ

### Lựa chọn thay thế
- **JAX**: Framework ML hiện đại hơn, cũng hỗ trợ Docker
- **PyTorch**: Có ecosystem Docker mạnh mẽ
- **Kubernetes**: Dành cho scale lớn thay vì Docker đơn lẻ

Tài liệu chính thức TensorFlow Docker: [https://hub.docker.com/r/tensorflow/tensorflow](https://hub.docker.com/r/tensorflow/tensorflow)
