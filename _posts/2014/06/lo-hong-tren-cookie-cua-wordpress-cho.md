---
template: post
title: Lỗ hổng trên Cookie của WordPress cho phép các Hacker xâm nhập vào tài khoản
  của người dùng
date: "2014-06-03"
category: News
tags:
- Wordpress
- Lỗ hổng
- The Hacker News
- Cookie
modified_time: '2014-06-03T22:53:32.326+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-705499100492935958
blogger_orig_url: https://blog.duyet.net/2014/06/lo-hong-tren-cookie-cua-wordpress-cho.html
thumbnail: https://securitydaily.net/wp-content/uploads/2014/05/wordpress-hacking-exploit.jpg
slug: /2014/06/lo-hong-tren-cookie-cua-wordpress-cho.html
description: Bạn có đang sở hữu một blog trên website WordPress không? Nếu có, thì bạn nên cẩn trọng khi đăng nhập vào tài khoản WordPress từ lần sau khi kết nối với mạng Wi-Fi công cộng, bởi vì tài khoản của bạn có thể bị xâm nhập lúc nào mà ban không biết thậm chí kể cả việc bạn đã sử dụng xác thực dùng hai nhân tố.

---

Bạn có đang sở hữu một blog trên website WordPress không? Nếu có, thì bạn nên cẩn trọng khi đăng nhập vào tài khoản WordPress từ lần sau khi kết nối với mạng Wi-Fi công cộng, bởi vì tài khoản của bạn có thể bị xâm nhập lúc nào mà ban không biết thậm chí kể cả việc bạn đã sử dụng xác thực dùng hai nhân tố.[![](https://securitydaily.net/wp-content/uploads/2014/05/wordpress-hacking-exploit-700x393.jpg)](https://securitydaily.net/wp-content/uploads/2014/05/wordpress-hacking-exploit.jpg)

Yan Zhu, một nhà nghiên cứu làm việc tại EFF chú ý rằng cá blog trên WordPress đang gửi đến người dùng các cookie xác thực dưới dạng văn bản chứ không phải là đang mã hóa nó. Vì vậy, một Script-Kiddie có thể xâm nhập vào tài khoản của bạn một cách dễ dàng để đánh cắp thông tin của bạn.

## TẤN CÔNG CÁC COOKIE XÁC THỰC ##
Khi người dùng WordPress đăng nhập vào tài khoản của họ, các máy chủ của WordPress.com thiết lập một trang web cookie với cái tên "wordpress_logged_in" trên trình duyệt của người dùng, Yan Zhu giải thích trên blog của mình. Anh chú ý rằng cookie xác thực này được gửi qua thô HTTP, theo một cách rất không an toàn.

Một người có thể bắt được HTTP cookies từ cùng một mạng Wi-Fi bằng việc sử dụng một vài công cụ chuyên dụng ví dụ như Firesheep, công cụ dò mạng. Sau đó cookie này được thêm vào bất cứ trình duyệt web nào để và hacker có thể đạt được quyền và truy cập trái phép đến các tài khoản WordPress của nạn nhân và theo cách này, một tài khoản trên WordPress.com dễ dàng bị tấn công.


Sử dụng các cookie bị đánh cắp, một kẻ tấn công có thể truy cập vào tài khoản WordPress của nạn nhân một cách tự động mà không cần bất kì một chứng nhận hay xác thực nào và thật may nắm là lỗ hổng này không cho phép những kẻ tấn công đổi mật khẩu trong tài khoản của người dùng, nhưng ai quan tâm đến vấn đề này? Vì những người bị ảnh hưởng không biết rằng tài khoản wordpress của họ đã bị xâm nhập

Yan cho biết: "Việc tấn công bằng việc đánh cắp cookie trên WP cho phép các hacker đăng nhập vào tài khoản người dùng với phiên kéo dài 3 năm. Không có kỳ hạn (thời điểm mà cookie tự động huỷ) cho cookie thận chí là khi bạn đã thoát ra".

Sử dụng kỹ thuật này, hacker có thể nhìn thấy các số liệu trên blog có thể đăng và sửa các bài báo về blog WordPres bị tấn công và các tài khoản giống tương tự cũng cho phép kẻ tấn công bình luận trên các blog khác bằng tài khoản của nạn nhân. Nghe có vẻ rất tồi tệ đúng không?

"Tuy nhiên một kẻ tấn công không thể thực hiện các nhiệm vụ quản trị blog với yêu cầu nhập lại mật khẩu để đăng nhập lại, nhưng vẫn là rất nguy hiểm với các thao tác thông thường như chỉnh sửa, xoá bài viết …" Yan Zhu giải thích.

Yan cũng khuyến cáo rằng WordPress nên thiết lập một cơ chế mã hoá an toàn trên các cookie nhạy cảm để chúng không bao giờ được gửi bằng văn bản.

Tin tốt là nếu bạn sở hữu một website WordPress với hộ trợ HTTPS toàn bộ, thì blog của bạn không bị tổn hại bởi các lỗ hổng cookie này.

Gần đây, các một lỗ hổng về cookie tương tụ đã được phát hiện bởi nhóm "The Hacker News" trên website của eBay, cho phép một kẻ tấn công xâm nhập vào các tài khoản eBay mà không cần chứng nhận thực  của nạn nhân.

Theo The Hacker News
