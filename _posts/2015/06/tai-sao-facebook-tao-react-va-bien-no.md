---
template: post
title: Tại sao Facebook tạo React và biến nó thành nguồn mở ?
date: "2015-06-30"
author: Van-Duyet Le
tags:
- React
- facebook
modified_time: '2015-06-30T23:31:35.142+07:00'
thumbnail: https://2.bp.blogspot.com/-fyYlYdrDzY8/VZIKLpbzgzI/AAAAAAAAClA/A14BLEYp2Kg/s1600/2015_06_20_2a3229e9d8.jpeg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1893692369712735538
blogger_orig_url: https://blog.duyet.net/2015/06/tai-sao-facebook-tao-react-va-bien-no.html
slug: /2015/06/tai-sao-facebook-tao-react-va-bien-no.html
category: News
description: ReactJS là một Javascript library được phát triển bởi Facebook đang ngày càng trở nên phổ biến hơn. Hiện tại các tài liệu hướng dẫn về cách sử dụng ReactJS trên mạng đã có rất nhiều. Trong bài viết này mình tập trung về lí do mà Facebook đã tạo ra React.
fbCommentUrl: none

---

ReactJS là một Javascript library được phát triển bởi Facebook đang ngày càng trở nên phổ biến hơn. Hiện tại các tài liệu hướng dẫn về cách sử dụng ReactJS trên mạng đã có rất nhiều. Trong bài viết này mình tập trung về lí do mà Facebook đã tạo ra React.

![](https://2.bp.blogspot.com/-fyYlYdrDzY8/VZIKLpbzgzI/AAAAAAAAClA/A14BLEYp2Kg/s1600/2015_06_20_2a3229e9d8.jpeg)

## Một chút về bối cảnh

Vào năm 2010, Facebook đã release một phiên bản mở rộng cho PHP gọi là XHP. XHP được xây dựng với mục đích chủ yếu nhằm hạn chế lỗi bảo mật XSS (Cross Site Scripting). Nói thêm về lỗi bảo mật này, đó là lỗi mà lập trình viên echo trực tiếp các giá trị mà người dùng nhập vào không thông qua mã hoá. Thông thường, các hacker sẽ nhập các đoạn Javascript vào, rồi sử dụng trang web đã được nhúng mã đó để đánh cắp thông tin của người dùng mở trang đó lên. Và XHP đã giúp lập trình viên dễ dàng loại bỏ những input nguy hiểm đó.

XHP đã trở nên rất hữu dụng cho Facebook khi đó. Tuy nhiên, có một vấn đề mà XHP chưa giải quyết được: đó là những ứng dụng web client thường xuyên phải tương tác với server. Nếu làm theo cách truyền thống thì rất phức tạp, đặc biệt với những trang có rất nhiều biểu mẫu như Facebook Ads Group. Và rồi một kĩ sư của Facebook đã thuyết phục sếp của mình cho phép mang XHP lên browser bằng cách sử dụng Javascript. Và sau 6 tháng công việc của kĩ sư đó đã hoàn thành, và thành quả là ReactJS.

Sau khi ra đời, ReactJS đã nhanh chóng trở nên phổ biến nhờ hiệu năng cực tốt cũng như cấu trúc rất rõ ràng, dễ phát triển, bảo trì. Nếu bạn là một người có kinh nghiệm làm việc với Javascript, bạn sẽ hiểu rằng việc tương tác với DOM là một việc tốn rất nhiều tài nguyên xử lí. Tức là nếu bạn thay đổi nội dung các DOM node thì browser cần phải render nó lại, và việc đó tốn khá nặng nề, đặc biệt với các web application phức tạp, có hàng ngàn elements. Và ReactJS là framework đầu tiên đã đi theo lối tiếp cận: nếu tối ưu được việc xử lí DOM thì sẽ tạo ra được một library có hiệu năng tốt. Giải pháp của nó là lưu lại trạng thái (state) của application, và chỉ render ra browser khi state thay đổi. Lập trình viên tương tác với React bằng cách đưa ra những state cần thay đổi và React sẽ tối ưu render cho bạn.

## Lợi ích mà React mang lại cho Facebook

Facebook là một mạng xã hội lớn nhất thế giới, vì vậy những đột phá của React đã mang lại rất nhiều lợi ích cho công ty. Sau đây là những ưu điểm chính của React:

### React không sử dụng template
Thông thường, việc thiết kế giao diện cho web applications thường sử dụng các HTML template. Tuy nhiên, React tiếp cận khác đi bằng cách sử dụng những components. Điều đó có nghĩa React sử dụng "ngôn ngữ lập trình thực sự" để render view thay vì ngôn ngữ mark-up như HTML. Điều này là một ưu điểm lớn bởi các lí do sau:

- Javascript (ngôn ngữ được dùng bởi React) là một ngôn ngữ mềm dẻo và mạnh mẽ với khả năng xây dựng các đối tượng trừu tượng, rất phù hợp để xây dựng một ứng dụng lớn.
- Bằng cách kết hợp markup với phần xử lí view logic tương ứng của nó, React thực sự giúp view có thể dễ dàng mở rộng hoặc bảo trì.
- Việc chuyển markup vào trong Javascript giúp hạn chế được lỗi bảo mật XSS

### React thực sự hữu dụng khi dữ liệu thay đổi liên tục ###
Với những ứng dụng Javascript truyền thống, bạn cần phải theo dõi xem dữ liệu nào đã thay đổi, rồi thay đổi DOM tương ứng để đảm bảo nó luôn cật nhật. React tiếp cận theo một hướng khác. Khi một component được khởi tạo, phương thức render được gọi để tạo ra một lightweight representation cho view. Khi dữ liệu thay đổi, phương thức render lại được gọi. Và để tối ưu, React so sánh sự thay đổi (diff) giữa các giá trị của lần render này với lần render trước, và cập nhật ít thay đổi nhất đến DOM.
Ngoài ra, nhờ React, Facebook đã làm được rất nhiều điều khác

### Facebook đã tạo ra một dynamic chart mà render ra canvas thay vì HTML ###

- Instagram là một ứng dụng web dạng single-page, được xây dựng hoàn toàn bởi React và Backbone.Router
- Gần đây Facebook đã tạo ra React Native, giúp viết các ứng dụng native trên điện thoại iOS, Android bằng Javascript. Trong đó app Facebook Groups là một ví dụ.

## Tại sao Facebook lại biến nó thành nguồn mở? ##

Ở Facebook, sứ mệnh của công ty là tạo nên một thế giới cởi mở hơn và được kết nối (more open and connected). Và họ muốn thể hiện sứ mệnh đó thông qua mã nguồn mở. Họ nhận thấy rằng, những vấn đề mà họ gặp phải trong việc phát triển web application cũng là vấn đề của rất nhiều các công ty công nghệ khác. Và họ muốn đóng góp nhiều nhất có thể để giúp đỡ cộng đồng, cũng như nhận được sự hỗ trợ từ cộng đồng để cùng nhau giải quyết những thách thức chung.

## Tham khảo ##

- [http://facebook.github.io/react/blog/2013/06/05/why-react.html](http://facebook.github.io/react/blog/2013/06/05/why-react.html)
- [http://thenewstack.io/javascripts-history-and-how-it-led-to-reactjs/](http://thenewstack.io/javascripts-history-and-how-it-led-to-reactjs/)
- [https://code.facebook.com/posts/1014532261909640/react-native-bringing-modern-web-techniques-to-mobile/](https://code.facebook.com/posts/1014532261909640/react-native-bringing-modern-web-techniques-to-mobile/)
- [https://www.youtube.com/watch?v=KVZ-P-ZI6W4](https://www.youtube.com/watch?v=KVZ-P-ZI6W4)

Theo viblo / [https://viblo.asia/hieubm/posts/wpVYRPgmv4ng](https://viblo.asia/hieubm/posts/wpVYRPgmv4ng)
