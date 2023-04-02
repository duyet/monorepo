---
template: post
title: Phân lớp SVM với Word2vec
date: "2018-02-25"
author: Van-Duyet Le
tags:
- SVM
- NLP
- Word2vec
- Machine Learning
modified_time: '2018-02-25T17:57:41.371+07:00'
thumbnail: https://1.bp.blogspot.com/-1c0fyuos0NM/WpKQLj0AcCI/AAAAAAAAqn8/1z5hCc1pfmYWZVbSiveudFpVxaUel6sMACLcBGAs/s1600/SVM%2Bwith%2BWord2vec%2B%2528Figure%2529.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8109075085062016307
blogger_orig_url: https://blog.duyet.net/2018/02/svm-word2vec.html
slug: /2018/02/svm-word2vec.html
category: Web
description: Trong chuỗi bài viết này mình sử sử dụng thuật toán SVM để phân lớp sentiment (cảm xúc) cho văn bản, kết hợp với ứng dụng Word2vec để biểu diễn các text dưới dạng vector.    
fbCommentUrl: http://blog.duyetdev.com/2018/02/svm-word2vec.html
---

Trong chuỗi bài viết này mình sử sử dụng thuật toán SVM để phân lớp sentiment (cảm xúc) cho văn bản, kết hợp với ứng dụng Word2vec để biểu diễn các text dưới dạng vector.    

Bằng cách sử dụng 1 tập văn bản đã được gán nhãn sẵn. Mỗi câu được vector hóa sử dụng Word2vec ([xem lại Kiều2vec](https://blog.duyet.net/2017/04/nlp-truyen-kieu-word2vec.html)). Được minh họa như hình dưới đây:

![](https://1.bp.blogspot.com/-1c0fyuos0NM/WpKQLj0AcCI/AAAAAAAAqn8/1z5hCc1pfmYWZVbSiveudFpVxaUel6sMACLcBGAs/s1600/SVM%2Bwith%2BWord2vec%2B%2528Figure%2529.png)

Các bước sẽ thực hiện:

1. Vector hóa từng câu văn bản:
    - Tách từ cho từng câu. (E.g. `"Duyệt đẹp trai quá"` ==> [ `"Duyệt"`, `"đẹp"`, `"trai"`, `"quá"` ]
    - Lọc bỏ stopwords (e.g. [ `"Duyệt"`, `"đẹp"`, `"trai"`, `"quá"` ] ==> [ `"Duyệt"`, `"đẹp"`, `"trai"` ]
    - Dùng Word2vec model (retrain) để biến mỗi từ thành 1 vector:
    ```
    "đẹp" => [0.1123, 0.234, 0.256, 0.001, ...]
    "train" => [0.542, 0.124, 0.232, 0.124, ...]
    ```
    Các vector này có số chiều cố định và giống nhau (phụ thuộc vào mô hình word2vec).
    - Cộng (hoặc trung bình) các vector của từng từ trong một câu lại, ta được vector của một câu. Cách này khá đơn giản và chỉ dùng được khi câu ngắn (như 1 đoạn tweet). Với câu dài hơn cách biểu diễn này không còn chính xác nữa. Với văn bản lớn và dài, bạn nên [sử dụng Doc2vec](https://blog.duyet.net/2017/10/doc2vec-trong-sentiment-analysis.html) thay thế.
    ```
    vec([ "Duyệt", "đẹp", "trai" ]) = [0.1123, 0.234, 0.256, 0.001, ...] + [0.542, 0.124, 0.232, 0.124, ...] + ...
    = [0.3421, 0.724, 0.242, 0.364, ...]
    ```

2. Train model SVM
3. Test accuracy

Từ các câu ở bước 1, qua mô hình ta có được mô hình phân lớp:

[![](https://2.bp.blogspot.com/-SlTjMAtF-zk/WpKQIWEFIdI/AAAAAAAAqn4/Y4VQ88EW78IRq4d2YEGUG8iYBo9gt20WwCEwYBhgL/s1600/2%2B-%2BTrain%2Bmodel.png)](https://2.bp.blogspot.com/-SlTjMAtF-zk/WpKQIWEFIdI/AAAAAAAAqn4/Y4VQ88EW78IRq4d2YEGUG8iYBo9gt20WwCEwYBhgL/s1600/2%2B-%2BTrain%2Bmodel.png)

Từ model này, ta có thể dễ dàng tìm được sentiment của các vector văn bản khác, độ chính xác model phụ thuộc vào nhiều yếu tố (số lượng văn bản training, tham số, ...), độ chính xác này có thể đo được thông qua các độ đo, bằng cách sử dụng tập văn bản test (đã biết trước nhãn) đi qua model của chúng ta.

[![](https://1.bp.blogspot.com/-og76KxK6M_4/WpKQi0bPPTI/AAAAAAAAqoA/Q6lBVXaCnSoIsySwxdNPyxIO8MUPVosRACLcBGAs/s1600/3_model_using.png)](https://1.bp.blogspot.com/-og76KxK6M_4/WpKQi0bPPTI/AAAAAAAAqoA/Q6lBVXaCnSoIsySwxdNPyxIO8MUPVosRACLcBGAs/s1600/3_model_using.png)

Đây cũng là các bước cơ bản mà mọi thuật toán Machine Learning, NLP thực hiện.
Mình sẽ cập nhật source code và kết quả thực hiện step by step ở một bài viết khác nhé.
