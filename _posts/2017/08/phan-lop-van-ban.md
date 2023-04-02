---
template: post
title: Phân lớp văn bản
date: "2017-08-11"
author: Van-Duyet Le
tags:
- Data Engineer
- Gensim
- Tutorial
- Text Classification
- Python
- Javascript
- NLP
- NLTK
- Machine Learning
modified_time: '2018-09-01T22:32:19.917+07:00'
thumbnail: https://3.bp.blogspot.com/-_i6Le_EX3oU/WX_10OCZ9lI/AAAAAAAAmV8/X7JDtZf83DknCJbJrqdhbx1fXXzz0W8LgCK4BGAYYCw/s1600/tree.gif
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8908950775061022424
blogger_orig_url: https://blog.duyet.net/2017/08/phan-lop-van-ban.html
slug: /2017/08/phan-lop-van-ban.html
category: Machine Learning
description: Trong Machine Learning và NLP, phân lớp văn bản là một bài toán xử lí văn bản cổ điển, gán các nhãn phân loại lên một văn bản mới dựa trên mức độ tương tự của văn bản đó so với các văn bản đã được gán nhãn trong tập huấn luyện.
fbCommentUrl: http://blog.duyetdev.com/2017/08/phan-lop-van-ban.html
---

Trong Machine Learning và NLP, phân lớp văn bản là một bài toán xử lí văn bản cổ điển, gán các nhãn phân loại lên một văn bản mới dựa trên mức độ tương tự của văn bản đó so với các văn bản đã được gán nhãn trong tập huấn luyện.  
  
Các ứng dụng của phân lớp văn bản thường rất đa dạng như: _lọc email spam, phân tích cảm xúc (sentiment analysis), phân loại tin tức, ..._  
  
Sau mình sẽ giới thiệu vài nét rất tổng quát các bước để có thể phân lớp văn bản, một số kỹ thuật thường sử dụng, các thư viện, đưa ra từ khóa để tự tìm hiểu thêm và chi tiết ở các bài viết khác.  
  
Note: Đối tượng bài viết những ai đang tìm hiểu về NLP và Machine Learning. Mình sử dụng Python và R. Những điều mình viết có thể không được chính xác 100%, vậy những ai chuyên gia trong lĩnh vực này có thể giúp mình correct bài viết nhé.  

## Quy trình tổng quát

Việc phân lớp về cơ bản có thể có nhiều kỹ thuật, tổng quát đều thực hiện các bước sau:  

*   **Tiền xử lý văn bản:** lọc bỏ dấu câu, chính tả, kỹ tự lỗi, ...
*   **Biểu diễn văn bản** dưới dạng **vector** (thường gọi là mô hình hóa văn bản, vector hóa văn bản), thường phải làm các công việc như sau:

*   Tách từ (tokenizer, n-gram, ...; tiếng việt có thư viện [vnTokenizer](http://mim.hus.vnu.edu.vn/phuonglh/softwares/vnTokenizer) khá nổi tiếng), lọc bỏ stopwords (những từ xuất hiện nhiều nhưng không mang nhiều ý nghĩa (_a, the, in, of, ...; thì, là, nên, ..._).
*   Vector hóa văn bản (feature vector): sử dụng các kỹ thuật như [Bag of Words](https://en.wikipedia.org/wiki/Bag-of-words_model), [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf), ...  
    Số chiều của vector này bằng số từ được token (có thể lên tới 100.000 hay 10.000.00 chiều), đây của là một problem của feature vector, để giải quyết có thể sử dụng các kỹ thuật PCA, SVD, ...

*   **Phân lớp văn bản sau** sau khi văn bản được vector hóa, bước này ta chọn một mô hình, thuật toán ML phân lớp ([SVM](http://scikit-learn.org/stable/modules/svm.html), [CNN text classifier](https://github.com/dennybritz/cnn-text-classification-tf), [Native-Bayes](http://scikit-learn.org/stable/modules/naive_bayes.html), [Decision Trees](http://scikit-learn.org/stable/modules/tree.html), [K-means](http://scikit-learn.org/stable/modules/clustering.html), [LDA - topic clustering](http://scikit-learn.org/stable/modules/generated/sklearn.decomposition.LatentDirichletAllocation.html), ...). Bước này bao gồm:

*   **Train** và **Evaluate** mô hình: chia dữ liệu thành 2 tập train và test để đánh giá mô hình. 
*   Thử, thay đổi mô hình, tham số và đánh giá, đến khi nào được kết quả tối ưu, gọi là m_odel selection_.
*   Việc đánh giá mô hình có thể sử dụng: [ROC Curve](https://en.wikipedia.org/wiki/Receiver_operating_characteristic), [Precision/Recall](https://en.wikipedia.org/wiki/Precision_and_recall), [Lift](https://en.wikipedia.org/wiki/Lift_(data_mining)), ...

*   **Deploy**.

## Các thư viện hỗ trợ

Với mình, việc hỗ trợ xử lý văn bản của **Python** rất mạnh, cú pháp dễ học nhiều thư viện và thuật toán cho NLP, Machine learning:

*   **NLTK**: Natural Language Toolkit ([http://www.nltk.org](http://www.nltk.org/)).  
    [![](https://3.bp.blogspot.com/-_i6Le_EX3oU/WX_10OCZ9lI/AAAAAAAAmV8/X7JDtZf83DknCJbJrqdhbx1fXXzz0W8LgCK4BGAYYCw/s1600/tree.gif)](https://3.bp.blogspot.com/-_i6Le_EX3oU/WX_10OCZ9lI/AAAAAAAAmV8/X7JDtZf83DknCJbJrqdhbx1fXXzz0W8LgCK4BGAYYCw/s1600/tree.gif)
*   **SciPy**: Python-based ecosystem of open-source software for mathematics, science, and engineering ([https://www.scipy.org](https://www.scipy.org/)).  
    [![](https://4.bp.blogspot.com/-npda8VcLpTI/WX_2G0kAGzI/AAAAAAAAmWA/Pe52hgx3SBsD1rti-bnyVUPvSZcOjODJgCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-08-01%2B10-31-24.png)](https://4.bp.blogspot.com/-npda8VcLpTI/WX_2G0kAGzI/AAAAAAAAmWA/Pe52hgx3SBsD1rti-bnyVUPvSZcOjODJgCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-08-01%2B10-31-24.png)
*   **scikit-learn**: Machine Learning in Python  ([http://scikit-learn.org/stable/](http://scikit-learn.org/stable/))  
    [![](https://1.bp.blogspot.com/-Qkv-KaOtQQI/WX_2lTj6E-I/AAAAAAAAmWI/VC7hvM9GlDYkFQaM8SnrqBc15phe8Sf0QCK4BGAYYCw/s320/scikit-learn-logo.png)](https://1.bp.blogspot.com/-Qkv-KaOtQQI/WX_2lTj6E-I/AAAAAAAAmWI/VC7hvM9GlDYkFQaM8SnrqBc15phe8Sf0QCK4BGAYYCw/s1600/scikit-learn-logo.png)
*   **Gensim**: Topic modeling for human ([https://radimrehurek.com/gensim/](https://radimrehurek.com/gensim/))  
    [![](https://3.bp.blogspot.com/-Ted-CgUTbdQ/WX_2vm3DpqI/AAAAAAAAmWQ/9nQo0VipCloBhbHiiYI7CjtrzU33Hof2gCK4BGAYYCw/s320/article_4_19_fig_1.jpg)](https://3.bp.blogspot.com/-Ted-CgUTbdQ/WX_2vm3DpqI/AAAAAAAAmWQ/9nQo0VipCloBhbHiiYI7CjtrzU33Hof2gCK4BGAYYCw/s1600/article_4_19_fig_1.jpg)  
    (ảnh: [https://ischool.syr.edu/infospace/2013/04/23/what-is-text-mining](https://ischool.syr.edu/infospace/2013/04/23/what-is-text-mining))
*   **Matplotlib**: is a Python 2D plotting library ([https://matplotlib.org](https://matplotlib.org/)).  
    [![](https://1.bp.blogspot.com/-FeOpj0O-4FE/WX_3Ja-k5kI/AAAAAAAAmWY/tSnGHC-VyKIa8XtmFezAyEQ21pTLbLuFgCLcBGAs/s400/Screenshot%2Bfrom%2B2017-08-01%2B10-35-53.png)](https://1.bp.blogspot.com/-FeOpj0O-4FE/WX_3Ja-k5kI/AAAAAAAAmWY/tSnGHC-VyKIa8XtmFezAyEQ21pTLbLuFgCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-08-01%2B10-35-53.png)

Trên Python, bạn nên sử dụng **[Jupyter Notebook](http://jupyter.org/)** để có thể code và visualize dễ dàng hơn. Các thư viện trên đều có thể cài dễ dàng bằng **pip**.

## Ví dụ: phân lớp văn bản theo category

Ở notebook ví dụ sau, với [data](https://github.com/duyet/demo-text-classification/blob/master/data/newtrain.csv) là một đoạn text ngắn được phân thành 7 loại category khác nhau:

  
![](https://1.bp.blogspot.com/-Y7MMOQSN-Hc/WZ6387WQQLI/AAAAAAAAmuk/jGhk-DLhSqwQH97Uqjvwby-lZZxPKACowCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-08-24%2B18-24-45.png)


Mình sẽ dùng kỹ thuật **TF-IDF** để biến văn bản thành một vector và sử dụng thuật toán **SVM** ([http://scikit-learn.org/stable/modules/svm.html](http://scikit-learn.org/stable/modules/svm.html)) trong thư viện **sklearn** để tiến hành phân lớp.  
Source: [https://github.com/duyet/demo-text-classification/blob/master/classification-with-tfidf-svm.ipynb](https://github.com/duyet/demo-text-classification/blob/master/classification-with-tfidf-svm.ipynb)

<script src="https://gist.github.com/duyet/7c4cee01ecde476e246c6dfe55822fcb.js"></script>