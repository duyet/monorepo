---
template: post
title: Git - Kĩ thuật chia branch, "Branch early, branch often"
date: "2015-07-16"
author: Van-Duyet Le
tags:
- Git
- Git Workflow
modified_time: '2015-07-16T12:54:31.864+07:00'
thumbnail: https://4.bp.blogspot.com/-s4EMBlWhY34/VadEZkNL7YI/AAAAAAAACnc/byhewvc8IsQ/s1600/s1-1024x417.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-9144536109356254828
blogger_orig_url: https://blog.duyet.net/2015/07/git-ki-thuat-chia-branch-branch-early.html
slug: /2015/07/git-ki-thuat-chia-branch-branch-early.html
category: Git
description: Đây là một bài mình viết trên blog CodeDaily, nói về kĩ thuật chia branch, branch workflow.
fbCommentUrl: none

---

Đây là một bài mình viết trên blog CodeDaily, nói về kĩ thuật chia branch, branch workflow.

Có một câu nói mà các developer khi làm việc trên Git phải thuộc nằm lòng, đó là:

> Branch early, branch often

Ý nghĩa của câu nói trên tức là bạn cần phải tạo cho mình thói quen  sử dụng branch, khi làm bất kì việc gì (một task mới, một feature mới,…)  thì việc đầu tiên luôn là: Tạo một branch mới.

Vì sao phải tạo branch? Tui làm trên branch master không được hả?

Ờ thì chả ai cấm bạn làm trực tiếp trên `master` branch,  nhưng việc này tiềm ẩn nhiều nguy cơ khó lường.
Ví dụ như: Khi bạn đang  hì hục làm 1 chức năng nào đó, bất ngờ KH gọi và bảo có 1 bug nghiêm  trọng cần phải fix gấp, bạn sẽ làm gì? Dùng stash để đẩy hết code đang  làm sang một bộ nhớ tạm thời, hoặc backup code đang làm rồi revert toàn  bộ để ưu tiên fix bug cho KH trước?

Những cách này tất nhiên giải quyết  được vấn đề, nhưng không hay cho lắm, và tất nhiên sẽ luôn gây ra một số  rắc rối nhất định.

Để tránh những trường hợp như trên, chúng ta nên tập thói quen tạo  branch. Để hiểu rõ hơn về cách làm việc với branch, hãy xem qua cách  giải quyết vấn đề được nêu ra ở ví dụ trên:

Bắt đầu ngày làm việc, bạn chọn làm một chức năng mới. Việc đầu tiên cần làm là tạo một branch mới bằng câu lệnh `git checkout` với tham số `-b`

` `![](https://4.bp.blogspot.com/-s4EMBlWhY34/VadEZkNL7YI/AAAAAAAACnc/byhewvc8IsQ/s1600/s1-1024x417.png) 

Bắt đầu ngày làm việc, bạn chọn làm một chức năng mới. Việc đầu tiên cần làm là tạo một branch mới bằng câu lệnh `git checkout` với tham số `-b`

![](https://3.bp.blogspot.com/-uspVsG_BzcM/VadEiRHx95I/AAAAAAAACnk/OIJgxqVFd_k/s1600/s2-1024x413.png) 

 Trong quá trình làm việc, bạn nên `commit` code khi hoàn thành một số chức năng nhất định. Nhưng chưa cần vội `push`.

![](https://3.bp.blogspot.com/-rpFBfIa18xk/VadErR34TeI/AAAAAAAACns/G1-TYFQ6VWM/s1600/s3-1024x417.png)

Sẽ có những lúc đang làm cắm cúi và anh KH từ đâu lao đến ném cho một đống việc thế này.

![](https://3.bp.blogspot.com/-IQ-YtYUp2Eg/VadEyA7oX9I/AAAAAAAACn0/Q7fX39B3Osw/s1600/s4.png) 

Và tất nhiên bạn không thể nào từ chối dược, đành quay sang fix trước cho lão ấy. Khi đó, chỉ cần chuyển về branch `master` (lưu ý phải commit hết code lên branch đang làm trước khi chuyển branch) bằng câu lệnh `checkout`

![](https://1.bp.blogspot.com/-7QZMuA8jUzU/VadE5IcZCOI/AAAAAAAACn8/WhsufMSvR8g/s1600/s5.png) 

Mục đích của việc chuyển về branch master là để khi làm chức năng  mới, sẽ không dính dáng gì đến các chức năng đang làm dở. Và bạn cũng  nên pull thường xuyên để lấy code mới nhất về trước khi bắt đầu thực  hiện chức năng mới. Từ master, bạn tạo ra một branch mới:

` `

![](https://3.bp.blogspot.com/-Xqc3xRSHu2w/VadFCs2nvBI/AAAAAAAACoE/AHJdbgt4CbQ/s1600/s6.png) 

Sau khi đã hoàn thành công việc, bạn hãy `commit` lên branch đó:

![](https://2.bp.blogspot.com/-SMwaCwbTWho/VadFI0USnII/AAAAAAAACoM/0X2fO-epgtk/s1600/s8.png)

Sau đó chuyển về `master` và dùng lệnh `git merge` để nhập các thay đổi từ branch vừa xong vào master.

![](https://1.bp.blogspot.com/-VQSFFKjDyhI/VadFPiBPyYI/AAAAAAAACoU/Fcatyec0ajQ/s1600/s9-1024x428.png)

Lúc này, bạn có thể push code lên và thông báo với lão KH rằng mình  đã fix xong các yêu cầu của lão. Sau đó quay trở về branch mà bạn đang  làm dở công việc trước đó.

![](https://4.bp.blogspot.com/-cVo6xdsrAso/VadFWBuup2I/AAAAAAAACoc/xiuKheUuTnQ/s1600/s10.png) 

Tiếp tục code, đến khi hoàn thành thì commit lên.

![](https://1.bp.blogspot.com/-p_8xF9Y15mQ/VadFbdKEDUI/AAAAAAAACok/vgkDhX0BgCk/s1600/s11-1024x421.png)

Và quay về master, dùng lệnh `git merge` để nhập các chức năng vừa làm xong vào master. Và cuối cùng là push code. Vậy là công việc của bạn đã hoàn thành :D

![](https://4.bp.blogspot.com/-uWIS7CystjI/VadFk6YKZtI/AAAAAAAACos/NB9sATsomqM/s1600/s12-1024x419.png)

Mặc dù sử dụng branch có vẻ tốn rất nhiều thao tác, nhưng đây là một  việc hết sức cần thiết. Để tiện lợi hơn, thay vì gõ lệnh bằng tay, bạn  có thể sử dụng một số công cụ như `SourceTree`, rất trực quan và rất mạnh.

Để kết thúc bài viết, các bạn hãy làm một bài tập nho nhỏ: Nhìn vào  cây branch dưới đây và hình dung lại những thao tác đã làm trong bài ví  dụ trên, tương ứng với với mỗi một node.

![](https://2.bp.blogspot.com/-iEzhN7GcC0Y/VadFsF9kmgI/AAAAAAAACo0/gp-zYf7bmWE/s1600/s12b.png)
