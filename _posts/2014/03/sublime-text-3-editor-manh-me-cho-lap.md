---
template: post
title: Sublime Text 3 - editor mạnh mẽ cho lập trình viên PHP
date: "2014-03-13"
category: Web
tags:
- IDE
- sublime text
- Tutorials
- editor
modified_time: '2017-06-26T21:56:44.602+07:00'
thumbnail: https://2.bp.blogspot.com/-nb8YMOYfUF8/UyFRBMRLFLI/AAAAAAAAGZo/Wd8TEIsnGsA/s1600/sublime.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3574293490283851806
blogger_orig_url: https://blog.duyet.net/2014/03/sublime-text-3-editor-manh-me-cho-lap.html
slug: /2014/03/sublime-text-3-editor-manh-me-cho-lap.html
description: Sublime text là một editor khá mới, nhưng theo đánh giá của mình thì nó khá mạnh với nhiều plugin hữu ích, có thể cài đặt 1 cách dễ dàng trực tiếp. Cung cấp một hiệu suất làm việc với các tính năng rất tuyệt vời. Trong bài hôm này, mình sẽ giới thiệu với các bạn về cách sử dụng cơ bản và chuyên sâu về sublime text 3.

---

Sublime text là một editor khá mới, nhưng theo đánh giá của mình thì nó khá mạnh với nhiều plugin hữu ích, có thể cài đặt 1 cách dễ dàng trực tiếp. Cung cấp một hiệu suất làm việc với các tính năng rất tuyệt vời. Trong bài hôm này, mình sẽ giới thiệu với các bạn về cách sử dụng cơ bản và chuyên sâu về sublime text 3.

## Cài đặt ##

Bản mới nhất của Sublime text tại thời điểm bài viết là bản 3, build 3059, bạn có thể cài đặt nó từ trang chủ: [https://www.sublimetext.com/3](https://www.sublimetext.com/3)

Có các phiên bản cho Window, Ubuntu, OSX

Đây là 1 editor miễn phí, nhưng bạn có thể trả phí để có bản quyền. Bản free chỉ thỉnh thoảng hiện lên thông báo xem bạn có trả phí hay k thôi.

Chọn phiên bản phù hợp với hệ điều hành của bạn và download về để cài đặt.

[![](https://2.bp.blogspot.com/-nb8YMOYfUF8/UyFRBMRLFLI/AAAAAAAAGZo/Wd8TEIsnGsA/s1600/sublime.png)](https://2.bp.blogspot.com/-nb8YMOYfUF8/UyFRBMRLFLI/AAAAAAAAGZo/Wd8TEIsnGsA/s1600/sublime.png)

## Quản lý Project ##

Chức năng Project cho phép chúng ta quản lý dự án 1 cách dễ dàng hơn. 

Thêm 1 project mới vào Sublime text bằng cách vào menu `Project > Add folder to project`

Sau khi thêm, danh sách các file trong dự án sẽ được liệt kê ở cột bên trái, cho phép chúng ta chọn nhanh các file.

## Thay đổi màu sắc highlight ##

Highlight code cho ta cái nhìn trực quan và dễ nhìn hơn. Sublime text có rất nhiều color scheme. Bạn có thể thay đổi tùy thích trong **Preferences > Color Scheme**

## Các plugin ##

Sublime có rất nhiều plugin, có thể cài đặt trực tiếp mà không cần lên Web tải về để cài đặt.

Cách làm như sau: Các bạn nhấn tổ hợp phím **Ctrl + `** sau đó paste đoạn code sau và nhấn Enter:

```python
import urllib.request,os,hashlib; h = '7183a2d3e96f11eeadd761d777e62404' + 'e330c659d4bb41d3bdf022e94cab3cd0'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'https://sublime.wbond.net/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)
```

Đây là plugin package control, bây giờ bạn đã có thể cài trực tiếp plugin thông qua tổ hợp phím `Ctrl + Shift + p`, sau đó nhấn Install, nhấn Enter và tìm plugin thích hợp. Mọi công việc cài đặt sẽ được tự động. 

![](https://2.bp.blogspot.com/-SBusZhYQKHM/UyFUXmDG7nI/AAAAAAAAGZ0/2rk_PLVdluo/s1600/sublime2.png)

Chọn plugin để cài:

![](https://4.bp.blogspot.com/-a2Pbc1R-OVQ/UyFUqPhtvFI/AAAAAAAAGZ8/5IqYBWfXSRE/s1600/sublime3.png)

## Một số plugin bạn nên cài ##

- Sublime Prefixr (Ctrl+Alt+X)
- Sublime Alignment (Ctrl+Alt+A)
- Jquery
- Jquery snippets
- Nettuts Fetch
- Sublime CodeIntel
- Tag
- Prefixr
- Google search
- WordPress
- HTML5
- Indent Guides

Cách sử dụng và chức năng của 1 số plugin sẽ được update sau. Các bạn đón theo dõi nhé. Chúc thành công. Mọi chi tiết các bạn có thể comment hoặc email cho mình. Have fun :))
