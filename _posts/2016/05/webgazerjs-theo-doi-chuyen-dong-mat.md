---
template: post
title: WebGazer.js - theo dõi chuyển động mắt của người dùng trên Website
date: "2016-05-29"
author: Van-Duyet Le
tags:
- intro-js
- Tutorials
- Javascript
- Machine Learning
- WebGazer.js
modified_time: '2017-08-06T11:41:14.293+07:00'
thumbnail: https://1.bp.blogspot.com/-U2FpDKE-uPY/V0qHwxldpOI/AAAAAAAAWK4/Qq3E3Z0I-M8Z8F_slgkZCDtvp5x67oGkQCK4B/s1600/Screenshot%2Bfrom%2B2016-05-29%2B13-09-23.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3232393619485176934
blogger_orig_url: https://blog.duyet.net/2016/05/webgazerjs-theo-doi-chuyen-dong-mat.html
slug: /2016/05/webgazerjs-theo-doi-chuyen-dong-mat.html
category: Javascript
description: WebGazer.js là thư viện viết bằng Javascript, theo dõi mắt người dùng, xác định điểm trên màn hình mà người dùng đang chú ý đến. Thư viện xử lý real-time, chạy trực tiếp trên trình duyệt, sử dụng webcam để nhận diện và không cần phải gửi video về server.
fbCommentUrl: none
---

WebGazer.js là thư viện viết bằng Javascript, theo dõi mắt người dùng, xác định điểm trên màn hình mà người dùng đang chú ý đến. Thư viện xử lý real-time, chạy trực tiếp trên trình duyệt, sử dụng webcam để nhận diện và không cần phải gửi video về server.

![](https://1.bp.blogspot.com/-U2FpDKE-uPY/V0qHwxldpOI/AAAAAAAAWK4/Qq3E3Z0I-M8Z8F_slgkZCDtvp5x67oGkQCK4B/s1600/Screenshot%2Bfrom%2B2016-05-29%2B13-09-23.png)

## Các chức năng nổi bật ##

- Tính toán Realtime trên hầu hết các trình duyệt (Chrome, Firefox, Opera, Edge).
- Không cần thiết bị chuyên dụng, chỉ cần sử dụng Webcams.
- Tự training (huấn luyện), điều chỉnh bằng cách click và di chuyển chuột.
- Tích hợp và sử dụng đơn giản.
- Dự đoán được nhiều điểm nhìn.

## Sử dụng  ##
Thêm webgazer.js vào website:

```
<script src="https://cdn.rawgit.com/brownhci/WebGazer/master/build/webgazer.js" type="text/javascript"></script>
```

webgazer.begin() cho phép bắt đầu thu thập dữ liệu để training cho mắt.

```
webgazer.setGazeListener(function(data, elapsedTime) {
    if (data == null) {
        return;
    }
    var xprediction = data.x; //these x coordinates are relative to the viewport 
    var yprediction = data.y; //these y coordinates are relative to the viewport
    console.log(elapsedTime); //elapsed time is based on time since begin was called
}).begin();

// Lấy dữ liệu prediction realtime

var prediction = webgazer.getCurrentPrediction();
if (prediction) {
    var x = prediction.x;
    var y = prediction.y;
};

```
Xem thêm hướng dẫn sử dụng chi tiết tại trang chủ: [https://webgazer.cs.brown.edu/#usage](https://webgazer.cs.brown.edu/#usage)
Hoặc ví dụ: [https://webgazer.cs.brown.edu/#examples](https://webgazer.cs.brown.edu/#examples)

- [Github](https://github.com/brownhci/WebGazer)
- [Documentation](https://webgazer.cs.brown.edu/documentation/)
- [API Docs](https://github.com/brownhci/WebGazer/wiki/Top-Level-API)

Chống chỉ định với ai bị mắt hí, mắt híp hay mắt lé!
