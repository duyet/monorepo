---
template: post
title: MongoDB - Cách thiết lập để App Server kết nối đến MongoDb Server
date: "2015-04-09"
author: Van-Duyet Le
tags:
- Linux
- MongoDb
- Server
- Ubuntu
modified_time: '2016-02-03T13:05:06.878+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1137075654557312195
blogger_orig_url: https://blog.duyet.net/2015/04/mongodb-cach-thiet-lap-e-app-server-ket.html
slug: /2015/04/mongodb-cach-thiet-lap-e-app-server-ket.html
category: Data
description: "Thông thường, chúng ta thường thiết lập để Code và phần Database chung 1 server. Với những ứng dụng lớn để quản lý, chúng ta phải tách riêng biệt chúng trên nhiều server khác nhau.
Bởi vì mặc định MongoDb không cho phép remote connections mà chỉ cho phép kết nối nội bộ. Mình sẽ hướng dẫn cách thiết lập sao cho từ App Server (server chứa code) kết nối được tới MongoDb Server (hoặc cụm MongoDb Server)"

---

Thông thường, chúng ta thường thiết lập để Code và phần Database chung 1 server. Với những ứng dụng lớn để quản lý, chúng ta phải tách riêng biệt chúng trên nhiều server khác nhau.
Bởi vì mặc định MongoDb không cho phép remote connections mà chỉ cho phép kết nối nội bộ. Mình sẽ hướng dẫn cách thiết lập sao cho từ App Server (server chứa code) kết nối được tới MongoDb Server (hoặc cụm MongoDb Server)

Thông tin cấu hình của môi trường test:

1. MongoDB Server

- Private IP – 192.168.161.100
- Public IP – 45.56.65.100
- MongoDB 2.6.3, port 27017
- IpTables Firewall

2. Application Server (Same LAN network)

- Private IP – 192.168.161.200
- Public IP – irrelevant

3. Developers at home (Different LAN network, WAN)

- Public IP – 10.0.0.1

## 1. Bind IP ##

Mở `/etc/mongod.conf` tìm đến dòng bind_ip

```
$ vim /etc/mongod.conf

# /etc/mongod.conf

# Listen to local interface only. Comment out to listen on all interfaces.
bind_ip = 127.0.0.1
```

Mặc định MongoDb chỉ cho phép kết nối từ nội bộ (127.0.0.1), nên nhiệm vụ của bạn là sửa đổi thông tin này, 1 số trường hợp như sau: 

### 1. listen on all interfaces ###

Nếu bạn chẳng cần quan tâm cái quái gì là bảo mật, thì xóa dòng `bind_ip = 127.0.0.1` đi, hoặc sửa thành `bind_ip = 0.0.0.0`

```
# Listen to local interface only. Comment out to listen on all interfaces.
# bind_ip = 127.0.0.1
```

### 2. Chỉ cho phép kết nối từ mạng nội bộ (LAN) ###

```
$ vim /etc/mongod.conf

# /etc/mongod.conf

# Listen to local and LAN interfaces.
bind_ip = 127.0.0.1,192.168.161.100
```

Nhớ là đặt IP Private, không phải IP Public của App Server nha 

### 3. Cho phép kết nối từ bất cứ IP nào ###

Trường hợp server đặt tại công ty, bạn muốn máy ở nhà kết nối đến để sử dụng. Bạn có thể kết nối đến MongoDb thông qua địa chỉ Public IP 45.56.65.100

```
$ vim /etc/mongod.conf

# /etc/mongod.conf

# Listen to local, LAN and Public interfaces.
bind_ip = 127.0.0.1,192.168.161.100,45.56.65.100
```

Mình khuyên là nên sử dụng một mạng riêng ảo VPN để đảm bảo tính bảo mật hơn cách này. 

---------------------

Khởi động lại MongoDb để thay đổi có tác dụng: 

```
$ sudo service mongod restart
[ ok ] Restarting database: mongod.
```

## 2. IpTables Firewall ##

Nếu bạn có đặt tường lửa, hãy thiết lập lại sao cho tường lửa cho phép kết nối thông qua Port của của MongoDb (mặc định là 27017)

Ở đây mình sử dụng iptables để thiết lập kết nối đến trên Ubuntu 

Cho phép mọi kết nối thông qua cổng 27017

```
iptables -A INPUT -p tcp --dport 27017 -j ACCEPT
```

Hoặc, chỉ cho phép kết nối từ 1 IP cụ thể (ở đây là IP của App Server)

```
iptables -A INPUT -s IP_HERE -p tcp --destination-port 27017 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -d IP_HERE -p tcp --source-port 27017 -m state --state ESTABLISHED -j ACCEPT
```

```

iptables -A INPUT -s 192.168.161.200 -p tcp --destination-port 27017 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -d 192.168.161.200 -p tcp --source-port 27017 -m state --state ESTABLISHED -j ACCEPT
```

Xong rồi đấy, chúc thành công :))

Xem thêm tại đây [MongoDB firewall documentation](http://docs.mongodb.org/manual/tutorial/configure-linux-iptables-firewall/)
