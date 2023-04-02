---
template: post
title: Giao diện phẳng cho Sublime Text
date: "2015-07-20"
author: Van-Duyet Le
tags:
- how to
- sublime text
- giao diện
- theme
modified_time: '2015-07-20T23:57:56.971+07:00'
thumbnail: https://3.bp.blogspot.com/-sa830MyF-Pc/Va0kRlvZo9I/AAAAAAAACp4/gaw6hL08lPM/s1600/Screenshot%2Bfrom%2B2015-07-20%2B23%253A30%253A29.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3511063714856173572
blogger_orig_url: https://blog.duyet.net/2015/07/giao-dien-phang-cho-sublime-text.html
slug: /2015/07/giao-dien-phang-cho-sublime-text.html
category: Web
description: Sublime text là một editor cực mạnh mẽ với nhiều plugin hữu ích, có thể cài đặt 1 cách dễ dàng trực tiếp. Sublime Text hiện đang được đông đảo các Web Developer sử dụng và yêu thích. Một điểm mạnh nữa là Sublime Text có thể mở rộng thông qua các Plugin, themes, .... viết bằng python.
fbCommentUrl: none

---

Sublime text là một editor cực mạnh mẽ với nhiều plugin hữu ích, có thể cài đặt 1 cách dễ dàng trực tiếp. Sublime Text hiện đang được đông đảo các Web Developer sử dụng và yêu thích. Một điểm mạnh nữa là Sublime Text có thể mở rộng thông qua các Plugin, themes, .... viết bằng python.
Hôm nay mình sẽ hướng dẫn về cách thay đổi giao diện cho Sublime Text, giúp bạn đỡ bớt phần nhàm chán khi Code quanh năm với cái giao diện cũ òm :))

## Cài Package Control  ##
Package Control giúp ta cài đặt mọi thứ trực tiếp vào sublime thông qua màn hình chính của IDE. Nếu bạn nào đã cài thì bỏ qua bước này.

Bấm `Ctrl + `` để mở Sublime Console, rồi paste đoạn code sau vào.

Sublime Text 3:

```
import urllib.request,os,hashlib; h = 'eb2297e1a458f27d836c04bb0cbaf282' + 'd0e7a3098092775ccb37ca9d6b2e4b7d'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)
```

Với Sublime Text 2:

```
import urllib2,os,hashlib; h = 'eb2297e1a458f27d836c04bb0cbaf282' + 'd0e7a3098092775ccb37ca9d6b2e4b7d'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); os.makedirs( ipp ) if not os.path.exists(ipp) else None; urllib2.install_opener( urllib2.build_opener( urllib2.ProxyHandler()) ); by = urllib2.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); open( os.path.join( ipp, pf), 'wb' ).write(by) if dh == h else None; print('Error validating download (got %s instead of %s), please try manual install' % (dh, h) if dh != h else 'Please restart Sublime Text to finish installation')
```

Nhấn Enter, đợi cho nó cài đặt xong.
Bấm Ctrl + Shift + P, gõ "Package Control", nếu thấy như thế này tức là thành công

![](https://3.bp.blogspot.com/-sa830MyF-Pc/Va0kRlvZo9I/AAAAAAAACp4/gaw6hL08lPM/s1600/Screenshot%2Bfrom%2B2015-07-20%2B23%253A30%253A29.png)

## Cài đặt theme thông qua Package Control ##
Theme bên dưới mình đang sử dụng là itg.flat, để cài đặt:

1. Ctrl + Shift + P 
2. Gõ `Install Package`, nhấn Enter.
3. Gõ: `itg.flat`, nhấn Enter, đợi một lúc.

![](https://3.bp.blogspot.com/-_C9oEjU0vic/Va0lXnXGdnI/AAAAAAAACqE/mjQjBLtmoyE/s1600/Screenshot%2Bfrom%2B2015-07-20%2B23%253A42%253A56.png)
4. Mở Menu: References > Settings - User
5. Thêm vào file Settings User đoạn json sau rồi save lai

[![](https://2.bp.blogspot.com/-MDvC1cBAQ7Q/Va0lqiG-IZI/AAAAAAAACqM/WYRRgPlpBbo/s1600/Screenshot%2Bfrom%2B2015-07-20%2B23%253A44%253A59.png)](https://2.bp.blogspot.com/-MDvC1cBAQ7Q/Va0lqiG-IZI/AAAAAAAACqM/WYRRgPlpBbo/s1600/Screenshot%2Bfrom%2B2015-07-20%2B23%253A44%253A59.png)

Bạn cũng có thể chỉnh thêm 1 số thông số theo nội dung của file hướng dẫn

Kết quả phẳng lỳ

![](https://3.bp.blogspot.com/-mzN6sZ-oJGI/Va0md3gGRXI/AAAAAAAACqY/UzMegyeklVE/s1600/Screenshot%2Bfrom%2B2015-07-20%2B23%253A48%253A24.png)

Ngoài ra bạn có thể truy cập vào trang chủ của Package Control tại:  [https://packagecontrol.io](https://packagecontrol.io/)
Search lấy theme bạn chọn, nhớ lấy tên theme rồi vào Sublime Text cài đặt tương tự như ở trên.
