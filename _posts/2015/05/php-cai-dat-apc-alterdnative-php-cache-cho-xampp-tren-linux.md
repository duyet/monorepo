---
template: post
title: PHP - Cài đặt APC (Alternative PHP Cache) cho XAMPP trên Linux
date: "2015-05-16"
author: Van-Duyet Le
tags:
- XAMPP
- APC
- PHP
modified_time: '2015-05-16T00:28:34.671+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2373230749170862915
blogger_orig_url: https://blog.duyet.net/2015/05/php-cai-dat-apc-alterdnative-php-cache-cho-xampp-tren-linux.html
slug: /2015/05/php-cai-dat-apc-alterdnative-php-cache-cho-xampp-tren-linux.html
category: PHP
description: Hướng dẫn cài đặt APC (Alternative PHP Cache) cho XAMPP trên Linux
fbCommentUrl: none

---

Nếu bạn chưa cài đặt bản XAMPP Developer thì bạn có thể download tại đây: [http://www.apachefriends.org/en/xampp-linux.html](http://www.apachefriends.org/en/xampp-linux.html)

## Installing APC ##

Đầu tiên, download và giải nén APC

```shell
wget -O apc-latest.tar.gz http://pecl.php.net/get/APC
tar xvfz apc-latest.tar.gz
cd APC-*
```

Tiếp theo chạy phpize trong thư mục APC hiện tại

```
/opt/lampp/bin/phpize
```

Cấu hình (Nếu bạn dùng Linux 64 bit thì xem phần bên dưới)

```
./configure --with-php-config=/opt/lampp/bin/php-config
```

Compile và cài đặt

```
make
sudo make install
```

Cuối cùng, mở php.ini và thêm dòng extension=apc.so và khởi động lại xampp:

```
sudo sh -c "echo 'extension=apc.so' >> /opt/lampp/etc/php.ini"
sudo /opt/lampp/lampp restart
```

## Linux/Ubuntu x64 ##
XAMPP được biên dịch ở dạng 32bit, vì thế nếu bạn dùng Linux/Ubunut x64 bạn cần biên dịch APC 32 bit.

Đầu tiên cài đặt thư viện 32-bit development

```
sudo apt-get install libc6-dev-i386
```

Tiếp theo sửa dòng configure command ở trên thành

```
 ./configure --build=i686-pc-linux-gnu "CFLAGS=-m32" "CXXFLAGS=-m32" "LDFLAGS=-m32" --with-php-config=/opt/lampp/bin/php-config
```

Và cuối cùng bạn chỉ cần thực hiện tiếp tục các bước như ở trên. Chúc bạn thành công.
