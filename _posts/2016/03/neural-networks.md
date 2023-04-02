---
template: post
title: Neural networks là gì?
date: "2016-03-26"
author: Van-Duyet Le
tags:
- AI
- ML
- Deep Learning
- Artificial Intelligence
- Neural Networks
- Machine Learning
modified_time: '2016-05-02T19:39:30.826+07:00'
thumbnail: https://1.bp.blogspot.com/-IrbvGQYE780/Vvai3HWIZKI/AAAAAAAASX8/Bk--e7sYx8cmsbgq8aooy7bUKKr80wKVw/s1600/500px-Network3322.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5633443439884990056
blogger_orig_url: https://blog.duyet.net/2016/03/neural-networks.html
slug: /2016/03/neural-networks.html
category: Machine Learning
description: Neural networks là gì?
fbCommentUrl: http://blog.duyetdev.com/2016/03/neural-networks.html
---

Theo nghĩa sinh học, mạng Neural là một tập hợp các dây thần kinh kết nối với nhau. Trong [Deep learning](https://blog.duyet.net/2016/02/deep-learning-la-gi.html#.VvajANx96b8),  Neural networks để chỉ mạng Neural nhân tạo, cấu thành từ các lớp Neural.

[![](https://1.bp.blogspot.com/-IrbvGQYE780/Vvai3HWIZKI/AAAAAAAASX8/Bk--e7sYx8cmsbgq8aooy7bUKKr80wKVw/s1600/500px-Network3322.png)](https://blog.duyet.net/2016/03/neural-networks.html)
[Deep Learning](https://blog.duyet.net/2016/02/deep-learning-la-gi.html#.VvajANx96b8) được xây dựng trên cơ sở 1 mạng lưới các Neural nhân tạo, tổ chức thành từng lớp (Layer). Kết quả của mỗi lớp lại biểu diễn các thuộc tính (features) của lớp cao hơn (lớp phía sau).

Theo hình trên, các giá trị nhận được ở Layer 1, lần lượt thông qua các lớp đến lớp cuối cùng. Layer 1 gọi là Input Layer, Layer 4 là Output layer, các layer ở giữa còn lại gọi là Hidden Layer.

Theo mô hình này, các lớp cao hơn sẽ "hiểu" được các giá trị đưa vừa ở lớp sau nó.
Ví dụ, mình muốn sử dụng Deep Learning để xử lý ảnh. Layer 1 có input là các pixel của ảnh. Layer đầu tiên này được dùng để huấn luyện (training) để nhận diện các hình dáng (shapes) cơ bản của vật thể. Các layers cao hơn sử dụng các shapes của ảnh này, để "hiểu" là các shapes này dùng để biểu diễn vật gì.

Nếu ta sử dụng vài nghìn tấm ảnh các khuôn mặt, và nói với Neural networks rằng "Nè, cái mặt tao đó". Thì đây là bạn đang dạy (trainning) cho Neural networks đây là khuôn mặt của 1 ai đó. Sau quá trình dạy dỗ này, Deep Learning có thể nhận dạng ra khuôn mặt của bạn trong hầu hết bất cứ tấm ảnh nào.

![](https://3.bp.blogspot.com/-s09yeLJlwco/VvanP5YXsHI/AAAAAAAASYI/l4obeqtpYE47osQAX3RzKsETB_ZJaxedQ/s320/face_2259240b.jpg)

Nhưng các dự án Deep Learning mới nhất hiện nay không cần phải training bởi con người. Đây được gọi là học không giám sát "unsupervised learning", cho phép AI có thể tự hiểu các khái niệm mà không cần phải gán nhãn. Năm 2012, một số kỹ sư Google công bố bài báo "[Building High-level Features Using Large Scale Unsupervised Learning](http://static.googleusercontent.com/media/research.google.com/vi//archive/unsupervised_icml2012.pdf)". Họ sử dụng mạng Neural 9 layers với 1 tỷ liên kết, mạng Neural này được cho học 10 triệu ảnh 200x200pixel. Kết quả thu được 15.8% độ chính xác khi xác định 22000 loại đối tượng (mặt người, mặt mèo, tay chân, ...), mà không hề dạy cho nó biết là có gì trong ảnh. 

[![](https://4.bp.blogspot.com/-D-C2nNiovcc/VvapVS7SKnI/AAAAAAAASYU/bQQY28g_UUcGXv-TsrfUwEpqF5S4SpFkQ/s640/wallpaper-2870969.jpg)](https://4.bp.blogspot.com/-D-C2nNiovcc/VvapVS7SKnI/AAAAAAAASYU/bQQY28g_UUcGXv-TsrfUwEpqF5S4SpFkQ/s1600/wallpaper-2870969.jpg)

Hiện tại, Deep Learning đang được ứng dụng rất tốt trong việc nhận dạng giọng nói, xử lý ngôn ngữ tự nhiên, xử lý ảnh và các ứng dụng khác. 
