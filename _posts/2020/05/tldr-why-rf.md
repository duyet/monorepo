---
template: post
title: TL;DR - khi nào nên sử dụng Random Forest thay vì Neural Network
date: "2020-05-01"
author: Van-Duyet Le
category: Machine Learning
tags:
- Machine Learning
- TLDR
thumbnail: https://3.bp.blogspot.com/-uzyqmWX5I1o/XqwizPGEHqI/AAAAAAABWd4/VzE8XDrPcGwrcsdl8KOHqEjGsXBNDzdvACK4BGAYYCw/s1200/nn-rf.png
slug: /2020/05/tldr-why-rf.html
draft: false
description: Cả Random Forest và Neural Networks đều là những kỹ thuật khác nhau nhưng có thể sử dụng chung ở một số lĩnh vực. Vậy khi nào sử dụng 1 kỹ thuật thay vì cái còn lại?
fbCommentUrl: none
---

Neural networks đã chứng tỏ rằng nó hiệu quả hơn một số thuật toán Machine Learning ở nhiều lĩnh vực khác nhau. Tuy nhiên, một neural network sẽ phải cần 1 lượng tham số (variables) nhiều đến nổi chúng ta không thể kiểm soát được để hiểu hết. Thứ hai, với NN nếu chúng ta chỉ quan tâm đến kết quả dự đoán thì ổn, nhưng trong môi trường công nghiệp, chúng ta (hay lãnh đạo của chúng ta) cần một model giải thích được ý nghĩa của feature/variable đó.

Điểm khác biệt giữa Random Forest và Neural Networks là Random Forest sử dụng công nghệ của Machine Learning, Neural Networks thì lại dành cho Deep Learning.

![](/media/2020/why-rf/nn-rf.svg)


# Tại sao nên sử dụng Random Forest

- Lý do cơ bản khi sử dụng Random Forest thay vì Decision Tree (DT) là vì RF kết hợp từ nhiều cây DT vào một model để cho kết quả tốt hơn. Hiệu quả đã được chứng minh từ thực nghiệm.
- Kết quả mô hình có tính giải thích.
- Ngoài ra RF cũng giúp giảm thiểu overfitting. 

# Khi nào nên sử dụng Random Forest thay vì Neural Networks

- Random Forest sử dụng ít tính toán hơn và không cần sử dụng GPU.
- Neural Networks cần rất nhiều dữ liệu, đồng thời có cũng tạo ra nhiều features để tăng hiệu năng nhưng không mang nhiều ý nghĩa đối với con người.
- Nếu bạn giàu, có nhiều máy, không cần tính giải thích chỉ cần kết quả, hãy sử dụng Neural Networks
- Nếu bạn cần tính giải thích của các biến số, dễ dàng tinh chỉnh, hãy sử dụng Random Forest.

![](/media/2020/why-rf/meme.jpeg)


# References
 - [3 Reasons to Use Random Forest® Over a Neural Network: Comparing Machine Learning versus Deep Learning](https://www.kdnuggets.com/2020/04/3-reasons-random-forest-neural-network-comparison.html)
 - [Random Forest® vs Neural Networks for Predicting Customer Churn](https://www.kdnuggets.com/2019/12/random-forest-vs-neural-networks-predicting-customer-churn.html)
 - https://www.kdnuggets.com/2019/08/activestate-decision-tree-random-forest-xgboost.html