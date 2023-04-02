---
template: post
title: Python - Nhận dạng xe hơi với OpenCV
date: "2017-09-20"
author: Van-Duyet Le
tags:
- Data Engineer
- opencv
- image
- Python
- Javascript
- Machine Learning
modified_time: '2018-09-01T22:32:19.312+07:00'
thumbnail_2: https://2.bp.blogspot.com/-u1Fqw11luYo/WcE3gP_ykFI/AAAAAAAAngY/iPfg5bwKCcIVn5XTgM3SnVjKzf0QRBBegCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-09-19%2B22-27-44.png
thumbnail: https://1.bp.blogspot.com/-Sx90cRHgP4s/WcKO5d4IRGI/AAAAAAAAnjM/gp0RZ17opasM_xxlTQGid7cX-WqC9BRRwCLcBGAs/s1600/result_car2.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4598795408481099766
blogger_orig_url: https://blog.duyet.net/2017/09/detect-cars-opencv.html
slug: /2017/09/detect-cars-opencv.html
category: Machine Learning
description: Trong bài này, mình sẽ hướng dẫn sử dụng OpenCV để nhận diện xe hơi trong ảnh (video frame) với đặc trưng HAAR, sử dụng file mô hình đã được trained.
fbCommentUrl: none
---

Trong bài này, mình sẽ hướng dẫn sử dụng OpenCV để nhận diện xe hơi trong ảnh (video frame) với [đặc trưng haar](https://en.wikipedia.org/wiki/Haar-like_features), sử dụng file mô hình đã được trained.

Bài viết chỉ giúp hình dung code trên Opencv chứ không đi sâu vào thuật toán. Trong bài này mình sẽ hướng dẫn cách build/install opencv trên Ubuntu, một chương trình đơn giản detect 1 vùng ảnh, phân loại đó có phải xe hơi hay không và vẽ 1 hình chữ nhật đánh dấu.

## Cài đặt OpenCV trên Ubuntu ##
Sử dụng Windows hay Fedora bạn có thể cài đặt dễ dàng [theo hướng dẫn này](http://docs.opencv.org/3.0-beta/doc/py_tutorials/py_setup/py_table_of_contents_setup/py_table_of_contents_setup.html#py-table-of-content-setup), còn mình sử dụng Ubuntu nên phải build từ source.

Cài đặt trước một số package/thư viện để build opencv:

```
sudo apt-get install build-essential cmake pkg-config
sudo apt-get install libjpeg8-dev libtiff5-dev libjasper-dev libpng12-dev # image 
sudo apt-get install libavcodec-dev libavformat-dev libswscale-dev libv4l-dev # codec, video
sudo apt-get install libgtk-3-dev # opencv GUI
sudo apt-get install libatlas-base-dev gfortran
```

Download source từ Github, mình sử dụng version 3.1.0:

```
wget -O opencv.zip https://github.com/Itseez/opencv/archive/3.1.0.zip
unzip opencv.zip
wget -O opencv_contrib.zip https://github.com/Itseez/opencv_contrib/archive/3.1.0.zip
unzip opencv_contrib.zip
```

OpenCV yêu cầu dependency là numpy

```
pip install numpy
```

Bắt đầu build source:

```shell
cd opencv-3.1.0/
mkdir build
cd build
cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D INSTALL_PYTHON_EXAMPLES=ON \
    -D INSTALL_C_EXAMPLES=OFF \
    -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib-3.1.0/modules \
    -D BUILD_EXAMPLES=ON .. 
```

Note: Nếu trong quá trình build bị lỗi stdlib.h: No such file or directory thì chỉ cần tạo lại thư mục build, thêm tham số `-D ENABLE_PRECOMPILED_HEADERS=OFF` vào lệnh cmake

Sau khi build xong, để sử dụng được Python 2, bạn phải chú ý đường dẫn của Interpreter, Libraries, numpy, và packages path có chính xác hay không.

[![](https://2.bp.blogspot.com/-u1Fqw11luYo/WcE3gP_ykFI/AAAAAAAAngY/iPfg5bwKCcIVn5XTgM3SnVjKzf0QRBBegCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-09-19%2B22-27-44.png)](https://2.bp.blogspot.com/-u1Fqw11luYo/WcE3gP_ykFI/AAAAAAAAngY/iPfg5bwKCcIVn5XTgM3SnVjKzf0QRBBegCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-09-19%2B22-27-44.png)

Sau khi Cmake không còn lỗi, bắt đầu build (-j4 là sử dụng 4 core để build)

```
make -j4
```

[![](https://4.bp.blogspot.com/-0SnmDeM2B0M/WcE4AXJN6JI/AAAAAAAAngg/KQt_S4_zH3Q8se_FZHqIhB-KcElleplMwCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-09-19%2B22-29-22.png)](https://4.bp.blogspot.com/-0SnmDeM2B0M/WcE4AXJN6JI/AAAAAAAAngg/KQt_S4_zH3Q8se_FZHqIhB-KcElleplMwCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-09-19%2B22-29-22.png)

Bước cuối cùng, install vào OS:

```
sudo make install
sudo ldconfig
```

Đã xong, kiểm tra thử đã cài đặt thành công hay chưa:

[![](https://3.bp.blogspot.com/-ADZP1py__HQ/WcFHipA-fGI/AAAAAAAAngw/KqEojie1Hb4Bhr3CSXLZpfGpqkq7zXZhgCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-09-19%2B23-35-52.png)](https://3.bp.blogspot.com/-ADZP1py__HQ/WcFHipA-fGI/AAAAAAAAngw/KqEojie1Hb4Bhr3CSXLZpfGpqkq7zXZhgCLcBGAs/s1600/Screenshot%2Bfrom%2B2017-09-19%2B23-35-52.png)

Sau khi cài thành công, có thể xóa source nếu không cần thiết nữa:

```
rm -rf opencv-3.1.0 opencv_contrib-3.1.0 opencv.zip opencv_contrib.zip
```

## Nhận dạng xe ##
Load thư viện opencv, nếu bạn sử dụng Jupyter notebook thì import cả matplotlib để hiển thị ảnh inline ngay trên cell output.

```python
%matplotlib inline
import cv2

# Will use matplotlib for showing the image in notebook
# Sử dụng matplotlib để hiển thị ảnh trên notebook
from matplotlib import pyplot as plt
```

Tải [cars.xml](https://github.com/duyet/opencv-car-detection/blob/master/cars.xml) bỏ vào thư mục làm việc. Đây là Cascade Classifier ảnh. Kế tiếp đọc ảnh và chuyển sang chế độ màu gray.

Ta có ảnh sau:

[![](https://3.bp.blogspot.com/-Y8l5HW2tOko/WcKOUHuXN2I/AAAAAAAAni0/ImCsNb-J7WU9VSwmo4VJjlnKBrMuSO34wCLcBGAs/s1600/car3.jpg)](https://3.bp.blogspot.com/-Y8l5HW2tOko/WcKOUHuXN2I/AAAAAAAAni0/ImCsNb-J7WU9VSwmo4VJjlnKBrMuSO34wCLcBGAs/s1600/car3.jpg)

```python
car_cascade = cv2.CascadeClassifier('cars.xml')
img = cv2.imread('car3.jpg', 1)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
```

Sử dụng detectMultiScale để detect xe, sau đó vẽ border hình chữ nhật để đánh dấu vị trí trên ảnh.

```python
# Detect cars
cars = car_cascade.detectMultiScale(gray, 1.1, 1)

# Draw border
for (x, y, w, h) in cars:
    cv2.rectangle(img, (x,y), (x+w,y+h), (0,0,255), 2)
    ncars = ncars + 1
```

Cuối cùng hiển thị kết quả

```python
# Show image
plt.imshow(img)
```

[![](https://4.bp.blogspot.com/-Q7hQ2nkdYOs/WcKOoh1NVhI/AAAAAAAAnjE/nuDEVWj14-stCPHc4aWj1UFc7GyGTudNwCK4BGAYYCw/s1600/result_car1.png)](https://4.bp.blogspot.com/-Q7hQ2nkdYOs/WcKOoh1NVhI/AAAAAAAAnjE/nuDEVWj14-stCPHc4aWj1UFc7GyGTudNwCK4BGAYYCw/s1600/result_car1.png)
Test một số ảnh khác:

[![](https://4.bp.blogspot.com/-CS1Ort8e2S8/WcKO5VqKyUI/AAAAAAAAnjI/H5ViCGDoxGcdtoE8qgaKdjoSuRsrKCM4gCLcBGAs/s800/car2.jpg)](https://4.bp.blogspot.com/-CS1Ort8e2S8/WcKO5VqKyUI/AAAAAAAAnjI/H5ViCGDoxGcdtoE8qgaKdjoSuRsrKCM4gCLcBGAs/s1600/car2.jpg)

[![](https://1.bp.blogspot.com/-Sx90cRHgP4s/WcKO5d4IRGI/AAAAAAAAnjM/gp0RZ17opasM_xxlTQGid7cX-WqC9BRRwCLcBGAs/s800/result_car2.png)](https://1.bp.blogspot.com/-Sx90cRHgP4s/WcKO5d4IRGI/AAAAAAAAnjM/gp0RZ17opasM_xxlTQGid7cX-WqC9BRRwCLcBGAs/s1600/result_car2.png)

Source code đầy đủ chương trình trên:

```python
import cv2
from matplotlib import pyplot as plt

car_cascade = cv2.CascadeClassifier('cars.xml')
img = cv2.imread('car3.jpg', 1)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Detect cars
cars = car_cascade.detectMultiScale(gray, 1.1, 1)

# Draw border
for (x, y, w, h) in cars:
    cv2.rectangle(img, (x,y), (x+w,y+h), (0,0,255), 2)
    ncars = ncars + 1

# Show image
plt.figure(figsize=(10,20))
plt.imshow(img)
```

Kết quả nhận dạng phụ thuộc nhiều vào Cascade cars.xml đã train trước, nên có thể kết quả nhận diện không hoàn toàn chính xác.

Tham khảo:

- [http://docs.opencv.org/trunk/d7/d8b/tutorial_py_face_detection.html](http://docs.opencv.org/trunk/d7/d8b/tutorial_py_face_detection.html)
- [http://docs.opencv.org/2.4/doc/tutorials/objdetect/cascade_classifier/cascade_classifier.html](http://docs.opencv.org/2.4/doc/tutorials/objdetect/cascade_classifier/cascade_classifier.html)
- Source code trong bài: [https://github.com/duyet/opencv-car-detection](https://github.com/duyet/opencv-car-detection)
