---
template: post
title: R trên Jupiter Notebook (Ubuntu 14.04 / 14.10 / 16.04)
date: "2016-11-22"
author: Van-Duyet Le
tags:
- Data Engineer
- Jupyter
- Data
- Notebook
- Pip
- Python
- Data Science
- Jupyter Notebook
- R
modified_time: '2016-11-22T23:53:50.793+07:00'
thumbnail: https://4.bp.blogspot.com/-aQIMnwL9Gxc/WDR00IF9dqI/AAAAAAAAf9w/ZvplzJNUtI8vjWh2nF8_kVJZoYF3fHF9QCLcB/s1600/Screenshot%2Bfrom%2B2016-11-22%2B23-39-25.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4949235243928754693
blogger_orig_url: https://blog.duyet.net/2016/11/r-tren-jupiter-notebook-ubuntu-1404.html
slug: /2016/11/r-tren-jupiter-notebook-ubuntu-1404.html
category: Data Engineer
description: Jupyter Notebook là công cụ khá mạnh của lập trình viên Python và Data Science. Nếu dùng R, Jupyter cũng cho phép ta tích hợp R kernel vào Notebook một cách dễ dàng.
fbCommentUrl: none
---

Jupyter Notebook là công cụ khá mạnh của lập trình viên Python và Data Science. Nếu dùng R, Jupyter cũng cho phép ta tích hợp R kernel vào Notebook một cách dễ dàng.

![](https://4.bp.blogspot.com/-aQIMnwL9Gxc/WDR00IF9dqI/AAAAAAAAf9w/ZvplzJNUtI8vjWh2nF8_kVJZoYF3fHF9QCLcB/s1600/Screenshot%2Bfrom%2B2016-11-22%2B23-39-25.png)

## Cài đặt ##
1. Cài Jupyter Notebook và R

```shell
# Install Jupyter Notebook 
pip install jupyter

# Install R
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9
sudo add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/'
sudo apt-get update
sudo apt-get install r-base
```

2. Cài đặt R kernel, mở R command line

```shell
root@duyetdev:~# R

R version 3.2.3 (2015-12-10) -- "Wooden Christmas-Tree"
Copyright (C) 2015 The R Foundation for Statistical Computing
Platform: x86_64-pc-linux-gnu (64-bit)

> install.packages(c('repr', 'IRdisplay', 'crayon', 'pbdZMQ', 'devtools'))
> devtools::install_github('IRkernel/IRkernel')
> IRkernel::installspec()  # to register the kernel in the current R installation

```

3. Khởi động Jupyter Notebook   

```shell
jupyter notebook 
```

4. Tạo Notebook mới và chọn R Kernel   

![](https://1.bp.blogspot.com/-msKKn9TC3QM/WDR3Z66_pXI/AAAAAAAAf98/pxS7bxjnjOIKszldYK4vh8ZUH2Q8kui2QCK4B/s1600/kernel-select.png)

## Tham khảo 

Ngoài ra, Jupyter còn hỗ trợ rất nhiều Kernel khác do cộng đồng phát triển, xem tại đây: [https://github.com/ipython/ipython/wiki/IPython-kernels-for-other-languages ](https://github.com/ipython/ipython/wiki/IPython-kernels-for-other-languages)

IRkernel: [https://github.com/IRkernel/IRkernel](https://github.com/IRkernel/IRkernel)
