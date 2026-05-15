---
title: Duckling - phân tích văn bản sang dữ liệu có cấu trúc
date: '2018-02-19'
author: Duyet
tags:
  - Data Engineering
  - Open Source
  - Machine Learning
  - NLP
modified_time: '2018-09-10T17:20:37.168+07:00'
thumbnail: https://1.bp.blogspot.com/-EDgp745KklY/WopyCVizV7I/AAAAAAAAqbc/-xBWh3Ve4xg9DQGDY8YMbLiB688d-zXagCK4BGAYYCw/s1600/carbon_duckling.png
slug: /2018/02/duckling-phan-tich-van-ban-sang-du-lieu-co-cau-truc
category: Machine Learning
description: Duckling là một thư viện của Haskell, phát triển bởi Facebook, rất hay để phân tích (parses) dữ liệu text sang dạng có cấu trúc (structured data). Công cụ này rất hữu ích trong các ứng dụng phân tích văn bản trong NLP và nhất là lĩnh vực chatbot.
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

| Dimension | Example input | Example value output |
| --- | --- | --- |
| `AmountOfMoney` | `"42€"` | `{"value":42,"type":"value","unit":"EUR"}` |
| `Distance` | `"6 miles"` | `{"value":6,"type":"value","unit":"mile"}` |
| `Duration` | `"3 mins"` | `{"value":3,"minute":3,"unit":"minute","normalized":{"value":180,"unit":"second"}}` |
| `Email` | `"duckling-team@fb.com"` | `{"value":"duckling-team@fb.com"}` |
| `Numeral` | `"eighty eight"` | `{"value":88,"type":"value"}` |
| `Ordinal` | `"33rd"` | `{"value":33,"type":"value"}` |
| `PhoneNumber` | `"+1 (650) 123-4567"` | `{"value":"(+1) 6501234567"}` |
| `Quantity` | `"3 cups of sugar"` | `{"value":3,"type":"value","product":"sugar","unit":"cup"}` |
| `Temperature` | `"80F"` | `{"value":80,"type":"value","unit":"fahrenheit"}` |
| `Time` | `"today at 9am"` | `{"value":"2016-12-14T09:00:00.000-08:00","grain":"hour","type":"value"}` |
| `Url` | `"https://api.wit.ai/message?q=hi"` | `{"value":"https://api.wit.ai/message?q=hi","domain":"api.wit.ai"}` |
| `Volume` | `"4 gallons"` | `{"value":4,"type":"value","unit":"gallon"}` |

## Kết

Xem thêm các hướng dẫn và cách mở rộng Duckling tại trang Github của project nhé.
