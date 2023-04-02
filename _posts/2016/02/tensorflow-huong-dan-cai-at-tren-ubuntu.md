---
template: post
title: Tensorflow - hướng dẫn cài đặt
date: "2016-02-05"
author: Van-Duyet Le
tags:
- Tensorflow
- Tutorial
- Install
- Python
- Google
- Machine Learning
modified_time: '2018-09-01T22:28:00.802+07:00'
thumbnail: https://3.bp.blogspot.com/-R2h5LWtXLa4/VrTTs4StSYI/AAAAAAAAPHQ/AewU2C9IqOo/s1600/logo-alt%25402x.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8134879646542065055
blogger_orig_url: https://blog.duyet.net/2016/02/tensorflow-huong-dan-cai-at-tren-ubuntu.html
slug: /2016/02/tensorflow-huong-dan-cai-at-tren-ubuntu.html
category: Machine Learning
description: Cài đặt Tensorflow
fbCommentUrl: http://blog.duyetdev.com/2016/02/tensorflow-huong-dan-cai-at-tren-ubuntu.html
---

[Tensorflow](http://tensorflow.org/) - thư viện nguồn mở Machine Learning, xử theo mô hình data flow, có nhiều bài giới thiệu về Tensorflow rồi. Ban đầu được thiết kế để nghiên cứu tại phòng lab Google Brain cho các dự án Machine Learning.

Tensorflow được viết bằng C++ và Python.  Có nhiều cách để cài đặt Tensorflow, chạy trên 1 hoặc nhiều CPU, GPU, di chuyển desktop, mobile lên server mà không cần phải code lại.

![](https://3.bp.blogspot.com/-R2h5LWtXLa4/VrTTs4StSYI/AAAAAAAAPHQ/AewU2C9IqOo/s320/logo-alt%25402x.png)

## Yêu cầu hệ thống ##

- Tensorflow hỗ trợ Python 2.7 và  Python 3.3+, do tôi dùng Ubuntu lên Python được cài đặt sẵn.
- Bản Tensorflow GPU cần cài đặt Cuda Toolkit 7.0 và cuDNN v2. Xem hướng dẫn cài [tại đây](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/g3doc/get_started/os_setup.md#optional-install-cuda-gpus-on-linux).

## Cài thông qua pip ##

Pip là trình quản lý các module của python. 

Cài pip:

```shell
# Ubuntu/Linux 64-bit
$ sudo apt-get install python-pip python-dev

# Mac OS X
$ sudo easy_install pip
```

Sau đó cài Tensorflow:

```shell
# Ubuntu/Linux 64-bit, CPU only:
$ sudo pip install --upgrade https://storage.googleapis.com/tensorflow/linux/cpu/tensorflow-0.6.0-cp27-none-linux_x86_64.whl

```

Cài bản có hỗ trợ GPU:

```
# Ubuntu/Linux 64-bit, GPU enabled:
$ sudo pip install --upgrade https://storage.googleapis.com/tensorflow/linux/gpu/tensorflow-0.6.0-cp27-none-linux_x86_64.whl

```

Cài cho Mac OS X, chỉ có bản CPU only và không hỗ trợ GPU:

```
# Mac OS X, CPU only:
$ sudo easy_install --upgrade six
$ sudo pip install --upgrade https://storage.googleapis.com/tensorflow/mac/tensorflow-0.6.0-py2-none-any.whl
```

## Kiểm tra cài đặt ##
Kiểm tra xem Tensorflow đã được cài đặt thành công hay chưa. Mở terminal và gõ thử các lệnh python sau. Nếu báo lỗi tức là cài đặt không thành công.

```shell
$ python
...
>>> import tensorflow as tf
>>> hello = tf.constant('Hello, TensorFlow!')
>>> sess = tf.Session()
>>> print(sess.run(hello))
Hello, TensorFlow!
>>> a = tf.constant(10)
>>> b = tf.constant(32)
>>> print(sess.run(a + b))
42
>>>
```

## Cài đặt trên Docker ##
Một cách khác cũng được khuyến khích là cài đặt trong môi trường Docker. Xem hướng dẫn tại [bài viết này](https://blog.duyet.net/2016/02/cai-dat-tensorflow-tren-docker.html).
