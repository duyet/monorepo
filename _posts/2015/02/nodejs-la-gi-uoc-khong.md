---
template: post
title: Nodejs - Là gì? Ăn được không?
date: "2015-02-14"
author: Van-Duyet Le
category: Javascript
tags:
- Nodejs
modified_time: '2015-02-14T12:21:19.667+07:00'
thumbnail: https://3.bp.blogspot.com/-eakdJK4WfIo/VN7Z1vHx60I/AAAAAAAACF4/8w2BtYeO9zE/s1600/2014_12_13_3ea77.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6977592353211554543
blogger_orig_url: https://blog.duyet.net/2015/02/nodejs-la-gi-uoc-khong.html
slug: /2015/02/nodejs-la-gi-uoc-khong.html
description: Node.js là 1 nền tảng (platform) chạy trên môi trường V8 Javascript runtime. Node.js cho phép lập trình viên xây dựng các ứng dụng có tính mở rộng cao sử dụng Javascript trên server. Và vì được porting từ C nên về mặt tốc độ xử lý thì khá nhanh.
fbCommentUrl: none

---

Node.js là 1 nền tảng (platform) chạy trên môi trường V8 Javascript runtime. Node.js cho phép lập trình viên xây dựng các ứng dụng có tính mở rộng cao sử dụng Javascript trên server. Và vì được porting từ C nên về mặt tốc độ xử lý thì khá nhanh.

## Nodejs không ăn được, nhưng khá ngon  ##

![](https://3.bp.blogspot.com/-eakdJK4WfIo/VN7Z1vHx60I/AAAAAAAACF4/8w2BtYeO9zE/s1600/2014_12_13_3ea77.png)

## Nó có thể làm được gì? ##

- Xây dựng websocket server (Chat server)
- Ứng dụng upload file rất nhanh trên client
- Ad server
- Hoặc bất kỳ ứng dụng dữ liệu thời gian thực nào.

## Nó không phải là: ##

- Một web framework
- Không dành cho người mới bắt đầu
- Không phải là một nền tảng thực thi các tác vụ đa luồng

**Block code và Non-block code**

Ví dụ xây dựng chức năng đọc file và in ra dữ liệu của file.
Logic Block code

- Đọc file từ Filesystem, gán dữ liệu tương ứng với biến "contents"
- In dữ liệu biến "content"
- Thực hiện công việc khác tiếp theo.

Non-block code:

- Đọc file từ Filesystem
- Sau khi đọc xong thì in dữ liệu (callback)
- Thực hiện công việc khác tiếp theo.

Code

```js
var contents = fs.readFileSync('hello.txt'); // Dừng cho đến khi đọc xong file.
console.log(contents);
console.log('Thực hiện công việc khác');

```

Non-block code 

```js
fs.readFile('hello.txt', function(contents){
   console.log(contents);
});
console.log('Thực hiện công việc khác');

```

![](https://3.bp.blogspot.com/-CT29L75IKnU/VN7aqky1RfI/AAAAAAAACGA/z0USNE7jng4/s1600/2014_12_13_7f780.png)

Ta có thể thấy ở đây, tốc độ xử lý của non-block code là cao hơn so với block code. Giả sử bạn thực hiện công việc trên ở 2 file trở lên thì tốc dộ xử lý của Non-block code sẽ nhanh hơn Block code rất nhiều. Hãy tự trải nghiệm :)

## Ứng dụng đầu tiên 

```js
var http = require('http'); // đây là cách chúng ta require các modules
http.createServer(function(request, response){
    response.writeHead(200, {'Content-Type':'text/plain'}); // Status code và content type
    response.write("Xin chào lập trình viên!"); // Thông điệp được gửi xuống client.
    response.end(); // Đóng kết nối
}).listen(3000); // Chờ kết nối ở cổng 3000.
console.log("Server đang chờ kết nối tại cổng 3000");
```

Chạy server: `node hello` hoặc `node hello.js` --> Server đang chờ kết nối tại cổng `3000`

Mở trình duyệt và truy cập tới địa chỉ http://localhost:3000 hoặc dùng terminal:

```shell
$ curl http://localhost:3000
```

 --> Xin chào lập trình viên
