---
template: post
title: Duckling - phân tích văn bản sang dữ liệu có cấu trúc
date: "2018-02-19"
author: Van-Duyet Le
tags:
- Data Engineer
- Open Source
- Chatbot
- Duckling
- NLP
- Intro-library
- Machine Learning
- facebook
- Opensource
- Haskell
modified_time: '2018-09-10T17:20:37.168+07:00'
thumbnail: https://1.bp.blogspot.com/-EDgp745KklY/WopyCVizV7I/AAAAAAAAqbc/-xBWh3Ve4xg9DQGDY8YMbLiB688d-zXagCK4BGAYYCw/s1600/carbon_duckling.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4531407208168967622
blogger_orig_url: https://blog.duyet.net/2018/02/duckling-phan-tich-van-ban-sang-du-lieu-co-cau-truc.html
slug: /2018/02/duckling-phan-tich-van-ban-sang-du-lieu-co-cau-truc.html
category: Machine Learning
description: Duckling là một thư viện của Haskell, phát triển bởi Facebook, rất hay để phân tích (parses) dữ liệu text sang dạng có cấu trúc (structured data). Công cụ này rất hữu ích trong các ứng dụng phân tích văn bản trong NLP và nhất là lĩnh vực chatbot.
fbCommentUrl: none
---
**[Duckling](https://github.com/facebook/duckling)** là một thư viện của Haskell, phát triển bởi Facebook, rất hay để phân tích (parses) dữ liệu text sang dạng có cấu trúc (structured data). Công cụ này rất hữu ích trong các ứng dụng phân tích văn bản trong NLP và nhất là lĩnh vực **chatbot**.  
[![](https://1.bp.blogspot.com/-EDgp745KklY/WopyCVizV7I/AAAAAAAAqbc/-xBWh3Ve4xg9DQGDY8YMbLiB688d-zXagCK4BGAYYCw/s1600/carbon_duckling.png)](https://1.bp.blogspot.com/-EDgp745KklY/WopyCVizV7I/AAAAAAAAqbc/-xBWh3Ve4xg9DQGDY8YMbLiB688d-zXagCK4BGAYYCw/s1600/carbon_duckling.png)  
Github: **[https://github.com/facebook/duckling](https://github.com/facebook/duckling)**  

## Sử dụng

Compile và run binary  
  

    $ stack build$ stack exec duckling-example-exe

  
Câu lệnh trên sẽ khởi tạo 1 HTTP server, để sử dụng API này, chỉ cần gửi request như sau:  
  

    $ curl -XPOST https://0.0.0.0:8000/parse --data 'locale=en_GB&text=tomorrow at eight'

  
File **exe/ExampleMain.hs** chứa các ví dụ để bạn có thể tích hợp Duckling vào các project sử dụng ngôn ngữ Haskell. Nếu project bạn không phải là Hashkell, bạn vẫn có thể sử dụng bằng cách gửi request HTTP đến server ở trên.  
  

Mình có deploy một server Duckling tại địa chỉ sau để mọi người tiện test nhanh: **[https://duyet-duckling-bkykfkyksj.now.sh](https://duyet-duckling-bkykfkyksj.now.sh/)**

## Supported dimensions

Mình thấy rằng Duckling hỗ trợ nhiều ngôn ngữ và các dimension (tiếng Việt có ở một vài dimension). Bảng sau ví dụ các dimension mà Duckling hỗ trợ:


<table class="table table-bordered table-responsive">
    <thead>
        <tr>
            <th width="20%">Dimension</th>
            <th width="20%">Example input</th>
            <th>Example value output</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>AmountOfMoney</code></td>
            <td>"42€"</td>
            <td><code>{"value":42,"type":"value","unit":"EUR"}</code></td>
        </tr>
        <tr>
            <td><code>Distance</code></td>
            <td>"6 miles"</td>
            <td><code>{"value":6,"type":"value","unit":"mile"}</code></td>
        </tr>
        <tr>
            <td><code>Duration</code></td>
            <td>"3 mins"</td>
            <td><code>{"value":3,"minute":3,"unit":"minute","normalized":{"value":180,"unit":"second"}}</code></td>
        </tr>
        <tr>
            <td><code>Email</code></td>
            <td>"<a href="mailto:duckling-team@fb.com">duckling-team@fb.com</a>"</td>
            <td><code>{"value":"duckling-team@fb.com"}</code></td>
        </tr>
        <tr>
            <td><code>Numeral</code></td>
            <td>"eighty eight"</td>
            <td><code>{"value":88,"type":"value"}</code></td>
        </tr>
        <tr>
            <td><code>Ordinal</code></td>
            <td>"33rd"</td>
            <td><code>{"value":33,"type":"value"}</code></td>
        </tr>
        <tr>
            <td><code>PhoneNumber</code></td>
            <td>"+1 (650) 123-4567"</td>
            <td><code>{"value":"(+1) 6501234567"}</code></td>
        </tr>
        <tr>
            <td><code>Quantity</code></td>
            <td>"3 cups of sugar"</td>
            <td><code>{"value":3,"type":"value","product":"sugar","unit":"cup"}</code></td>
        </tr>
        <tr>
            <td><code>Temperature</code></td>
            <td>"80F"</td>
            <td><code>{"value":80,"type":"value","unit":"fahrenheit"}</code></td>
        </tr>
        <tr>
            <td><code>Time</code></td>
            <td>"today at 9am"</td>
            <td><code>{"values":[{"value":"2016-12-14T09:00:00.000-08:00","grain":"hour","type":"value"}],"value":"2016-12-14T09:00:00.000-08:00","grain":"hour","type":"value"}</code></td>
        </tr>
        <tr>
            <td><code>Url</code></td>
            <td>"<a href="https://api.wit.ai/message?q=hi" rel="nofollow">https://api.wit.ai/message?q=hi</a>"</td>
            <td><code>{"value":"https://api.wit.ai/message?q=hi","domain":"api.wit.ai"}</code></td>
        </tr>
        <tr>
            <td><code>Volume</code></td>
            <td>"4 gallons"</td>
            <td><code>{"value":4,"type":"value","unit":"gallon"}</code></td>
        </tr>
    </tbody>
</table>

  

## Kết

Xem thêm các hướng dẫn và cách mở rộng Duckling tại trang Github của project nhé.