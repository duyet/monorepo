---
template: post
title: 'Chatbot với Botpress - Phần 1: Init Chatbot'
date: "2017-01-24"
author: Van-Duyet Le
tags:
- Nodejs
- Botpress
- Chatbot
- Node.js
- Bot
- Node
modified_time: '2017-02-03T10:29:53.696+07:00'
thumbnail: https://1.bp.blogspot.com/-E3jFFQUIYCs/WIYM0StyBTI/AAAAAAAAihE/voCjyxjUDMcfR7dIoMfX7bdbLnaoaOASQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B21-01-28.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-471777703623476548
blogger_orig_url: https://blog.duyet.net/2017/01/botpress.html
slug: /2017/01/botpress.html
category: Web
description: Botpress được ví như Wordpress for Chatbot - được viết bằng Node, cài đặt đơn giản, quản lý trên giao diện web, cơ chế lập trình module - Botpress giúp rút ngắn thời gian Dev lên rất nhiều.
fbCommentUrl: http://blog.duyetdev.com/2017/01/botpress.html 
---

Mình thấy Node.js là ngôn ngữ được sử dụng khá phổ biến để viết chatbot (Slack, Messenger, ...), nhiều Framework cho Chatbot được ra đời, trong đó mình tìm thấy Botpress cũng khá hay và dễ sử dụng, khả năng mở rộng cao.

[Botpress](https://botpress.io/?ref=duyetdev.com) được ví như Wordpress for Chatbot - được viết bằng Node, cài đặt đơn giản, quản lý trên giao diện web, cơ chế lập trình module - Botpress giúp rút ngắn thời gian Dev lên rất nhiều.

<div>
  <video autoplay="" controls="" loop="" width="100%">
    <source src="https://botpress.io/video/video_0.mp4" type="video/mp4"></source>
    Your browser does not support HTML5 video.
  </video>
</div>


- Trang chủ: [https://botpress.io](https://botpress.io/)
- Xem phần 2: [Chatbot với Botpress - Phần 2: Coding](https://blog.duyet.net/2017/01/botpress-p2.html#.WJP5EhJ97_g)

## Cài đặt và init Bot ##
Sử dụng NPM để cài đặt botpress bằng lệnh:

```
$ sudo npm install -g botpress
```

Tạo thư mục bot

```
mkdir ahihi-bot && cd ahihi-bot
botpress init
```

[![](https://1.bp.blogspot.com/-E3jFFQUIYCs/WIYM0StyBTI/AAAAAAAAihE/voCjyxjUDMcfR7dIoMfX7bdbLnaoaOASQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B21-01-28.png)](https://1.bp.blogspot.com/-E3jFFQUIYCs/WIYM0StyBTI/AAAAAAAAihE/voCjyxjUDMcfR7dIoMfX7bdbLnaoaOASQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B21-01-28.png)

Khởi động UI bằng lệnh `$ botpress start`

[![](https://4.bp.blogspot.com/--N0pR5TcpI4/WIYgVGrHLCI/AAAAAAAAihU/gdwjMsbsx2c5LyHLYFn9Wp6JZN2tDeSIgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B22-23-38.png)](https://4.bp.blogspot.com/--N0pR5TcpI4/WIYgVGrHLCI/AAAAAAAAihU/gdwjMsbsx2c5LyHLYFn9Wp6JZN2tDeSIgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B22-23-38.png)

Ở đây chứa nhiều thông tin về con bot của mình, hiện tại bot chưa có gì cả. Có 2 cách để thêm chức năng:

1. Cài đặt và cấu hình module.
2. Code :) 

Bên dưới dashboard còn hiển thị 1 số module mà có thể "lắp" được vào bot. Bấm Install để cài đặt  và cấu hình.

## Kết nối với Messenger ##
Bây giờ mình muốn Ahihi Bot có thể chat và tương tác trên Messenger, mình tiến hành kết nối sử dụng module botpress-messenger.

Có 2 cách cài, 1 là dùng NPM chạy lệnh sau, sau đó khởi động lại UI:

```
npm install --save botpress-messenger
```

Mình sử dụng cách thứ 2 là chọn cài trực tiếp từ Dashboard UI. Tìm và chọn Install botpress-messenger.

[![](https://1.bp.blogspot.com/-M4qO1VGsQug/WIYnN9tdP0I/AAAAAAAAih0/vSRnvehsR74NymJkah4zNkAeOo-7vKvVwCK4B/s1600/Untitled%2Bdrawing%2B%25283%2529.png)](https://1.bp.blogspot.com/-M4qO1VGsQug/WIYnN9tdP0I/AAAAAAAAih0/vSRnvehsR74NymJkah4zNkAeOo-7vKvVwCK4B/s1600/Untitled%2Bdrawing%2B%25283%2529.png)
Sau khi cài đặt thành công, mục Messenger xuất hiện bên cột menu trái như thế này:

[![](https://1.bp.blogspot.com/-ZkaxhY2dQ5Y/WIYpKEZQcbI/AAAAAAAAih8/i-d53OmXtWgX_sh8zHjmcmR73Eyw19b8wCLcB/s1600/Untitled%2Bdrawing%2B%25284%2529.png)](https://1.bp.blogspot.com/-ZkaxhY2dQ5Y/WIYpKEZQcbI/AAAAAAAAih8/i-d53OmXtWgX_sh8zHjmcmR73Eyw19b8wCLcB/s1600/Untitled%2Bdrawing%2B%25284%2529.png)

Sau đó chúng ta cần tạo Fanpage và cấu hình Messenger:

[![](https://4.bp.blogspot.com/-iRUJd2KTFPw/WIYpf7mPwDI/AAAAAAAAiiA/C70RgIQmNb0WTQ6SYJOoYuFHPjxKCgX4gCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-03-39.png)](https://4.bp.blogspot.com/-iRUJd2KTFPw/WIYpf7mPwDI/AAAAAAAAiiA/C70RgIQmNb0WTQ6SYJOoYuFHPjxKCgX4gCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-03-39.png)

Fanpage bạn tự tìm cách tạo, khá dễ.
Để tạo App cho Bot, truy cập vào Facebook Developer để tạo FB App mới: [https://developers.facebook.com/](https://developers.facebook.com/)

[![](https://3.bp.blogspot.com/-fHZ4dUl8F-8/WIYqJ4Ij7HI/AAAAAAAAiiI/6LcCzSVdnzsDbOhMlVjcGMmejIZFCJ-TwCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-06-38.png)](https://3.bp.blogspot.com/-fHZ4dUl8F-8/WIYqJ4Ij7HI/AAAAAAAAiiI/6LcCzSVdnzsDbOhMlVjcGMmejIZFCJ-TwCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-06-38.png)

Copy App ID và App Secret. Tiếp tục vào mục Messenger (cột trái), chọn Page để lấy Access Token:

[![](https://4.bp.blogspot.com/-Tqat_6j0XwM/WIYrs9mVlwI/AAAAAAAAiiU/EFTdreiGffEsrnadbyeDgDEchj6qpz-BQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-13-26.png)](https://4.bp.blogspot.com/-Tqat_6j0XwM/WIYrs9mVlwI/AAAAAAAAiiU/EFTdreiGffEsrnadbyeDgDEchj6qpz-BQCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-13-26.png)

Code trên Local chúng ta sử dụng ngrok, tick vào mục Use ngrok. 

## Save & Connect ##

[![](https://4.bp.blogspot.com/-brOoSCiXfSw/WIYtHtM77bI/AAAAAAAAiic/YQQOX7gEBosWiovhV2qjZg117CMWhqDqQCLcB/s1600/Untitled%2Bdrawing%2B%25285%2529.png)](https://4.bp.blogspot.com/-brOoSCiXfSw/WIYtHtM77bI/AAAAAAAAiic/YQQOX7gEBosWiovhV2qjZg117CMWhqDqQCLcB/s1600/Untitled%2Bdrawing%2B%25285%2529.png)

Bên dưới là một số mục tùy chọn:

[![](https://1.bp.blogspot.com/-GEau4JQ4e_M/WIYt_N6YjgI/AAAAAAAAiig/MIhlD2cVWqg0wLSDVtOV9U17pJ2zpn-LgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-22-43.png)](https://1.bp.blogspot.com/-GEau4JQ4e_M/WIYt_N6YjgI/AAAAAAAAiig/MIhlD2cVWqg0wLSDVtOV9U17pJ2zpn-LgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B23-22-43.png)

- Display Get Started: hiển thị nút Get Started khi mới chat với bot lần đầu tiên. Mình sẽ tìm hiểu thêm ở ví dụ sau.
- Auto respond to GET_STARTED postback: Tự động trả lời khi người dùng bấm vào chữ Get Started ở trên.
- Auto response: Nội dung Auto response
- Greeting text: Nội dung chào.
- Persistent menu: Menu điều hướng trong Messenger. Có 2 dạng:

- Postback: một Postback sẽ gọi ra 1 hàm tương ứng. 
- URL.

Sau khi thiết lập sơ sơ, lưu lại và vào messenger chat thử, mình sẽ giải thích các tùy chọn ở trên như sau:

[![](https://2.bp.blogspot.com/-h7Zf7KRzyLQ/WIYy3MByfnI/AAAAAAAAii0/T50EcqbGBw8K0eAh43Q25sTJQzocT2VYQCLcB/s1600/ahihi-options-chatbot.png)](https://2.bp.blogspot.com/-h7Zf7KRzyLQ/WIYy3MByfnI/AAAAAAAAii0/T50EcqbGBw8K0eAh43Q25sTJQzocT2VYQCLcB/s1600/ahihi-options-chatbot.png)

## Test bot ##

Kiểm tra Bot có hoạt động hay không, mở Messenger và chat thử "BOT_LICENSE"

Something like:

[![](https://4.bp.blogspot.com/-30_3xgRxw24/WIaw0JOX1bI/AAAAAAAAikc/lHaxnvPdIWQ6eARB_VZP0NOFxLEPwIo_gCK4B/s640/Screenshot_2017-01-24-08-38-43-824_com.facebook.orca.png)](https://4.bp.blogspot.com/-30_3xgRxw24/WIaw0JOX1bI/AAAAAAAAikc/lHaxnvPdIWQ6eARB_VZP0NOFxLEPwIo_gCK4B/s1600/Screenshot_2017-01-24-08-38-43-824_com.facebook.orca.png)

## botpress-analytics ##

Ở trên là bạn đã có 1 con bot sơ sơ rồi, ở phần sau mình mới bắt đầu code, mình giới thiệu luôn 1 số module hay. Botpress Analytics thống kê Bot usage ngay trên Dashboard, với giao diện biểu đồ trực quan.

[![](https://3.bp.blogspot.com/-tTYYLFM0zYA/WIY00M0mSyI/AAAAAAAAijE/9Y3q9G7F_g8DcxBY0A6L5oHTYXqLvsgaACK4B/s640/%255Bahihi-bot%255D%2Banalytics.png)](https://3.bp.blogspot.com/-tTYYLFM0zYA/WIY00M0mSyI/AAAAAAAAijE/9Y3q9G7F_g8DcxBY0A6L5oHTYXqLvsgaACK4B/s1600/%255Bahihi-bot%255D%2Banalytics.png)

Giao diện Analytics dashboard

[![](https://2.bp.blogspot.com/-0b3zg0i4HOI/WIY3KvyvXVI/AAAAAAAAijU/zlfRFTWIKJIdWKkDkmvJNVLc464wcs_LACK4B/s640/%255Bahihi-bot%255D%2Bbotpress-analytics-dashboard%2B%25283%2529.png)](https://2.bp.blogspot.com/-0b3zg0i4HOI/WIY3KvyvXVI/AAAAAAAAijU/zlfRFTWIKJIdWKkDkmvJNVLc464wcs_LACK4B/s1600/%255Bahihi-bot%255D%2Bbotpress-analytics-dashboard%2B%25283%2529.png)

[![](https://2.bp.blogspot.com/-6sixXbkvC_0/WIY3dShgPYI/AAAAAAAAijc/VWtGDUN3Bdo7eK8N4XwLmbzISTNxqXyOACK4B/s1600/%255Bahihi-bot%255D%2Bbotpress-analytics-dashboard%2B%25284%2529.png)](https://2.bp.blogspot.com/-6sixXbkvC_0/WIY3dShgPYI/AAAAAAAAijc/VWtGDUN3Bdo7eK8N4XwLmbzISTNxqXyOACK4B/s1600/%255Bahihi-bot%255D%2Bbotpress-analytics-dashboard%2B%25284%2529.png)

## Tham khảo ##

- Github - [https://github.com/botpress/botpress](https://github.com/botpress/botpress)
- Botpress - Documentation: [https://docs.botpress.io](https://docs.botpress.io/)
- [Botpress Messenger - Get started](https://github.com/botpress/botpress-messenger#get-started)

## Kết  ##

Botpress khá là hay, giúp ta tạo được bot trong thời gian ngắn, tích hợp được nhiều chức năng và nhiều platform. 

Ở bài tiếp theo mình sẽ focus vào Messenger Chatbot, lập trình để Bot có thể thông minh, phản hồi được tin nhắn từ người dùng, nhận và gửi hình ảnh, hiển thị Response dạng Menu chọn, Profile Lookup, ... 

Chúc bạn thành công, mọi thắc mắc vui lòng comment tại bên dưới.

Xem tiếp phần 2: [Chatbot với Botpress - Phần 2: Coding](https://blog.duyet.net/2017/01/botpress-p2.html#.WJP5EhJ97_g)
