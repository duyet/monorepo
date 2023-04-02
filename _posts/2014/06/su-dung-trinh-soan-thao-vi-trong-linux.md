---
template: post
title: Sử dụng "vi" trong Linux
date: "2014-06-15"
category: Linux
tags:
- Linux
- Fedora
modified_time: '2014-06-15T09:31:06.549+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4166931066163902607
blogger_orig_url: https://blog.duyet.net/2014/06/su-dung-trinh-soan-thao-vi-trong-linux.html
slug: /2014/06/su-dung-trinh-soan-thao-vi-trong-linux.html
description: Linux là một hệ điều hành được điều khiển đa phần qua môi trường dòng lệnh (console), thêm vào đó, các file cấu hình dịch vụ trên Linux thường được chỉnh sửa bởi trình editor là vi (hay vim, bản cải thiện của vi). Nếu bạn là người thường xuyên quản trị server linux qua console, thì vi là trình tiện ích hay sử dụng nhất. Do vậy, học cách sử dụng vi là một yêu cầu tối thiểu và cần thiết cho một người sử dụng linux.

---

Linux là một hệ điều hành được điều khiển đa phần qua môi trường dòng lệnh (console), thêm vào đó, các file cấu hình dịch vụ trên Linux thường được chỉnh sửa bởi trình editor là vi (hay vim, bản cải thiện của `vi`. Nếu bạn là người thường xuyên quản trị server linux qua console, thì vi là trình tiện ích hay sử dụng nhất. Do vậy, học cách sử dụng vi là một yêu cầu tối thiểu và cần thiết cho một người sử dụng linux.

## 1. Cơ bản ##
- Sử dụng vi kèm theo tên file(s) muốn edit: `vi one.txt two.txt etc.txt`
- Có 2 mode: **command mode** và insert mode. Khi bắt đầu sử dụng lệnh vi, vi mặc định ở **command mode**. Hoặc ấn `Esc` để chuyển sang **command mode** khi người dùng đang ở insert mode.

## 2. Các lệnh edit cơ bản ##
- Ấn phím lệnh i hoặc a từ chế độ **command mode** để chuyển sang insert mode. i để thêm ký tự trước con trỏ, a để thêm ký tự sau con trỏ.
- Sử dụng lệnh `h` `j` `k` `l` hoặc các phím mũi tên tương ứng để di chuyển con trỏ sang trái, xuống, lên, sang phải.
- Sử dụng `x` xóa 1 ký tự, `dw` xóa 1 từ, `dd` xóa cả 1 dòng.
- Sử dụng số `N` đi trước phím lệnh để lặp lại N lần tác dụng của lệnh. Ví dụ, `3dw` sẽ xóa 3 từ tính từ vị trí con trỏ.
- Sử dụng `u` ( = undo )để khôi phục lại những thay đổi trước đó.
- Sử dụng `ZZ` hay `:wq` lưu lại tất cả thay đổi và thoát.
- Sử dụng `:q!` thoát ra không lưu lại bất kỳ thay đổi nào.

## 3. Cắt và dán ##
- `yy` sao chép dòng hiện tại vào buffer, `Nyy` sao chép N dòng.
- `p` ( P ) dán nội dung từ buffer vào dưới (trên) dòng hiện tại

## 4. Nhảy đến hàng hay cột ##
- Gõ một số N trước ký tự `G` để đi đến dòng thứ N, vd `23G` sẽ nhảy đến dòng 23.
- Gõ một số N trước ký tự `|` (pipe) để nhảy đến cột thứ N.

## 5. Sử dụng . để lặp lại action gần ##
- Ví dụ người dùng gõ i để insert dòng chữ "hello world", sau đó chuyển sang chế độ **command mode** bằng phím `Esc`, nhảy xuống dòng và gõ . , dòng chữ "hello world" sẽ hiện ra.

## 6. Tìm kiếm ##
- Sử dụng `/` (`?`) đi theo sau là từ muốn tìm để tìm kiếm từ trong phần văn bản sau ( trước ) con trỏ. ví dụ `/foobar` hay `?foobar`.
- Sau khi kết quả tìm kiếm đầu tiên hiện ra, sử dụng `n` để tìm kiếm tiếp trong phần văn bản còn lại sau con trỏ, `N` để tìm kiếm ngược trở lại đầu văn bản trước con trỏ.

## 7. Các lệnh colon ( đi sau dấu : ) ##
- `:%s/foo/bar/g` tìm sự xuất hiện của "foo" trong toàn bộ file và thay thế bằng "bar", `/foo/bar/g` chỉ thay thế ở dòng hiện tại.
- `et` `nu` hiển thị số dòng trước mỗi dòng, et nonu để bỏ hiển thị số dòng.
- `:1,8d` xóa từ dòng 1 cho đến dòng 8 trong file.
- Sử dụng `ma` để đánh dấu dòng hiện tại là `a` ( có thể là bất cứ ký tự nào từ `a-z` ). Sau đó dùng ‘a để nhảy đến dòng đã được dánh dấu là a từ bất cứ đâu. Có thể sử dụng với colon, :’a,’b d xóa tất cả các dòng bắt đầu từ dòng được đánh dấu là a cho đến dòng được đánh dấu là b, hoặc ngược lại.
- `:w newfile.txt` để save nội dung của file hiện tại vào một file mới là `newfile.txt` ( tựa "save as" bên Win Word ).
- `:8,16` co 32 để copy dòng 8 đến 16 đến điểm sau dòng 32.
- `:3,16 m` 32 để chuyển rời dòng 8 đến 16 đến điểm sau dòng 32.
- Nếu dùng vi để mở nhiều file ( `vi file1 file2 file3` ), có thể sử dụng `:n` để nhảy đến file tiếp theo và `:rew` để nhảy quay ngược lại đến file đầu tiên, :args để hiện thị tất cả các file đang được mở.

## 8. Vi for Smarties ##
- Sử dụng `G` để nhảy đến dòng cuối cùng của file.
- Khi xóa nhiều dòng, di chuyển con chuột đến dòng đầu tiên, gõ ma để đánh dấu, sau di đến dòng cuối cùng và gõ d’a để xóa những dòng đó.
- `$` để nhảy xuống cuối dòng, `:$` để nhảy đến dòng cuối của file.
- `0` để nhảy đến đầu dòng, :0 để nhảy tới dòng đầu tiên của file.
- `d$` xóa từ vị trí con trỏ hiện tại đến cuối dòng.
- `:10,$ d` xóa từ dòng 10 cho đến dòng cuối cùng của file, hoặc ngược lại.
- `:10,20 m 0` chuyển rời dòng 10 đến 20 lên trên dòng đầu tiên của file.

## 9. Shell ##
- Sử dụng `:!command` để thi hành lệnh command trong môi trường vi.
Trên đây là giới thiệu cách sử dụng vi một cách cơ bản và đủ dùng cho mọi đối tượng người sử dụng linux. Người dùng muốn tham khảo thêm có thể lên website của vim tại https://www.vim.org/.
