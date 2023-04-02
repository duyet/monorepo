---
template: post
title: Đánh giá hệ thống Information Retrieval
date: "2019-08-31"
category: Data Engineer
tags:
- Data
- Data Engineer
- Information Retrieval
- NLP
slug: /2019/08/ir-evaluation.html
thumbnail: https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80
description: Trong bài này chúng ta sẽ tìm hiểu về cách đánh giá các hệ thống Information Retrieval, thách thức của việc đánh giá và các độ đo phổ biến như Precision/Accuracy, Recall, R-precision, F-measure, MAP, ...
draft: false
fbCommentUrl: none
---

Trong bài này chúng ta sẽ tìm hiểu về cách đánh giá các hệ thống Information Retrieval, thách thức của việc đánh giá và các kỹ thuật như Precision/Accuracy, Recall, R-precision, F-measure, MAP, ...

--- 

### Information Retrieval 
- Phần 1: [Vector Space Model](/2019/08/ir-vector-space-model.html)
- **Phần 2: Đánh giá hệ thống Information Retrieval**
- Phần 3: [Đánh giá hệ thống Information Retrieval (tiếp theo)](#)

---

Các bước đánh giá một hệ thống tìm kiếm IR:
1. Xây dựng bộ Human Labeled Corpora (Ground truth)
2. Đánh giá bằng các chỉ số
    - Precision & Recall
    - AUC
    - R-precision
    - F-Measure
    - Mean Average Precision (MAP) 
    - Cumulative Gain (CG)

![Làm thế nào để đánh giá kết quả trả về](/media/2019/ir-evaluation/IR-evaluate.png)


# 1. Khó khăn, thách thức khi đánh giá

Sự đánh giá một hệ thống tìm kiếm thông tin IR gặp khó khăn, vì khi đánh giá ở **khía cạnh phù hợp**, với góc nhìn của con người thì:
 - Subjective: việc kết quả phù hợp hay không hết sức chủ quan.
 - Situational: tùy tình huống, hoàn cảnh thời điểm khác nhau thì con người đánh giá khác nhau.
 - Cognitive
 - Dynamic: đánh giá của con người thay đổi theo thời gian, lúc này lúc khác.

# 2. Human Labeled Corpora

**Human Labeled Corpora** (bộ từ điển từ chuyên gia), hay còn có nhiều tên gọi khác như Gold Standard, Ground truth, Benchmark. Một bộ Human Labeled Corpora bao gồm"

1. Một tập copus chứa các tài liệu (docs)
2. Một tập các câu truy vấn (queries) $\{ q_1, q_2, ..., q_n \}$
3. Với mỗi câu query, ta có tập các docs được đánh dấu là phù hợp với query đó, được gán nhãn bằng tay bởi chuyên gia.

Để có kết quả khách quan, ta cần có nhiều chuyên gia khác nhau đánh giá cho cùng một query.

![Human Labeled Corpora](/media/2019/ir-evaluation/Human-Labeled-Corpora.png)


# 3. Chỉ số đánh giá

## a. Precision & Recall

Precision & Recall là 2 độ đo phổ biến, nhất là trong các hệ thống phân lớp (binary classification), information retrieval, ...

- **Precision**: độ chính xác, ví dụ hệ thống tìm kiếm trả về 30 kết quả, trong đó 

$$
{\displaystyle {\text{precision}}={\frac {\{{\text{Tổng số kết quả trả về đúng}}\}}{|\{{\text{Tổng số kết quả trả về}}\}|}}}
$$


- **Recall**: độ phủ

$$
{\displaystyle {\text{precision}}={\frac {\{{\text{Tổng số kết quả trả về đúng}}\}}{|\{{\text{Tổng số kết quả đúng}}\}|}}}
$$

![Trade off](/media/2019/ir-evaluation/precision-recall.png)


Ví dụ, hệ thống tìm kiếm cho kết quả 30 trang, trong đó có 20 trang đúng. Nhưng thực sự trong toàn bộ hệ thống sẽ có tất cả 40 trang đúng. Vậy precision sẽ là 20/30 = 2/3, recall là 20/40 = 1/2.


Tham khảo thêm:
- https://en.wikipedia.org/wiki/Precision_and_recall
- https://towardsdatascience.com/precision-vs-recall-386cf9f89488

Một hệ thống tốt sẽ có sự đánh đổi giữa Precision và Recall. Thực tế cho rằng: *Precision giảm khi recall tăng*

![Trade off](/media/2019/ir-evaluation/trade-off.png)

- Bạn có thể tăng recall bằng cách tăng số docs trả về.
- Recall là một hàm không tăng
- Một hệ thống tìm kiếm trả về toàn bộ docs đạt 100% recall


## b. AUC

Để đánh giá hệ thống tốt khi đánh đổi giữa Precision và Recall, ta dùng một chỉ số là **AUC (Area under Curve)**: diện tích dưới đường vẽ của Recall-Precision.

Các vẽ đường precision-recall curve:
- Cho một query, chọn ra top **n** kết quả đúng -> với mỗi **n** ta có một cặp recall/precision
- Thay đổi **n** ta có một dãy **n** cặp điểm như thế. 
- Vẽ các cặp điểm này ta được đồ thị như sau:

![precision-recall curve](/media/2019/ir-evaluation/precision-recall-curve.png)

Một số điểm đồ thị sẽ bị răng cưa như trên, ta sẽ dùng kỹ thuật interpolated curve, nối các điểm như đường màu đỏ dưới đây $P(r) = \text{max}_{r' > r} P(r')$

![precision-recall curve](/media/2019/ir-evaluation/precision-recall-curve-interpolated.png)


**11-point interpolated average precision**: tính precision trung bình ở 11 điểm

![precision-recall curve](/media/2019/ir-evaluation/11-point-precision-recall.png)

Ta tính diện tích dưới đường precision-recall curve, diện tích lớn hơn thì cho kết quả tốt hơn.

## c. R-precision

Tính precision tại vị trí thứ **R-th** mà câu query trả về **R** câu trả lời.

![R-precision](/media/2019/ir-evaluation/R-precision.png)


## d. F-Measure

F-Measure ($F_1$ Score) là độ đo bao gồm vừa Precison và Recall, công thức truyền thống F-Measure là [harmonic mean](https://en.wikipedia.org/wiki/Harmonic_mean#Harmonic_mean_of_two_numbers) của precision và recall.

$$
{\displaystyle F_{1}=\left({\frac {2}{\mathrm {recall} ^{-1}+\mathrm {precision} ^{-1}}}\right)=2\cdot {\frac {\mathrm {precision} \cdot \mathrm {recall} }{\mathrm {precision} +\mathrm {recall} }}}.
$$

Theo ý nghĩa toán học, để đạt được F-measure cao, ta cần Precision lẫn Recall đều cao.

## e. E-Measure (parameterized F Measure)

Vẫn là F-measure nhưng có thêm tham số hiệu chỉnh, vì đôi khi ta cần Precision quan trọng hơn hoặc ngược lại.

$$
F_\beta = \frac{(1 + \beta^2) \cdot (\mathrm{precision} \cdot \mathrm{recall})}{(\beta^2 \cdot \mathrm{precision} + \mathrm{recall})}\,
$$

Khi đó $\beta$ sẽ điều chỉnh trọng số giữa precision và recall:
 - $\beta$ = 1: Trọng số precision và recall bằng nhau (E=F).
 - $\beta$ > 1: Trọng số recall cao hơn.
 - $\beta$ < 1: Trọng số precision cao hơn.

## f. MAP (Mean Average Precision)

Đây là độ đo tổng hợp kết quả của nhiều query, được sử dụng rất phổ biến. **MAP** cũng chứa thông tin của **precision và recall**, có xét đến độ quan trọng của *thứ hạng kết quả*.

- **Average Precision**: trung bình của các precision tại các điểm mà mỗi kết quả đúng trả về.
- **Mean Average Precision**: trung bình của các Average Precision cho một tập các queries.

# Tham khảo
- [Introduction to Information Retrieval - Stanford NLP Group](https://nlp.stanford.edu/IR-book/)
- https://www.cl.cam.ac.uk/teaching/1415/InfoRtrv/lecture5.pdf

*Many slides in this post are adapted from Prof. Joydeep Ghosh (UT ECE) who in turn adapted them from Prof. Dik Lee (Univ. of Science and Tech, Hong Kong)*
