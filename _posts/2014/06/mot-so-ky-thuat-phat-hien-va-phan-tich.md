---
template: post
title: Một số kỹ thuật phát hiện và phân tích mã độc
date: "2014-06-03"
category: News
tags:
- Mã độc
- Virus
modified_time: '2016-04-05T12:40:10.398+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2118600843656995122
blogger_orig_url: https://blog.duyet.net/2014/06/mot-so-ky-thuat-phat-hien-va-phan-tich.html
slug: /2014/06/mot-so-ky-thuat-phat-hien-va-phan-tich.html
description: Trong bài này chúng ta sẽ tập trung đi sâu về một số thủ thuật, kỹ thuật được sử dụng để hỗ trợ trong quá trình phát hiện, phân tích và diệt mã độc.

---

Trong bài này chúng ta sẽ tập trung đi sâu về một số thủ thuật, kỹ thuật được sử dụng để hỗ trợ trong quá trình phát hiện, phân tích và diệt mã độc.

## Một số đặc tính của mã độc ##

Mã độc là một khái niệm chung dùng để chỉ các phần mềm độc hại được viết với mục đích lây lan phát tán trên hệ thống máy tính và internet nhằm thực hiện các hành vi bất hợp pháp nhằm vào người dùng cá nhân, cơ quan, tổ chức. Thực hiện các hành vi chuộc lợi cá nhân hoặc phá hoại. Tuỳ thuộc vào cơ chế, hình thức lây nhiễm và cách thức phân biệt mà mã độc được phân chia làm nhiều loại khác nhau: virus, trojan, backdoor, adware, spyware…

Như vậy, đặc điểm chung của mã độc là thực hiện các hành vi không hợp pháp hoặc có thể hợp pháp nhưng không theo ý muốn của người sử dụng máy tính. Ví dụ sau sẽ giúp phân loại các hành vi nguy hiểm của các mã độc thường xuyên thực hiện:

- Trojan: đặc tính phá hoại máy tính, thực hiện các hành vi phá hoại như: xoá file, làm đổ vỡ các chương trình thông thường, ngăn chặn người dùng kết nối internet…
- Worm: Giống trojan về hành vi phá hoại, tuy nhiên nó có thể tự nhân bản để thực hiện lây nhiễm qua nhiều máy tính
- Spyware: là phần mềm cài đặt trên máy tính người dùng nhằm thu thập các thông tin người dùng một cách bí mật, không được sự cho phép của người dùng.
- Adware: phần mềm quảng cáo, hỗ trợ quảng cáo, là các phần mềm tự động tải, pop up, hiển thị hình ảnh và các thông tin quảng cáo để ép người dùng đọc, xem các thông tin quảng cáo. Các phần mềm này không có tính phá hoại nhưng nó làm ảnh hưởng tới hiệu năng của thiết bị và gây khó chịu cho người dùng.
- Rootkit: là một kỹ thuật cho phép phần mềm có khả năng che giấu danh tính của bản thân nó trong hệ thống, các phần mềm antivirus từ đó nó có thể hỗ trợ các module khác tấn công, khai thác hệ thống.
- Ransomware: đây là phần mềm khi lây nhiễm vào máy tính nó sẽ kiểm soát hệ thống hoặc kiểm soát máy tính và yêu cầu nạn nhân phải trả tiền để có thể khôi phục lại điều khiển với hệ thống.
- Virus: là phần mềm có khả năng lây nhiễm trong cùng một hệ thống máy tính hoặc từ máy tính này sang máy tính khác dưới nhiều hình thức khác nhau. Quá trình lây lan được thực hiện qua hành vi lây file. Ngoài ra, virus cũng có thể thực hiện các hành vi phá hoại, lấy cắp thông tin…

## Kỹ thuật phát hiện mã độc ##
Như đã giới thiệu ở trên, tất cả các mã độc đều có các hành vi tương tác tới hệ thống và các tài nguyên trong hệ thống. Do đó, để có thể phát hiện ra mã độc cần thực hiện việc theo dõi các tài nguyên của hệ thống đồng thời sử dụng các phần mềm diệt virus để quét và diệt.

- Quét virus: các phần mềm khi đã nhận diện được mẫu thì hoàn toàn có thể làm sạch virus khỏi máy tính.
- Kiểm tra toàn bộ thao tác ghi đĩa
- Phát hiện nguồn tấn công: không phải hiện tượng bất thường nào cũng do virus gây ra, cần phân biệt giữa virus và không phải virus.
- Kiểm tra sự bất thường của các tiến trình trong hệ thống.
- Kiểm tra sự thay đổi của file: xóa file, thay thể file mới hoặc thuộc tính của file bị thay đổi .
- Kiểm tra sự thay đổi, tác động lên hệ thống registry, các file hệ thống
- Luôn cập nhật phần mềm antivirus trong máy

[![Một số kỹ thuật phát hiện và phân tích mã độc](https://securitydaily.net/wp-content/uploads/2014/06/mohinh-700x464.png)](https://securitydaily.net/wp-content/uploads/2014/06/mohinh.png)

## Kỹ thuật phòng tránh mã độc ##
Phòng tránh mã độc không chỉ dựa vào các phần mềm diệt virus mà còn liên quan tới cả nhận thức của người dùng. Một cách tổng quan nhất, để thực hiện phòng chống mã độc nên tuân thủ một số biện pháp sau:

- Sử dụng phần mềm diệt virus chính hãng
- Không nên mở trực tiếp USB bằng cách chọn ổ đĩa rồi nhấn phím Enter, hoặc nhấp đôi chuột vào biểu tượng mà nên bấm chuột phải rồi click vào explore.
- Không nên mở các file đính kèm không rõ nguồn gốc, đăc biệt là các file thực thi (các file có đuôi .exe…).
- Không nên truy cập vào các trang web đen, các trang web độc hại, có nội dung không lành mạnh.
- Thường xuyên cập nhật phần mềm diệt virus trên máy tính.
- Chú ý cẩn thận khi tải, cài đặt các phần mềm từ trên internet

## Kỹ thuật phân tích, diệt mã độc ##
Việc phát hiện, phân tích mã độc đòi hỏi quá trình theo dõi liên tục và lặp đi lặp lại. Nếu thực hiện trên hệ thống thiết bị thật sẽ mất rất nhiều công sức và không thể kiểm soát một cách chặt chẽ và rất khó khăn để thực hiện một cách liền mạch. Vì trong quá trình phát hiện và phân tích, các chương trình mã độc có thể làm chết toàn bộ hệ thống, cô lập debugger và disasembler, trong trường hợp đó muốn tiếp tục phân tích cần khôi phục lại toàn bộ hệ thống. Đối với hệ thống thật, quá trình đó mất rất nhiều thời gian. Do đó, để phát hiện, phân tích và diệt mã độc, máy ảo là một môi trường rất lý tưởng, mặc dù trong một số trường hợp, các mã độc có thể phát hiện ra máy ảo và dừng chạy chương trình, tuy nhiên trường hợp này hoàn toàn có thể khắc phục được bằng một số thay đổi trong mã nhị phân của mã độc.

Như vậy, cần thiết lập một cấu hình máy ảo với đầy đủ các bộ công cụ cần thiết phục vụ cho quá trình theo dõi, phát hiện, phân tích và diệt. Qua quá trình làm việc chúng tôi nhận thấy hiện nay đa phần các mẫu virus vẫn sử dụng nền tảng 32 bit, do đó, một môi trường lý tưởng sử dụng cho trường hợp này là cài đặt một máy ảo sử dụng hệ điều hành Windows XP 32 bit, trên máy tính này, chúng ta cài đặt các bộ công cụ sau:

- Nhóm các công cụ phục vụ mục đích theo dõi, giám sát: TCPView, AutoRun, ProcessMon, WireShark
- Nhóm các công cụ phục vụ phân tích: IDA Pro, OllyDBG, LordPE, Hex Editor Neo, Notepad++
- Nhóm các công cụ môi trường: trình duyệt (Chrome, Firefox), bộ công cụ microsoft word, outlook…
- Danh sách một số file mồi: notepad.exe, calc.exe, cmd.exe, một số file cài đặt của notepad++, python, hex editor…

Sau khi cài đặt đầy đủ các bộ công cụ trên, chúng ta tạo một bản snapshot cho cấu hình này để phục vụ cho các lần theo dõi, kiểm tra, phát hiện và phân tích mã độc.
