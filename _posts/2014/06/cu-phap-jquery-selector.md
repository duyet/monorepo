---
template: post
title: Cú pháp jQuery selector
date: "2014-06-02"
category: Javascript
tags:
- jQuery Selector
- jQuery
modified_time: '2014-06-02T12:59:20.875+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5725214778206562429
blogger_orig_url: https://blog.duyet.net/2014/06/cu-phap-jquery-selector.html
slug: /2014/06/cu-phap-jquery-selector.html
description: Selector là một chuỗi ký tự cho phép chỉ định chính xác element trên tài liệu html. Gọi hàm $(<selector>) để jQuery trả về cho bạn một jQuery object. Object này chứa những hàm cung cấp bởi jQuery và mảng chứa DOM node tìm thấy bởi selector. 

---

Selector là một chuỗi ký tự cho phép chỉ định chính xác element trên tài liệu html. Gọi hàm `$(<selector>)` để jQuery trả về cho bạn một jQuery object. Object này chứa những hàm cung cấp bởi jQuery và mảng chứa DOM node tìm thấy bởi selector. 
Có 2 kiểu selector thường gặp:

## Kiểu đơn ##

- Tìm bằng id của element: Dùng dấu # đặt trước tên id. 
Ví dụ lấy element `<div id="wrapper">...</div>` ta viết: `$("#wrapper")`
- Tìm bằng class của element: Dùng dấu . đặt trước tên class.
Ví dụ lấy các element `<p>…</p>` ta viết `$(".content")`
- Tìm bằng tag của element: dùng tên tag.
Ví dụ lấy tất cả thẻ <`h2>…</h2>` ta viết `$("h2″)`

Đặc điểm khi lấy bằng class hoặc tag là ta sẽ lấy được nhiều node html giống nhau về tên tag hay class; khi lấy bằng id ta chỉ lấy được 1 node do trên tài liệu html, chỉ gán id cho một element duy nhất. Do đó, nên dùng tag hay class khi muốn xử lý hàng loạt element với cùng một hành động. Ví dụ đổi màu text của tiêu đề các bài viết (thẻ h2) khi hover chuột, ta dùng `$("h2″)`, như vậy sẽ không cần phải viết đi viết lại nhiều lần như dùng id.

## Kiểu phức hợp ##
Tìm bằng cú pháp tổng hợp của kiểu đơn. Một trang web thực sự khi chạy, các element sẽ lồng vào nhau, với số lượng lớn. Để tăng độ chính xác và giảm bớt kết quả trùng khi tìm kiếm, ta phức hợp các selector tìm kiếm với nhau. Ví dụ:

Tìm các thẻ div có dạng `<div class="title">…</div>` , ta viết: `$("div.title")` . Lưu ý chuỗi `"div.title"` không có khoảng trắng ở giữa, có nghĩa là "tìm tất cả các thẻ div mà bản thân nó có class là title". Nếu có khoảng cách, xem ví dụ dưới.

Tìm các thẻ span trong đoạn html có dạng

```html
<div class="article" articleId="456">
 <div class="title">...</div>
 <span class="content">...</span>
</div>
```

Ta viết: `$(".article span.content")`. Với khoảng trắng ở giữa `".article"` và `"span.content"`, selector này có thể hiểu là: "tìm tất cả các thẻ span có class là content, và nó phải được chứa trong một html node có class là .article". Khoảng trắng giữa các từ trong selector được điểu là quan hệ node cha-con, đọc từ trái qua phải là node cha tới node con.

## Nâng cao độ chính xác với selector đặc biệt ##

### Dùng attribute của thẻ html ###
Đôi khi chỉ ta cần tìm chính xác chỉ 1 node nào đó trong rất nhiều node giống nhau, ta cần cung cấp thêm nhiều thông tin bổ sung để phân biệt cụ thể. jQuery hỗ trợ sâu nhất tới mức select trên các thuộc tính. Bổ sung cú pháp `[<tên attirbute> = <giá trị>]` vào selector. Ví dụ, để tìm `"bài viết"` có id là `"456″` như ví dụ trên, ta viết `$("div.article[articleId=456]")`. với `<giá trị>` kiểu chuỗi, nên cẩn thận đặt trong cặp dấu nháy/nháy kép – `[articleId='post456']`.

### Dùng bộ lọc jQuery Filter, hay còn gọi là nhận dạng Pseudo ###

Lại một lần nữa jQuery học tập css ở việc sử dụng pseudo. dùng dấu : đặt ngay trước tên filter, giống như gọi hàm, một số filter cần tham số đầu vào là selector khác, một số khác thì không. Ví dụ:
- Lấy tất cả các thẻ div không chứa class `.title`, ta viết: `$("div:not(.title)")`
- Lấy thẻ ``span`` đầu tiên trong tất cả các `span` chứa class content, ta viết: `$("span.content:first")`
- Lấy thẻ `span` thứ 4 trong tất cả các `span` chứa class content, ta viết: `$("span.content:eq(3)")`. Lưu ý, với `:eq`, filter bắt đầu đếm từ 0.

Tham khảo thêm danh sách filter và tác dụng ở trang [jQuery Basic Filter](https://api.jquery.com/category/selectors/basic-filter-selectors/). 
