---
template: post
title: Information Retrieval - Vector Space Model
date: "2019-08-30"
category: Data Engineer
tags:
- Data
- Data Engineer
- Information Retrieval
- NLP
slug: /2019/08/ir-vector-space-model.html
thumbnail: https://1.bp.blogspot.com/-XHW4aYhrwXw/XWp6tFER1vI/AAAAAAABGLc/AsRMlDpxMwAcoUFOjZMV1fK-0FfnZEmEwCLcBGAs/s1600/Screen%2BShot%2B2019-08-31%2Bat%2B8.48.04%2BPM.png
description: Hệ thống tra cứu thông tin - Information Retrieval. Một hệ thống tìm kiếm thông tin (Information Retrieval - IR) là một hệ thống tra cứu (thường là các tài liệu văn bản) từ một nguồn không có cấu trúc tự nhiên (thường là văn bản), chứa đựng một số thông tin nào đó từ một tập hợp lớn. Một trong những kỹ thuật phổ biến trong Information Retrieval đó là Vector Space Model. 
prev: /2019/08/airflow-note.html
fbCommentUrl: none
---

Một hệ thống tìm kiếm thông tin (Information Retrieval - IR) là một hệ thống tra cứu (thường là các tài liệu văn bản) từ một nguồn không có cấu trúc tự nhiên (thường là văn bản), chứa đựng một số thông tin nào đó từ một tập hợp lớn. 


**Information Retrieval**
- **Phần 1**: **Vector Space Model**
- Phần 2: [Đánh giá hệ thống Information Retrieval](/2019/08/ir-evaluation.html)
- Phần 3: [Đánh giá hệ thống Information Retrieval (tiếp theo)](#)


<figure>
	<blockquote>
		<p>Information retrieval (IR) is finding material (usually documents) of an unstructured nature (usually text) that satisfies an information need from within large collections (usually stored on computers).</p>
	</blockquote>
</figure>

Khi nói đến IR là nói đến cách tổ chức trình bày, lưu trữ và tìm kiếm. Tùy kiểu dữ liệu khác nhau mà có các cách thức khác nhau. Một số ví dụ dễ thấy của IR như các cỗ máy tìm kiếm (Search Engine). 

Trong các bài biết về IR mình chủ yếu sẽ nói về cách tổ chức và kỹ thuật xếp hạng tài liệu khi ta tra cứu bằng các truy vấn. Một trong những kỹ thuật phổ biến trong Information Retrieval đó là **Vector Space Model** (dịch ra là mô hình không gian vector).

Kiến trúc của một hệ thống IR

<figure>
  <img src="../../media/2019/ir-vector-space-model/IR-infra.png" />
  <figcaption>Nguồn: https://www.cl.cam.ac.uk/teaching/1415/InfoRtrv/lecture5.pdf</figcaption>
</figure>


## Ký hiệu

Ta có một số ký hiệu sau:
- Query (Câu truy vấn) $q = t_1 ... t_m$
- Tài liệu (Documents) $d = d_{i_1}, d_{i_2}, ..., t_{i_n}$
- Collection $C = \{d_1, ..., d_k\}$
- $Rel(q, d)$: relevance giữa $d$ và $q$
- $Rep(d)$: hàm biểu diễn tài liệu $d$
- $Rep(q)$: hàm biểu diễn truy vấn $q$


## 1. Ý tưởng của Vector Space Model

Với mỗi truy vấn, hệ thống tìm kiếm sẽ sử dụng một độ đo $Rel(q, d)$ để tính độ tương đồng giữa truy vấn (query) đó với các tài liệu (docs), từ đó xếp dạng được kết quả trả về.


Ý tưởng của Vector Space Model là **biểu diễn văn bản và các câu truy vấn dưới dạng Vector**, $Rep(d)$ của docs và $Rep(q)$ của query sẽ cho kết quả là các vector. Sau đó **tính độ tương đồng của query** với từng documents theo công thức $Sim(Rep(q), Rep(d))$ để tìm ra docs vào phù hợp nhất với query.

1. Biến đổi các queries và docs thành dạng vector như sau:
$$
d_j = ( w_{1,j} ,w_{2,j} , \dotsc ,w_{t,j} )
$$
$$
q = ( w_{1,q} ,w_{2,q} , \dotsc ,w_{n,q} )
$$

2. Từ đó sử dụng một độ đo khoảng cách trên vector $q$ và $d_j$ để xếp hạng các docs. 

![](/media/2019/ir-vector-space-model/query-vs-docs.svg)


<figure>
	<blockquote>
		<p>Relevant = Similarity</p>
	</blockquote>
</figure>

### Các giả định:

 - Các query và documents được biểu diễn cùng một định dạng với nhau (cùng kích thước, cách biểu diễn trọng số).
 - $Relevance(d, q) \Leftrightarrow similarity(d, q)$

 - $similarity(d, q)$ có thể được tính bằng bất cứ độ đo trên vector nào (e.g. [Euclidean](https://en.wikipedia.org/wiki/Euclidean_vector#Dot_product), [Consine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity), ... )

    $$
        R(q) = \{ d \in C\ |\ rel(d, q) > \theta,\ rel(d, q) = \Delta( Rep(q), Rep(d) ) \}
    $$



### Các vấn đề đặt ra 

Các vấn đề cần đặt ra là:
1. Làm thế nào để biểu diễn $q$ và $d$, công thức tính $Rep(d)$, $Rep(q)$.
2. Làm thể nào để định nghĩa công thức tính độ tương đồng $\Delta( Rep(q), Rep(d) )$

## 2. Concept vectors


Biểu diễn documents và query bởi các **concept vectors**
 - Mỗi concept biểu diễn một chiều
 - K concepts biểu diễn một không gian nhiều chiều.
 - Ta cần định nghĩa trọng số (weight) cho từng chiều của vector.

![](/media/2019/ir-vector-space-model/concept-vector.svg)


## 3. Tìm trọng số (weights) cho vector

Cách xác định và tính weights cho vector là hết sức quan trọng, ảnh hưởng đến độ chính xác của các thuật toán xếp hạng. Việc các từ có trọng số khác nhau là do không phải các từ đều có sự quan trọng giống nhau, sử dụng số lần xuất hiện của các từ làm vector không phải là một cách tối ưu. Ở phương diện các documents, một vài từ có thể mang nhiều thông tin hơn các từ còn lại.

Có nhiều kỹ thuật tính trọng số: TF, IDF, TF-IDF, ...

### a. TF: Term frequency

Từ nào xuất hiện nhiều trong câu thì quan trọng, công thức này sẽ đếm tuần suất xuất hiện các từ trong câu.

$$
    tf(t, d) = f(t, d) \sim \text{tần số xuất hiện của t trong d}
$$

**TF normalization**: Do tùy độ dài ngắn khác nhau của từng câu, mà việc đếm tần suất các từ có thể không công bằng, một số kỹ thuật chuẩn hóa sau có thể giảm tránh được điều này, 
- Chia cho độ dài câu.
- $tf(t, d) = \log(1+f_{{t,d}})$
- $tf(t, d) = {\displaystyle K+(1-K){\frac {f_{t,d}}{\max _{\{t'\in d\}}{f_{t',d}}}}}$

### b. IDF: Inverse document frequency

Từ nào xuất hiện nhiều trong mọi câu thì không mang nhiều ý nghĩa (ví dụ như *a, the, are, thì, là, ...*). Vì vậy trọng số IDF là nghịch đảo của tuần suất xuất hiện của các từ trong các documents.

$$
 \mathrm{idf}(t, D) =  \log \frac{N}{1 + |\{d \in D: t \in d\}|}
$$

Với:
- $N$: số cài liệu trong tập corpus $N = {|D|}$
- $|\{d \in D: t \in d\}|$: số docs mà từ $t$ xuất hiện. Cộng 1 cho mẫu số để tránh trường hợp chia cho 0 nếu từ đó không xuất hiện trong copus $1 + |\{d \in D: t \in d\}|$.

### c. TF-IDF: Term frequency - Inverse document frequency

Phép nhân giữa TD và IDF cho phép ta kết hợp cả 2 độ đo trên, từ vừa xuất hiện nhiều lần trong câu, vừa không phải là từ phổ biến xuất hiện trong mọi câu.

$$
    {\displaystyle \mathrm {tfidf} (t,d,D)=\mathrm {tf} (t,d)\cdot \mathrm {idf} (t,D)}
$$

## 4. Các độ đo similarity

Sau khi có được các vector cho query và docs, ta tính được similarity bằng cách tính khoảng cách giữa các vector.

### a. Euclidean distance

Công thức tính theo WiKi:

$$

{\displaystyle {\begin{aligned}d(\mathbf {d} ,\mathbf {q} )&={\sqrt {(d_{1}-q_{1})^{2}+(d_{2}-q_{2})^{2}+\cdots +(d_{n}-q_{n})^{2}}}\\[8pt]&={\sqrt {\sum _{i=1}^{n}(d_{i}-q_{i})^{2}}}.\end{aligned}}}
$$

Nhược điểm:
- Docs dài hơn sẽ bị giảm hạn do chứa nhiều từ khác gây nhiễu, khiến khoảng cách xa hơn.

### b. Manhattan

Manhattan distance hay còn gọi là L1 distance, tính khoảng cách 2 vector theo công thức

$$
    d_{1}(\mathbf {p} ,\mathbf {q} )=\|\mathbf {p} -\mathbf {q} \|_{1}=\sum _{i=1}^{n}|p_{i}-q_{i}|
$$



### c. Độ đo góc 

Việc tính xem các vector overlapped với nhau như thế nào cũng là một phép so sánh hay sử dụng, độ đo góc phổ biến là Cosine Similarity.

$$
{\displaystyle {\text{similarity}}=\cos(\theta )={\mathbf {A} \cdot \mathbf {B}  \over \|\mathbf {A} \|\|\mathbf {B} \|}={\frac {\sum \limits _{i=1}^{n}{A_{i}B_{i}}}{{\sqrt {\sum \limits _{i=1}^{n}{A_{i}^{2}}}}{\sqrt {\sum \limits _{i=1}^{n}{B_{i}^{2}}}}}}}
$$


-----

Sau khi biểu diễn dưới dạng vector và tính khoảng cách, ta xếp hạng được các tài liệu tìm kiếm với từng query vector.

![](/media/2019/ir-vector-space-model/query-vs-docs-sorted.svg)


## 5. Ưu và nhược điểm của Vector Space Model

### a. Ưu điểm

- Dễ hiểu và dễ cài đặt
- Đã được nghiên cứu từ lâu và thực nghiệm cho kết quả tốt và khả thi
- Hiện tại là phương pháp được sử dụng rộng rãi
- Có nhiều công thức tính TF.IDF khác nhau.

### b. Nhược điểm


- Để cho kết quả đúng đắn, ta giả định:
    - Các câu là độc lập với nhau
    - Các query và documents cùng loại với nhau
- Có nhiều tham số để hiệu chỉnh
    - Bộ từ điển 
    - Tham số trong các hàm Normalize
    - Threshold để chọn ra top kết quả