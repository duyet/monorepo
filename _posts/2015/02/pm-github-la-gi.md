---
template: post
title: Github là gì?
date: "2015-02-14"
author: Van-Duyet Le
category: News
tags:
- Git
- Github
modified_time: '2016-03-01T12:14:59.064+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8192788491263355004
blogger_orig_url: https://blog.duyet.net/2015/02/pm-github-la-gi.html
slug: /2015/02/pm-github-la-gi.html
description: Github, còn được gọi là social network dành cho developer đi vào hoạt động tháng 2 năm 2008, là một dịch vụ sử dụng hệ thống quản lý phân tán giúp người dùng lưu trữ source code cho các dự án. Git là một mô hình quản lý source phân tán, nó có mọi tính năng của một source control như SVN và hơn thế nữa.
fbCommentUrl: none

---

Github, còn được gọi là social network dành cho developer đi vào hoạt động tháng 2 năm 2008, là một dịch vụ sử dụng hệ thống quản lý phân tán giúp người dùng lưu trữ source code cho các dự án. Git là một mô hình quản lý source phân tán, nó có mọi tính năng của một source control như SVN và hơn thế nữa.
Github được viết bằng Ruby on Rails. GitHub cung cấp dịch vụ thương mại và cả tài khoản miễn phí cho các dự án nguồn mở. Theo khảo sát của người sử dụng Git vào năm 2009, Github hiện đang là server Git lưu trữ source code phổ biến nhất hiện nay (Ngoài ra, [Gitorious](http://gitorious.org/) cũng là server Git hoạt động giống Github được chú ý đến).

Có hơn 439000 developer tạo hơn 1 triệu 350 ngàn repositories là một con số khá ấn tượng, cùng với một số khách hàng lớn của github như Twitter, Facebook, Yahoo ... cho thấy tính phổ biến của Github, cũng như cộng đồng lập trình thế giới tín nhiệm nó như thế nào.

## Cách thức làm việc với GitHub ##

Làm việc với GitHub nói riêng hay hệ thống GIT nói chung có 2 workflow chính là local workflow và server workflow.

Bạn có thể làm mọi chuyện thay đổi source code ở local, sau khi đã thay đổi xong, bạn sẽ commit những thay đổi đó lên server và bản lên server phải là bản hoàn chỉnh một tính năng nào đó, hoặc fix bug xong, test xong hoặc ít nhất bản đó phải chạy được. Không được commit code dở dang, chưa qua test lên repository server sẽ làm ảnh hưởng đến các thành viên khác, ngược lại bạn có thể làm điều đó ở repository local (Bạn cũng có thể tạo một branch ở server cho việc commit code dở dang hay tính năng chưa hoàn thành như từng làm với SVN, nó sẽ chiếm space ở server cũng như làm mất thời gian của bạn vào việc tương tác kết nối với server, vậy tại sao không commit nó lên repository local nhỉ, vừa nhanh thao tác lại không mất space của server.

Mở rộng: từ repository của github ta có thể theo phương thức của Git tạo bản build cho production site bằng cách push thay đổi lên nó. Khi tương tác với repository server (cập nhật hay thay đổi) GITHUB đòi hỏi mã chứng nhận "Bạn là ai" thông qua so sánh SSH key ở local của bạn và SSH key trên server tương ứng với account mà bạn đã đăng ký với GITHUB trước đó.

## Làm việc với repository ở local ##

Với 2 command thường dùng là git add và git commit

- git add: add file đã thay đổi vào stage
- git commit commit các file đã add vào stage lên repository ở local Ngoài ra bạn xem một số command khác

## Làm việc với repository ở server github ##

Sau khi đã quậy tè le ở local, cuối cùng khi có một bản ổn định và hoàn tất ta sẽ quyết định cập nhật nó lên repository server với:

- push: push thay đổi từ repository local lên repository server
- fetch: cập nhật thay đổi từ repository server về repository local
- pull/rebase: sao chép source code từ server về local workspace (tương đương checkout của SVN)

## Tính năng API của Github ##

Ngoài những tính năng tuyệt vời của hệ thống quản lý source phân tán GIT nói chung, Github còn hỗ trợ người dùng những tính năng quan trọng thông qua API sau:

- API to Update The Repository via HTTP: GitHub hỗ trợ người dùng có thể edit file source code từ web browser thông qua HTTP - POST
- API to Access Compare Views: Tính năng này hỗ trợ người dùng review và so sánh code của dự án thông qua việc xem các commit, comments, các dòng khác nhau giữa 2 version của file code ... Tính năng này cũng thông qua HTTP - POST, người dùng có thể thực hiên trên web browser.
- API to Manage Service Hooks: GitHub hỗ trợ tính năng mở rộng post-receive hooks. Tính năng này cho phép người dùng đăng ký 1 URL của mình (như là một web hook) cho các respository. Bất cứ khi nào có người push source code của họ lên repository, GitHub sẽ thông báo cho bạn biết bằng cách POST thông tin (dạng JSON) về lần push đó đến URL mà bạn đã đăng ký trước đó. Còn rất nhiều API hữu ích khác, các bạn có thể xem tất cả tại develop.github

## Kết ##

Nói sơ sơ thôi, rảnh rảnh sẽ chi tiết
