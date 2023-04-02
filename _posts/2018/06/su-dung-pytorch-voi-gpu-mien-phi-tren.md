---
template: post
title: Sử dụng PyTorch với GPU miễn phí trên Google Colab
date: "2018-06-03"
author: Van-Duyet Le
tags:
- AI
- Data Engineer
- Notebook
- Python
- PyTorch
- Machine Learning
- Jupyter Notebook
- Colaboratory
modified_time: '2018-07-20T10:11:11.326+07:00'
thumbnail: https://4.bp.blogspot.com/-SdOdKIqi8Q0/WxPzp07jlfI/AAAAAAAAubY/BdjBxk-frPgTZKvNR8CTYpBgUwRcF9SQACLcBGAs/s1600/35226d9fbc661ced1c5d17e374638389178c3176.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4058951143958765380
blogger_orig_url: https://blog.duyet.net/2018/06/su-dung-pytorch-voi-gpu-mien-phi-tren.html
slug: /2018/06/su-dung-pytorch-voi-gpu-mien-phi-tren.html
category: Web
description: Google Colab (https://colab.research.google.com/) là một phiên bản Jupyter/iPython đến từ Google (think iPython + Google Drive), cung cấp cho chúng ta một môi trường notebook-based với backend Python 2/3 miễn phí. Google Colab rất hữu ích trong việc chia sẻ, giáo dục và teamwork trong các dự án về Machine Learning.
fbCommentUrl: none
---

[Google Colab](https://blog.duyet.net/2017/11/colaboratory-research-google.html#.WxPuK0jRDIU) ([https://colab.research.google.com/](https://colab.research.google.com/)) là một phiên bản Jupyter/iPython đến từ Google (think iPython + Google Drive), cung cấp cho chúng ta một môi trường notebook-based với backend Python 2/3 miễn phí. Google Colab rất hữu ích trong việc chia sẻ, giáo dục và teamwork trong các dự án về Machine Learning.

![](https://4.bp.blogspot.com/-SdOdKIqi8Q0/WxPzp07jlfI/AAAAAAAAubY/BdjBxk-frPgTZKvNR8CTYpBgUwRcF9SQACLcBGAs/s640/35226d9fbc661ced1c5d17e374638389178c3176.png)

## GPU ##
Một chức năng Google vừa cập nhật cho Colab là sử dụng GPU backend miễn phí trong 12 tiếng liên tiếp. Thông tin như sau:

1. The GPU used in the backend is a K80 (at this moment).
2. The 12-hour limit is for a continuous assignment of virtual machine (VM).

[![](https://2.bp.blogspot.com/-ERE_NP9B2Cg/WxPu3W9_8QI/AAAAAAAAua4/CU2FES_GEI44uZ0UK8B-rKC4Xw0HjWQTQCK4BGAYYCw/s320/NVIDIA-Tesla-K80-GPU.jpg)](https://2.bp.blogspot.com/-ERE_NP9B2Cg/WxPu3W9_8QI/AAAAAAAAua4/CU2FES_GEI44uZ0UK8B-rKC4Xw0HjWQTQCK4BGAYYCw/s1600/NVIDIA-Tesla-K80-GPU.jpg)
Có nghĩa bạn có thể tiếp tục sử dụng GPU sau 12 tiếng bằng cách connect tới VM khác.

## Kích hoạt GPU ##
1. Mở Notebook Colab
2. Vào menu Edit > Notebook Settings,  Hardware accelerator chọn GPU

[![](https://1.bp.blogspot.com/-2xNbbfzx6Og/WxPwkZc_LoI/AAAAAAAAubA/6b-NZMa9t_komNhrKg6-pXGiBi0WrETcACLcBGAs/s1600/colab-gpu.PNG)](https://1.bp.blogspot.com/-2xNbbfzx6Og/WxPwkZc_LoI/AAAAAAAAubA/6b-NZMa9t_komNhrKg6-pXGiBi0WrETcACLcBGAs/s1600/colab-gpu.PNG)

## Cài đặt Pytorch ##
Chạy lệnh sau trong notebook cell

```py
# http://pytorch.org/
from os import path
from wheel.pep425tags import get_abbr_impl, get_impl_ver, get_abi_tag
platform = '{}{}-{}'.format(get_abbr_impl(), get_impl_ver(), get_abi_tag())

accelerator = 'cu80' if path.exists('/opt/bin/nvidia-smi') else 'cpu'

!pip install -q http://download.pytorch.org/whl/{accelerator}/torch-0.3.0.post4-{platform}-linux_x86_64.whl torchvision
import torch
```

[![](https://4.bp.blogspot.com/-2aTYdl7YiPU/WxP1ssgciWI/AAAAAAAAubk/3eVKYTfmde8aKVoYdbUXd5dc9yY7cohFgCLcBGAs/s1600/colab-gpu-2.PNG)](https://4.bp.blogspot.com/-2aTYdl7YiPU/WxP1ssgciWI/AAAAAAAAubk/3eVKYTfmde8aKVoYdbUXd5dc9yY7cohFgCLcBGAs/s1600/colab-gpu-2.PNG)

And that's it!
