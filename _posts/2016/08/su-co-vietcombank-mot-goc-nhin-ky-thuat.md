---
template: post
title: Sự cố Vietcombank, một góc nhìn kỹ thuật
date: "2016-08-18"
author: Van-Duyet Le
tags:
- SmartOTP
- OTP
- Vietcombank
- VnSecurity
- Thaidn
- Thai
- Bảo mật
- VCB
modified_time: '2016-08-18T09:15:09.720+07:00'
thumbnail: https://3.bp.blogspot.com/-5A7qKw_phn8/V7UXD6zsqHI/AAAAAAAAbs8/tlfCE3ExbbE6bwK-8Np0qudqLAOjNDSKQCK4B/s1600/sitegiamao.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2837763184490095351
blogger_orig_url: https://blog.duyet.net/2016/08/su-co-vietcombank-mot-goc-nhin-ky-thuat.html
slug: /2016/08/su-co-vietcombank-mot-goc-nhin-ky-thuat.html
category: News
description: "Bài viết gốc đăng tại VnSecurity"
fbCommentUrl: none
---

Bài viết gốc đăng tại VnSecurity: www.vnsecurity.net/research/2016/08/13/Ve-su-vu-khach-hang-Vietcombank-bi-mat-tien.html

Cập nhật 16/08/2016: vì hiểu lầm trong trao đổi giữa hai bên cho nên chúng tôi đã không nhận được tài khoản thử nghiệm, chứ không phải Vietcombank không muốn gửi. Chúng tôi giữ nguyên ý kiến Smart OTP là một thiết kế không tốt, cần phải được điều chỉnh. Dẫu vậy cũng cần phải nói rõ chúng tôi không có lý do để tin rằng lỗ hổng mà chúng tôi phát hiện vẫn có thể khai thác được. Các kỹ sư Vietcombank đã phản hồi rất tích cực, chuyên nghiệp và cầu thị. Chúng tôi đã từng chứng kiến kỹ sư ở Silicon Valley thiết kế các giao thức tệ hơn Smart OTP rất nhiều và không trả lời khi chúng tôi liên lạc báo lỗi. Thiếu kỹ sư chuyên trách an toàn thông tin là căn bệnh lâu năm của Việt Nam, gần đây bắt đầu hành hạ "người bệnh", biểu hiện qua các sự cố bảo mật liên tục. Trao đổi với nhóm kỹ sư Vietcombank chúng tôi nhận thấy đây là một đội ngũ có chuyên môn, chúng tôi tin rằng họ có đủ khả năng cải tiến Smart OTP cũng như đảm bảo an toàn thông tin cho Vietcombank và các khách hàng của ngân hàng. 
Nhiều ngày qua các phương tiện thông tin truyền thông tại Việt Nam đăng tải hàng loạt thông tin về việc [một khách hàng của Vietcombank bị đánh cắp hơn nửa tỉ đồng](http://tuoitre.vn/tin/kinh-te/20160812/chu-the-vietcombank-bong-dung-mat-500-trieu-dong-do-dau/1153759.html) [1]. Tin tức này gây hoang mang cho cộng đồng, nhất là các cá nhân và đơn vị sử dụng ngân hàng điện tử (Internet Banking, Mobile Banking, v.v) để giao dịch.

Nhằm góp một tiếng nói độc lập về sự việc này, nhóm nghiên cứu VNSECURITY đã thẩm định quy trình giao dịch trên ngân hàng điện tử của Vietcombank. Trong bài viết này chúng tôi đưa ra hai phương án mà kẻ xấu đã thực hiện để trộm tiền. Chúng tôi đánh giá phương án phishing là khả dĩ nhất. Ngoài ra chúng tôi cũng đã phát hiện một lỗ hổng trong thiết kế của Smart OTP. Chúng tôi không có bằng chứng mạnh mẽ để chứng minh đây là lỗ hổng mà kẻ xấu đã sử dụng, nhưng chúng tôi hi vọng, thông qua các phân tích kỹ thuật, Smart OTP và các sản phẩm Internet Banking khác ở Vietcombank cũng như các ngân hàng khác sẽ được điều chỉnh để an toàn hơn và người dùng cũng hiểu hơn về những rủi ro mà họ đang chịu khi sử dụng các sản phẩm và dịch vụ Internet Banking. Trong bài viết tiếp theo, chúng tôi sẽ bàn về cách triển khai một hệ thống xác thực hai lớp hiện đại chống lại được tấn công phishing.

##  Giải pháp xác thực 2 lớp của Vietcombank ##
Trước hết, chúng tôi xin giới thiệu về các bước cơ bản mà một giao dịch chuyển tiền điện tử phải tuân thủ:

1. Người dùng đăng nhập bằng tên đăng nhập và mật khẩu.
2. Tạo giao dịch.
3. Nhận và xác thực one-time password (OTP, mật khẩu dùng một lần, còn gọi là mã xác thực).
4. Hoàn tất giao dịch.

Vietcombank cung cấp hai sản phẩm OTP: SMS và Smart OTP. Smart OTP là một phần mềm sinh mã OTP, khách hàng tải về cài đặt trên điện thoại di động. Để kích hoạt dịch vụ Smart OTP, khách hàng phải xác thực một lần duy nhất bằng SMS OTP.

Theo như đề cập ở trên, nửa đêm ngày 4 rạng sáng ngày 5, nạn nhân bị đánh cắp hơn nửa tỉ đồng, mà không hề nhận được SMS OTP. Vietcombank và C50 cho rằng kẻ xấu bằng cách nào đó đã [kích hoạt thành công dịch vụ Smart OTP của nạn nhân](http://infonet.vn/da-tim-ra-nguyen-nhan-chu-the-vietcombank-mat-500-trieu-dong-post206166.info) [4].

## Hướng tấn công số 1: phishing ##
Đây là hướng tấn công đơn giản và dễ thực hiện nhất. Tại một thời điểm nào đó trước khi nạn nhân bị rút nửa tỉ đồng, kẻ xấu đã:

1. Lừa nạn nhân vào trang web giả mạo để lấy thông tin tên người dùng và mật khẩu.
2. Tiếp tục lừa nạn nhân trên giao diện trang web giả mạo để lấy SMS OTP.
3. Sử dụng SMS OTP để âm thầm kích hoạt Smart OTP.
4. Vì Smart OTP có thể sử dụng song song với SMS OTP, nạn nhân không hề biết tài khoản đã hoàn toàn bị kiểm soát.

Chúng tôi đánh giá khả năng cao đây là cách mà kẻ xấu đã thực hiện để trộm tiền của nạn nhân. Có những phương án khác để tấn công, nhưng kẻ tấn công thường chọn phương án đơn giản và dễ thực hiện nhất. Chúng tôi không thấy có căn cứ kẻ tấn công bằng cách khai thác lỗ hổng mà chúng tôi phát hiện cũng như các điểm yếu đã được biết đến từ lâu của SMS OTP.

![](https://3.bp.blogspot.com/-5A7qKw_phn8/V7UXD6zsqHI/AAAAAAAAbs8/tlfCE3ExbbE6bwK-8Np0qudqLAOjNDSKQCK4B/s1600/sitegiamao.png)

Hình ảnh cung cấp bởi C50 cho thấy website giả mạo yêu cầu nạn nhân nhập vào mã OTP.

## Hướng tấn công số 2: khai thác lỗ hổng của Smart OTP ##

Vì tò mò, chúng tôi đã tiến hành kiểm tra ứng dụng Smart OTP và phát hiện một lỗ hổng. Lợi dụng lỗ hổng này, chỉ cần biết số điện thoại của nạn nhân, kẻ xấu có thể kích hoạt Smart OTP của các khách hàng chưa đăng ký dịch vụ Smart OTP. Phương án tấn công như sau:

1. Lừa nạn nhân vào trang web giả mạo để lấy thông tin tên người dùng và mật khẩu.
2. Sử dụng tên người dùng và mật khẩu để truy vấn số điện thoại của nạn nhân trên trang Internet Banking của Vietcombank.
3. Khai thác lỗ hổng để kích hoạt Smart OTP.

Để hiểu hơn về quy trình kích hoạt Smart OTP và phương thức tấn công, xin mời tham khảo sơ đồ bên dưới.

![](https://2.bp.blogspot.com/--Wj4VlOYaBk/V7UXTpoECXI/AAAAAAAAbtE/Fot8qk3hfAoUKSWu8KpESgCzNArxb5YyQCK4B/s1600/tancong.png)

Tóm tắt quy trình đăng ký dịch vụ Smart OTP:

1. Phần mềm Smart OTP gửi số điện thoại và địa chỉ WiFi MAC address của điện thoại đến máy chủ của VCB.
2. Nếu số điện thoại chưa đăng ký, máy chủ VCB sẽ thực hiện hai thao tác:

- Gửi mã xác thực, gọi là N, đến số điện thoại.
- Gửi `Encrypt(key=MD5(MD5(N), Y))` về cho ứng dụng, trong đó Y là một chuỗi mà chúng tôi chưa có điều kiện được xác định chính xác. Sau khi trao đổi với Vietcombank, họ cho biết Y là một chuỗi ngẫu nhiên 16 bytes.

3. Phần mềm Smart OTP nhận mã xác thực từ người dùng và sử dụng nó để giải mã lấy giá trị Y. Sau đó ứng dụng dùng khóa Y để mã hóa N và gửi lại cho máy chủ VCB.
4. Lúc này máy chủ sẽ kiểm tra, nếu thông tin chính xác, máy chủ sẽ trả về một số thông tin, trong đó quan trọng nhất là thông số được đặt tên XFACTOR.
5. Tất cả OTP được tạo ra từ XFACTOR. Ai có XFACTOR có thể tự tạo OTP mà không cần thông qua máy chủ VCB nữa.

Lỗ hổng nằm ở bước thứ 2. Để khai thác, kẻ tấn công có thể làm như sau:

1. Gửi số điện thoại của nạn nhân và một địa chỉ MAC bất kỳ đến máy chủ của VCB.
2. Lúc này máy chủ sẽ trả về `R = Encrypt(key = MD5(MD5(N)), Y)`. Vì N là một chuỗi rất ngắn, chỉ có 4 chữ số, do đó kẻ tấn công có thể dò N.

- Với mỗi giá trị dự đoán `N'` kẻ tấn công sẽ tính `Y' = Decrypt(key=MD5(N’), data=R)`. Tùy thuộc vào biên giá trị của Y mà quá trình dò này có thể thực hiện offline. Nếu Y là một chuỗi hoàn toàn ngẫu nhiên, kẻ tấn công có thể sử dụng Y' và N' để thực hiện bước 3 và dựa vào phản hồi của máy chủ VCB để tìm N' = N. 
- Máy chủ VCB có thể ngăn chặn sử dụng Y' và N' để dò N, nhưng chúng tôi không có điều kiện để xác minh.

3. Sau khi đã có N, kẻ tấn công có thể thực hiện tiếp các bước 3, 4 và 5.

Tấn công như thế này là một tấn công quen thuộc. Chúng tôi đã từng đề cập trong [bài phân tích phần mềm BTalk của BKAV](http://www.vnsecurity.net/news/2014/05/06/btalk-part-1.html) [3].

Đại diện Vietcombank xác nhận giao thức mà chúng tôi mô tả ở trên là chính xác (tại thời điểm 14:30 ngày 15/8/2016, chúng tôi nhận thấy Vietcombank đã đổi giao thức, cho nên thông tin ở trên có thể không còn chính xác). Lưu ý chúng tôi xác định được giao thức này bằng cách dịch ngược mã phần mềm Smart OTP, hoàn toàn không tác động đến máy chủ của Vietcombank. Trong quá trình thẩm định Smart OTP vì không có tài khoản VCB và vì hệ thống Smart OTP liên tục thay đổi, chúng tôi không có điều kiện thử nghiệm để biết lỗ hổng mà chúng tôi phát hiện nguy hiểm đến mức nào. Vì lo ngại đây là lỗ hổng mà kẻ tấn công sử dụng để đánh cắp tiền của khách hàng Vietcombank, chúng tôi gửi thông tin cho Vietcombank trước khi có kết luận chính thức.

 Sau khi liên lạc được với Vietcombank, đại diện ngân hàng cung cấp thêm một số thông tin về giao thức Smart OTP. Theo đó, có khả năng lỗ hổng mà chúng tôi phát hiện khó khai thác.

 Vì

- không có tài khoản thử nghiệm (Vietcombank hứa sẽ cung cấp tài khoản thử nghiệm, nhưng chúng tôi không nhận được),
- hệ thống Smart OTP có nhiều thay đổi kể từ khi chúng tôi gửi thông tin cho Vietcombank,
- không có thời gian để tiếp tục công việc thiện nguyện này

cho nên cho đến lúc đang viết những dòng này chúng tôi vẫn chưa thể kết luận chính xác. Chúng tôi nghĩ rằng nếu lỗ hổng khó khai thác, đó là do may mắn, chứ không phải do chủ ý của người thiết kế Smart OTP.

Góc chuyên sâu: tại sao chúng tôi nghĩ rằng lỗ hổng khó khai thác là nằm ngoài dự kiến của người thiết kế Smart OTP? Smart OTP sử dụng thuật toán mã hóa TripleDES/ECB/ZeroBytePadding để mã hóa dữ liệu. Đây là một thuật toán lỗi thời và không an toàn, nhưng kỳ thực nếu đổi thuật toán này bằng các thuật toán hiện đại hơn, an toàn hơn (ví dụ như AES/CBC/PKCS5Padding) thì Smart OTP sẽ sụp đổ. 

Thuật toán TripleDES/ECB/ZeroBytePadding được sử dụng để mã hóa chuỗi Y mà chúng tôi mô tả ở trên (xem sơ đồ). Để có thể dò được N, chúng tôi phải biết giá trị nào của chuỗi Y là giá trị đúng. Trường hợp khó nhất là Y là một chuỗi hoàn toàn ngẫu nhiên có chiều dài là bội của 8. Sau khi chúng tôi gửi báo cáo, Vietcombank cho biết Y đúng là một chuỗi ngẫu nhiên có chiều dài là bội của 8. Nếu Y không có đúng cả hai điều kiện này, chỉ cần vài giây là có thể tìm được N.

 Thư viện phần mềm mã hóa mà Smart OTP sử dụng không bồi thêm một khối các số 0 vào cuối Y, khi Y có chiều dài là bội của 8. Nếu như Smart OTP sử dụng [Bouncy Castle](https://www.bouncycastle.org/) [6], một thư viện mã hóa rất phổ biến trên Android, phía cuối của Y sẽ có một khối toàn các số 0 và khi đó chỉ cần vài giây là có thể tìm được N.

Chúng tôi tin rằng hai đặc điểm kỹ thuật trên đây không phải được thiết kế một cách có chủ đích để phòng ngừa tấn công mà chúng tôi phát hiện, bởi nếu quả thật như thế thì người thiết kế quá chủ quan. Ngoài ra bất kể Y được tạo ra sao, tùy thuộc vào cách mà máy chủ Smart OTP thực hiện bước số 4 mà kẻ tấn công có thể sử dụng nó để dò ra N. Vietcombank cho rằng việc dò này là không thể thực hiện được, vì xác suất đoán trúng chỉ là 3/10.000. Chúng tôi thấy nhận xét này hợp lý, nhưng vì không có tài khoản để thử nghiệm trực tiếp nên chúng tôi không xác nhận được. 

Thiết kế của Smart OTP rất mong manh, có nhiều quyết định khó hiểu, đi ngược lại với những nguyên tắc cơ bản của an toàn thông tin và mật mã học hiện đại. Thiết kế này vừa thừa vừa thiếu. Thừa vì có những bước vừa không cần thiết vừa tạo lỗ hổng, ví dụ như bước sử dụng N để mã hóa Y. Thiếu vì không đảm bảo được những yêu cầu cơ bản của một giao thức bảo mật. Thứ nhất, để bảo vệ kênh truyền dữ liệu giữa máy chủ và phần mềm, Smart OTP sử dụng giao thức TLS, nhưng phần mềm lại hoàn toàn không kiểm tra chứng chỉ của máy chủ. Thứ hai, thuật toán TripleDES/ECB/ZeroBytePadding không đảm bảo được sự toàn vẹn của dữ liệu. Thứ ba, một thiết kế hiện đại phải đảm bảo tính [forward-secrecy](https://en.wikipedia.org/wiki/Forward_secrecy) [5] của dữ liệu, nhưng thiết kế của Smart OTP không làm được như vậy.

Thiết kế giao thức bảo mật là công việc nên dành cho các chuyên gia. Sau khi đã được thiết kế, giao thức chỉ được chấp nhận và đưa vào sử dụng khi có sự thẩm định độc lập của các chuyên gia khác. Ngay cả các giao thức do chuyên gia thiết kế và thẩm định như SSL/TLS còn có nhiều vấn đề, thành ra có rất ít hi vọng cho những giao thức nghiệp dư. Thật tế vấn đề mà Smart OTP muốn giải quyết đã được thế giới giải quyết từ lâu, chúng tôi không hiểu tại sao Vietcombank không sử dụng lại những kết quả này mà phải "phát minh lại cái bánh xe".

Trao đổi với chúng tôi đại diện Vietcombank đồng ý rằng giao thức mà họ đang sử dụng không phải là một giao thức đúng chuẩn và sẽ xem xét phương án thay thế. Chúng tôi đánh giá đại diện Vietcombank (mới chuyển về thì phải :) là người có chuyên môn tốt nên hi vọng thời gian tới Smart OTP sẽ có một thiết kế mới, an toàn và đáng tin cậy hơn, và thiết kế này sẽ được thẩm định độc lập bởi các chuyên gia trong ngành.

Trong phần tiếp theo của loạt bài này, chúng tôi sẽ bàn về cách thiết kế một hệ thống xác thực hai lớp an toàn.

## Nhật ký phát hiện và thông báo lỗ hổng ##
Theo thông lệ quốc tế, chúng tôi công bố toàn bộ nhật ký phát hiện và thông báo lỗ hổng (ngày giờ ước lượng theo giờ VN)

- 22:30, 12/8/2016: tải app Smart APK về.
- 02:30, 13/8/2016: tìm thấy lỗ hổng thông qua việc dịch ngược app.
- 11:39, 13/8/2016: gửi email thông báo lỗ hổng đến địa chỉ webmaster@vietcombank.com.vn. Đây là địa chỉ email duy nhất mà VNSECURITY tìm thấy trên website http://www.vietcombank.com.vn. Trang "Bảo mật" trên website này "đang được xây dựng".
- 11:40, 13/8/2016: nhận được thông báo địa chỉ webmaster@vietcombank.com.vn không tồn tại.
- 11:55, 13/8/2016: hỏi thông tin liên lạc của Vietcombank trên diễn đàn Viet-InfoSec.
- 12:40, 13/8/2016: một thành viên Viet-InfoSec cung cấp địa chỉ email của một cán bộ trung tâm CNTT Vietcombank.
- 12:48, 13/8/2016: gửi báo cáo lỗ hổng đến Vietcombank.
- 14:30, 13/8/2016: Vietcombank trả lời đã nhận được thông tin, sẽ trao đổi nội bộ rồi báo lại sớm. Vietcombank hỏi có phải VNSECURITY đã reverse engineer phần mềm Smart OTP.
- 14:39, 13/8/2016: xác nhận với Vietcombank lỗ hổng được phát hiện bằng phương thức reverse engineering.
- 17:04, 13/08/2016: công bố phiên bản đầu tiên của bài viết này, thông tin chi tiết của lỗ hổng được giữ kín.
- 19:15, 13/08/2016: nhận được yêu cầu gián tiếp từ phía Vietcombank đề nghị gỡ bỏ bài viết này xuống. Đề nghị Vietcombank trực tiếp liên lạc qua email.
- 19:40, 13/08/2016: Vietcombank trả lời qua email, cảm ơn VNSECURITY, xác nhận giao thức được mô tả là chính xác, cung cấp thêm một số thông tin, đề nghị VNSECURITY kiểm tra lại.
- 20:03, 13/08/2016: trả lời Vietcombank, chỉ ra sự mong manh dễ vỡ của Smart OTP, bất kể lỗ hổng có khai thác được hay không. Đề nghị Vietcombank cung cấp tài khoản để kiểm tra.
- 20:18, 13/08/2016: nói thêm cho Vietcombank biết cách thiết kế một giao thức OTP an toàn.
- 21:30, 13/08/2016: Vietcombank hứa đến sáng thứ hai ngày 15/08/2016 sẽ cung cấp tài khoản thử nghiệm. Cho đến thời điểm bài viết này được công bố, VNSECURITY vẫn chưa nhận được tài khoản thử nghiệm.
- 23:52, 13/08/2016: Vietcombank xác nhận giao thức Smart OTP không đúng chuẩn và sẽ xem xét phương án thay thế. Vietcombank cho rằng đưa ra giả thuyết về lỗ hổng là hơi sớm.
- 00:22, 14/08/2016: Vietcombank cung cấp thêm thông tin về Y và số lần người dùng có thể thực hiện bước số 3 trong giao thức Smart OTP.
- 00:28, 14/08/2016: một đại diện khác của Vietcombank xác nhận thông tin về Y và số lần người dùng có thể thực hiện bước số 3 trong giao thức Smart OTP. Đề nghị VNSECURITY hỗ trợ "trong thời điểm nhạy cảm này" (nguyên văn).
- 00:45, 14/08/2016: nhận thấy máy chủ Smart OTP đã có một số thay đổi, đề nghị Vietcombank cho biết thêm thông tin về tình trạng hiện tại.
- 00:55, 14/08/2016: Vietcombank cho biết đã thay đổi quy trình đăng ký Smart OTP theo yêu cầu của ngân hàng nhà nước. Vietcombank tái xác nhận sẽ cung cấp tài khoản thử nghiệm vào thứ hai 15/08/2016.
- 00:57, 14/08/2016: cập nhật bài viết này, ghi chú "việc khai thác lỗ hổng với hệ thống hiện tại là rất khó có thể thành công".
- 15:36, 14/08/2016: Vietcombank xác nhận thêm lần nữa Smart OTP vẫn đang hoạt động, chỉ có một chút thay đổi về quy trình đăng ký, kích hoạt dịch vụ. Đề nghị VNSECURITY hỗ trợ chống phishing.
- 14:30, 15/08/2016: phát hiện Vietcombank đã thay đổi giao thức Smart OTP trên máy chủ, nâng cấp từ phiên bản "22" lên phiên bản "24". VNSECURITY không được thông báo trước về những thay đổi này.
- 01:30, 16/08/2016: thông báo cho Vietcombank biết VNSECURITY đã dừng việc thẩm  định Smart OTP vì không có đủ thời gian để chạy theo những thay đổi không báo trước của Vietcombank. Cảm ơn Vietcombank vì những trao đổi rất cởi mở và cho biết dự định VNSECURITY sẽ công bố thông tin về lỗ hổng trong vài ngày tới.
- 07:30, 16/08/2016: cập nhật bài viết này với thông tin chi tiết về lỗ hổng.

tienpp, thaidn, Kha Nguyen - VNSecurity

[1] [http://tuoitre.vn/tin/kinh-te/20160812/chu-the-vietcombank-bong-dung-mat-500-trieu-dong-do-dau/1153759.html](http://tuoitre.vn/tin/kinh-te/20160812/chu-the-vietcombank-bong-dung-mat-500-trieu-dong-do-dau/1153759.html)

[2] [http://motthegioi.vn/kinh-te-c-67/thi-truong-kinh-doanh-c-97/tai-khoan-tai-vietcombank-bong-mat-500-trieu-trong-dem-40267.html](http://motthegioi.vn/kinh-te-c-67/thi-truong-kinh-doanh-c-97/tai-khoan-tai-vietcombank-bong-mat-500-trieu-trong-dem-40267.html)

[3] [http://www.vnsecurity.net/news/2014/05/06/btalk-part-1.html](http://www.vnsecurity.net/news/2014/05/06/btalk-part-1.html)

[4] [http://infonet.vn/da-tim-ra-nguyen-nhan-chu-the-vietcombank-mat-500-trieu-dong-post206166.info](http://infonet.vn/da-tim-ra-nguyen-nhan-chu-the-vietcombank-mat-500-trieu-dong-post206166.info)

[5] [https://en.wikipedia.org/wiki/Forward_secrecy](https://en.wikipedia.org/wiki/Forward_secrecy)

[6] [https://www.bouncycastle.org](https://www.bouncycastle.org/)
