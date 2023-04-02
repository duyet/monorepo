---
template: post
title: Giao thức Diffie-Hellman (DH)
date: "2016-03-08"
author: Van-Duyet Le
tags:
- Diffie-Hellman
- Security
- RSA
- Phân tích
- Bảo mật
modified_time: '2016-03-08T20:22:36.152+07:00'
thumbnail: https://4.bp.blogspot.com/-POla3_QYnOA/Vt7RlL_z6hI/AAAAAAAAQtU/TGeI1cufIe0/s1600/anglerek_dh_02b.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6589695726259461920
blogger_orig_url: https://blog.duyet.net/2016/03/giao-thuc-diffie-hellman.html
slug: /2016/03/giao-thuc-diffie-hellman.html
category: Security
description: Theo trang công nghệ Engadget, giải thưởng AM Turing được coi như Nobel IT năm 2015 sẽ được trao cho hai nhà khoa học Whitfield Diffie và Martin E. Hellman, tác giả của đề tài mã hóa dữ liệu mang tên "Giao thức Difie-Hellman 1976". Phương pháp mã hóa được cho là "có thể bảo vệ hàng nghìn tỷ USD" đã được vinh danh tại giải thường được coi là "giải Nobel" cho lĩnh vực công nghệ thông tin.
fbCommentUrl: none
---

Theo trang công nghệ Engadget, giải thưởng AM Turing được coi như Nobel IT năm 2015 sẽ được trao cho hai nhà khoa học Whitfield Diffie và Martin E. Hellman, tác giả của đề tài mã hóa dữ liệu mang tên "Giao thức Difie-Hellman 1976". Phương pháp mã hóa được cho là "có thể bảo vệ hàng nghìn tỷ USD" đã được vinh danh tại giải thường được coi là "giải Nobel" cho lĩnh vực công nghệ thông tin.

![](https://4.bp.blogspot.com/-POla3_QYnOA/Vt7RlL_z6hI/AAAAAAAAQtU/TGeI1cufIe0/s1600/anglerek_dh_02b.jpg)
Đây là giao thức giúp cho 2 máy tính trao đổi thông tin với nhau một cách bảo mật bằng cách tạo ra shared private key.

Giả sử 2 máy tính là A và B. Đầu tiên 2 máy tạo ra 2 số nguyên tố p và g, khi p lớn (thường lớn hơn 512 bits) và g là primitive root modulo của số p. p và g không cần giữ bí mật với các users khác. Khi đó, A và B tự chọn cho mình một số đủ lớn ngẫu nhiên làm private key, giả sử A chọn số a và B chọn số b.

Bây giờ A tính A = ga (mod p) và gửi cho B, B tính số gb (mod p) và gửi ngược lại cho A.
Hai mã này là shared key. A và B sẽ thực hiện phép tính dựa và key nhận được.

A tính: K = Ba (mod p) = (gb)a (mod p)
và B: K = Ab (mod p) = (ga)b (mod p)

Bây giờ 2 máy có thể sử dụng shared key K của mình để trao đổi dữ liệu mà không cần phải sợ dữ liệu bị nghe lén. Hai máy A và B có thể tìm được a từ công thức A = ga (mod p) và b từ B = gb (mod p). Có thể tham khảo thêm ở hình minh họa ở trên.

Tham khảo

- [http://mathworld.wolfram.com/Diffie-HellmanProtocol.html](http://mathworld.wolfram.com/Diffie-HellmanProtocol.html)
- [Diffie–Hellman key exchange](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange) - Wikipedia
- [RSA Diffie-Hellman explained in 3 minutes](http://www.mat-d.com/site/rsa-diffie-hellman-explained-in-3-minutes/)
