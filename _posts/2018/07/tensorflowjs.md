---
template: post
title: TensorFlow.js
date: "2018-07-19"
author: Van-Duyet Le
tags:
- Tensorflow
- Javascript
- Machine Learning
- Web
modified_time: '2018-07-20T12:57:01.378+07:00'
thumbnail: https://1.bp.blogspot.com/-WBy6evaOwH8/W1CvMUBZFXI/AAAAAAAAxYI/pa6D8MlcTsQ-VQuwCHAyNcJvMf8RteCLgCK4BGAYYCw/s1600/tensorflowjs.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4302333722370154187
blogger_orig_url: https://blog.duyet.net/2018/07/tensorflowjs.html
slug: /2018/07/tensorflowjs.html
category: Machine Learning
description: Với TensorFlow.js, không những có thể chạy models machine learning, mà chúng ta còn có thể training trực tiếp ngay trên browser. Trong bài viết ngắn gọn này, mình sẽ giới thiệu cách sử dụng cơ bản và nhanh nhất để bắt đầu với Tensorflow.js.
fbCommentUrl: none
---

Với TensorFlow.js, không những có thể chạy models machine learning, mà chúng ta còn có thể training trực tiếp ngay trên browser. Trong bài viết ngắn gọn này, mình sẽ giới thiệu cách sử dụng cơ bản và nhanh nhất để bắt đầu với Tensorflow.js.


![](https://1.bp.blogspot.com/-WBy6evaOwH8/W1CvMUBZFXI/AAAAAAAAxYI/pa6D8MlcTsQ-VQuwCHAyNcJvMf8RteCLgCK4BGAYYCw/s1600/tensorflowjs.png)

Bây giờ bắt đầu với trang HTML cơ bản nhất mọi thời đại:  
  

```html
<html><head></head><body></body></html>
```


Sau đó, đầu tiên là cần load tensorflow để bắt đầu sử dụng các APIs. Mình sử dụng CDN:  
  

```html
<html>
<head>
 <!-- Load TensorFlow.js -->
 <!-- Get latest version at https://github.com/tensorflow/tfjs -->
 <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.12.3"> </script>
```
  
Phiên bản mới nhất tại thời điểm này là 0.12.3, bạn nên checkout version mới nhất tại Github.  

#### Bài toán hồi quy đơn giản

Bây giờ đã load được Tensorflow.js, mình thử một bài toán đơn giản.  
Giả sử chúng ta có phương trình  

**f(x): y = 2x - 1**

  
Với phương trình trên, đi qua được các điểm sau:  

**(-1, -3), (0, -1), (1, 1), (2, 3), (3, 5), (4, 7)**

  

Như hàm `f(x)` trên ta đã biết, cho một giá trị x ta có được giá trị y tương ứng. Bài tập là training một model, không biết trước phương trình `f(x)`, từ các tập giá trị x suy ra y, ta có thể tìm ra được phương trình đó hay không. 



Bắt đầu, mình sẽ tạo 1 neural network đơn giản, chỉ có 1 input và 1 output, vậy ở đây mình có 1 single node. Trên Javascript, mình có thể tạo một **tf.sequential** và add các định nghĩa của layer vào, cực kỳ đơn giản:  
  
```js
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [1]}));
```
  
Sau đó, mình compile model, định nghĩa loss type và hàm optimizer. Loss type ở đây mình sử dụng **meanSquaredError** cho đơn giản, optimizer là stochastic gradient descent:  
  

```js
model.compile({
   loss: 'meanSquaredError',
   optimizer: 'sgd'
  });
```
  
Để train model, mình định nghĩa 1 tensor X cho giá trị đầu vào và 1 tensor khác cho giá trị Y:  
  

```js
const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);
```
  
Để train model mình sử dụng `fit()`, đưa tập `Xs` và `Ys`, set số `epochs` (số lần lăp qua toàn bộ data)  
  
```js
await model.fit(xs, ys, {epochs: 500});
```

  
Done, sau khi train có được model, model này được dùng để đoán 1 giá trị `Y` cho giá trị `X` mới, ví dụ `X = 10`. Sử dụng `predict()` và in giá trị này vào 1 thẻ `<div> ` 
  

```js
document.getElementById('output_field').innerText =  model.predict(
    tf.tensor2d([10], [1, 1])
);
```


[![](https://3.bp.blogspot.com/-tZzhHT2HZFo/W1DAagaO5_I/AAAAAAAAxYQ/AckM8BYmLeU_S2hrj5HSHCcxy2829ZS9ACLcBGAs/s1600/Chart%2Bmodel%2BtensorflowJS.png)](https://3.bp.blogspot.com/-tZzhHT2HZFo/W1DAagaO5_I/AAAAAAAAxYQ/AckM8BYmLeU_S2hrj5HSHCcxy2829ZS9ACLcBGAs/s1600/Chart%2Bmodel%2BtensorflowJS.png)

  
Kết quả hiển thị trên màn hình:  
  

[![](https://4.bp.blogspot.com/-Ge85yyxGclE/W1DAp6BmlZI/AAAAAAAAxYY/DiFfqydtOYoUBHVz5uOYAozPlnCjmI5tQCK4BGAYYCw/s1600/1_cbucRpe0oFey2c_a4ytnjw.png)](https://4.bp.blogspot.com/-Ge85yyxGclE/W1DAp6BmlZI/AAAAAAAAxYY/DiFfqydtOYoUBHVz5uOYAozPlnCjmI5tQCK4BGAYYCw/s1600/1_cbucRpe0oFey2c_a4ytnjw.png)

Ảnh: https://medium.com/tensorflow/getting-started-with-tensorflow-js-50f6783489b2

  

Sau đây là source code đầy đủ của toàn bộ chương trình trên:  

```html
<html>
  <head>
    <!-- Load TensorFlow.js -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.12.3"> </script>

    <!-- Place your code in the script tag below. You can also use an external .js file -->
    <script>
      // Notice there is no 'import' statement. 'tf' is available on the index-page
      // because of the script tag above.

      // Define a model for linear regression.
      const model = tf.sequential();
      model.add(tf.layers.dense({units: 1, inputShape: [1]}));

      // Prepare the model for training: Specify the loss and the optimizer.
      model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

      // Generate some synthetic data for training.
      const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
      const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

      // Train the model using the data.
      model.fit(xs, ys, {epochs: 10}).then(() => {
        // Use the model to do inference on a data point the model hasn't seen before:
        // Open the browser devtools to see the output
        model.predict(tf.tensor2d([5], [1, 1])).print();
      });
    </script>
  </head>

  <body>
  </body>
</html>
```
  
Cuối cùng mình đã giới thiệu qua cách train một model rất đơn giản với Tensorflow.js, từ đây bạn đã có thể xây dựng ứng dụng deep learning ngay trên trình duyệt rồi.  

#### References

*   [Getting Started with TensorFlow.js](https://medium.com/tensorflow/getting-started-with-tensorflow-js-50f6783489b2)

Have fun, hãy để lại bình luận nếu có bất cứ thắc mắc gì nhé :D