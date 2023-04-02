---
template: post
title: Coding - Những lợi ích của việc tiếp cận phương pháp module hóa
date: "2015-02-14"
author: Van-Duyet Le
category: News
tags:
- Module
- Coding
modified_time: '2015-02-14T12:39:31.138+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2066005298265408912
blogger_orig_url: https://blog.duyet.net/2015/02/coding-nhung-loi-ich-cua-viec-tiep-can.html
slug: /2015/02/coding-nhung-loi-ich-cua-viec-tiep-can.html
description: Chúng ta thường có xu hướng chỉ muốn bắt tay ngay vào việc viết code. Đôi khi niềm đam mê có thể làm chúng ta vất vả hơn trong thời gian dài khi app của chúng ta phát triển và mở rộng ra, sau đó chúng ta bị mắc kẹt với việc viết lại code hay thậm chí tệ hơn là có những ý nghĩ tệ về code. 
fbCommentUrl: none

---

Chúng ta thường có xu hướng chỉ muốn bắt tay ngay vào việc viết code. Đôi khi niềm đam mê có thể làm chúng ta vất vả hơn trong thời gian dài khi app của chúng ta phát triển và mở rộng ra, sau đó chúng ta bị mắc kẹt với việc viết lại code hay thậm chí tệ hơn là có những ý nghĩ tệ về code. 
Một phương pháp hay nhất là module hóa. Bạn có thể thấy được những lợi ích của phương pháp này như sau.
## Code Maintainability ##
Thực hiện theo phương pháp trên sẽ chia nhỏ app của bạn một cách hợp lý và bạn sẽ dễ dàng xác định vị trí và chỉnh sửa code

## Scalable ##
Code của bạn sẽ quy mô hơn. Việc add các directive và các pages mới sẽ không làm phồng thêm folder hiện tại. Các developers mới dễ dàng tiếp cận hơn khi cấu trúc trên được bạn giải thích. Ngoài ra, với phương pháp này, bạn có thể drop các tính năng trong và ngoài app với việc test các chức năng mới hay loại bỏ nó một cách dễ dàng.

## Debugging ##
Debug code sẽ dễ dàng hơn nhiều nếu bạn tiếp cận phương pháp trên để phát triển app. Sẽ dễ dàng hơn để tìm các phần bị lỗi của code và fix chúng.

## Testing ##
Viết test script và test các apps module hóa dễ hơn rất nhiều đối với các apps không module hóa
