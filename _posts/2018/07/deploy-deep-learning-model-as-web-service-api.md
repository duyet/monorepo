---
template: post
title: Deploy Deep Learning model as a web service API
date: "2018-07-21"
author: Van-Duyet Le
category: Machine Learning
tags:
- Data Engineer
- Redis
- Python
- Flask
- Keras
- Data Science
- Machine Learning
modified_time: '2018-10-31T23:23:57.689+07:00'
thumbnail: https://3.bp.blogspot.com/-msPb3Y2WcN8/W9nW7gASaMI/AAAAAAAA04w/P9xEh3pGAN8pRsJmaTgFHqssjUToQHo3wCLcBGAs/s1080/deep-learning-web-app.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5279585737995825038
blogger_orig_url: https://blog.duyet.net/2018/07/deploy-deep-learning-model-as-web-service-api.html
slug: /2018/07/deploy-deep-learning-model-as-web-service-api.html
draft: false
description: Trong bài này mình sẽ hướng dẫn deploy 1 model Deep learning, cụ thể là Keras dưới dạng một web service API. Sử dụng Flask framework python và Redis server như một Messeage Queue.

---


Trong bài này mình sẽ hướng dẫn deploy 1 model Deep learning, cụ thể là Keras dưới dạng một web service API. Sử dụng Flask framework python và Redis server như một Messeage Queue. Cấu trúc hệ thống sẽ như sau:


![](https://3.bp.blogspot.com/-msPb3Y2WcN8/W9nW7gASaMI/AAAAAAAA04w/P9xEh3pGAN8pRsJmaTgFHqssjUToQHo3wCLcBGAs/s640/deep-learning-web-app.png)


<!-- more -->

Mã nguồn trong bài viết này các bạn xem tại đây: [https://github.com/duyet/deep-learning-web-app](https://github.com/duyet/deep-learning-web-app)

Như hình trên, chúng ta sẽ có một server.py và một worker.py

1. server.py sử dụng flask làm API, nhận POST request từ client là một tấm ảnh, sau đó chuyển ảnh đó thành base64, generate ID cho ảnh và đẩy vào queue trong Redis.
server cũng sẽ đợi một giá trị trong redis, có KEY=<ID của ảnh> 
2. worker.py check redis queue liên tục, lấy ảnh ra và decode file ảnh, làm input cho model Keras. Kết quả của model predict() sẽ được push ngược lại redis, KEY=<ID của ảnh>, VALUE=<predict output>. Đồng thời xóa ảnh khỏi redis queue.
3. server.py lúc này đã tìm được giá trị cho KEY=<ID của ảnh>, trả kết quả về cho client.

Bạn có thể cài đặt như hướng dẫn trong Github.

#### 1. Cài redis-server
Trong Ubuntu, sử dụng lệnh:

```shell
sudo apt-get install -y redis redis-server
```

Kiểm tra redis server:

```bash
$ redis-cli ping
PONG
```

#### 2. Tạo môi trường ảo và cài đặt các thư viện:

```shell
virtualenv venv                   # create virtual environment folder
source ./venv/bin/activate        # activate env
pip install -r requirements.txt   # install packages
```

#### 3. Run worker.py

```shell
python worker.py
```

#### 4. Mở terminal khác, khởi động server.py

```shell
python server.py
```

#### 5. Sử dụng Postman hoặc cURL để test:

```shell
curl -X POST http://localhost:5000/predict \
        -F 'image=@file.png'
```

Kết quả sẽ có dạng như sau:

```json
{
    "predictions": [
        {
            "label": "web_site",
            "probability": 0.8858472108840942
        },
        {
            "label": "bow_tie",
            "probability": 0.06905359774827957
        },
        {
            "label": "laptop",
            "probability": 0.015353902243077755
        },
        {
            "label": "monitor",
            "probability": 0.005411265417933464
        },
        {
            "label": "notebook",
            "probability": 0.0035434039309620857
        }
    ],
    "success": true
}
```

Server.py nhận được request là tấm ảnh, tiền xử lý và encode base64, generate ra ID của ảnh dưới dạng UUID4, dòng 61-65 khung màu xanh.

[![](https://2.bp.blogspot.com/-VcF18CjXrN8/W1IT6IMiVnI/AAAAAAAAxZk/KoVMaBpI2kIpH9wMZR2yyY6Ua0kZKhLOgCLcBGAs/s1600/p2.PNG)](https://github.com/duyet/deep-learning-web-app/blob/master/server.py#L62-L65)

[https://github.com/duyet/deep-learning-web-app/blob/master/server.py#L62-L65](https://github.com/duyet/deep-learning-web-app/blob/master/server.py#L62-L65)

Khung màu cam: Sau khi push vào queue, server sẽ đợi để load kết quả JSON trong redis, `KEY=<ID của ảnh>`. Sau đó trả kết quả về client.

Trong `worker.py` mình sử dụng mô hình pre-trained [ResNet50](https://keras.io/applications/#resnet50) có sẵn của Keras, là một mạng dùng để nhận dạng trong ảnh.

[![](https://2.bp.blogspot.com/-sY7FkoETCwE/W1ISXjDWZDI/AAAAAAAAxZY/fWLlDgMBsYUqbdq2P9S1S6-IPk50ZExmQCLcBGAs/s1600/p1.PNG)](https://github.com/duyet/deep-learning-web-app/blob/master/worker.py#L20)[https://github.com/duyet/deep-learning-web-app/blob/master/worker.py#L20](https://github.com/duyet/deep-learning-web-app/blob/master/worker.py#L20)


Worker sẽ load danh sách ảnh trong queue ra, theo batch (số lượng ảnh worker có thể xử lý dùng 1 lúc), với từng ảnh chúng ta decode base64 để có được ảnh gốc khung màu đỏ. Chạy `model.predict()` và lưu kết quả vào redis theo `KEY=<ID>`.

[![](https://3.bp.blogspot.com/-SggMg0bZpc0/W1IV6zx-EoI/AAAAAAAAxZw/UzLguNzjCcUoeOS-BaqK9xwlNlkl2VoMgCLcBGAs/s1600/p3.PNG)](https://github.com/duyet/deep-learning-web-app/blob/master/worker.py#L56-L57)

[https://github.com/duyet/deep-learning-web-app/blob/master/worker.py#L56-L57](https://github.com/duyet/deep-learning-web-app/blob/master/worker.py#L56-L57)

Như trên là bạn đã có thể hình dung cách deploy mô hình machine learning dưới dạng 1 API service như thế nào rồi. Kiến trúc trên thực tế sẽ có nhiều thứ phức tạp hơn cần cải tiến, ví dụ như lưu trữ ảnh trong Redis không phải là một cách hay, cơ chế để scaling nhiều worker, vv...

Hy vọng bài viết có thể giúp bạn hiểu hơn phần nào, vui lòng comment nếu có bất cứ thắc mắc nào nhé.
