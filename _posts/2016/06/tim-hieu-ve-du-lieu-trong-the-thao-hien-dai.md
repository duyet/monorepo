---
template: post
title: Tìm hiểu về dữ liệu trong thể thao hiện đại
date: "2016-06-29"
author: Van-Duyet Le
tags:
- Sưu tầm
- Hệ thống thông tin
- Information System
- IS
- Source
- Data Mining
modified_time: '2016-06-29T23:08:54.053+07:00'
thumbnail: https://2.bp.blogspot.com/-o_snpmTzvwk/V3PXfZhLszI/AAAAAAAAYmY/htoLHqxBBPEJaFooDzx9zqa_9X0BzNJcwCK4B/s1600/ecoblader-d%25E1%25BB%25AF-li%25E1%25BB%2587u-696x478.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1031693420048459047
blogger_orig_url: https://blog.duyet.net/2016/06/tim-hieu-ve-du-lieu-trong-the-thao-hien-dai.html
slug: /2016/06/tim-hieu-ve-du-lieu-trong-the-thao-hien-dai.html
category: Data
description: "Tìm hiểu về dữ liệu trong thể thao hiện đại. Một trong những câu trả lời cho câu hỏi: Dân hệ thống thông tin thì làm gì?"
fbCommentUrl: http://blog.duyetdev.com/2016/06/tim-hieu-ve-du-lieu-trong-the-thao-hien-dai.html
---

Tìm hiểu về dữ liệu trong thể thao hiện đại. Một trong những câu trả lời cho câu hỏi: Dân hệ thống thông tin thì làm gì? Bài viết tôi đọc được từ anh [Jackie Dương](http://www.ecoblader.com/2014/06/04/tim-hieu-ve-du-lieu-trong-the-thao-hien-dai/), nói về một trong các ứng dụng của Data Mining trong việc phân tích thể thao. 

[![](https://2.bp.blogspot.com/-o_snpmTzvwk/V3PXfZhLszI/AAAAAAAAYmY/htoLHqxBBPEJaFooDzx9zqa_9X0BzNJcwCK4B/s400/ecoblader-d%25E1%25BB%25AF-li%25E1%25BB%2587u-696x478.png)](https://blog.duyet.net/2016/06/tim-hieu-ve-du-lieu-trong-the-thao-hien-dai.html)

Có một ngàn lý do để không xem bóng đá Việt Nam: nào thì cầu thủ kém, nào thì tinh thần ỉu xìu, nào thì sân xấu, nào thì chất lượng hình ảnh cùi bla bla blah… Thực tế là trong gần 20 năm xem bóng đá qua ti vi của tôi thì phần lớn thời gian tôi đều nghĩ như vậy. Nhưng ý tưởng viết bài này lại đến cách đây gần 3 năm: khi bất chợt xem một trận V-league trên ti vi (tôi không xem V-league nhiều). Lúc đó, như thói quen xem Ngoại hạng Anh, tôi cố ngồi 1-2 phút để đợi bình luận viên nói về diễn biến trận đấu, các cầu thủ đáng chú ý… nhưng chẳng có gì cả. Chợt nhớ đến mấy cái board Possession, Goal Attempts, rồi mấy cái replay vẽ đường kẻ việt vị, dự đoán hướng sút… như xem NHA thì mới Ồ – Thì ra cũng có cái khác vô cùng to giữa bóng đá Việt và bóng đá châu Âu: đó là các Dữ liệu trận đấu.

## Đôi nét về Dữ liệu trong thể thao ##
Chúng ta thường thấy những Dữ liệu này ở đâu? Chắc ai hay coi đá banh trên truyền hình vẫn nhớ những con số: tỷ lệ kiểm soát bóng (Ball Possession) của Barcelona dưới thời Pep không bao giờ dưới 60%, C. Ronaldo đã ghi được tới 42 bàn thắng trên mọi mặt trận trong mùa giải 07-08, Ricky Lambert đã thực hiện chính xác tất cả các quả penalty trong sự nghiệp thi đấu chuyên nghiệp của mình, Michael Carrick là tiền vệ đánh chặn hiệu quả hàng đầu nước Anh trong mùa giải vừa qua với X pha cắt bóng, Y pha chuyền nguy hiểm cho đồng đội trong đó Z dẫn tới bán thắng… Những con số này được bình luận viên nói liên tục trong các trận đấu, trong các buổi bình luận trước vòng đấu, trong bản tin sáng trưa chiều tối, được các báo mạng nhai đi nhai lại rồi chế ra một đống tin lá cải liên quan, được nhà đài (bên biên tập trận đấu) đưa ra hàng đống bảng biểu trong lúc trận đấu diễn ra để người xem bắt nhịp liên tục.

Một số mức độ cao hơn đó là trong các game thể thao và cá độ. Dân cá độ chuyên nghiệp thì coi mấy con số này như dân cổ phiếu coi báo cáo tài chính vậy. Còn bản chất các trò chơi thể thao cũng xây trên nền "chỉ số", cũng là một dạng dữ liệu số hóa cho các cầu thủ. Ví dụ như Football Manager là game bóng đá chiến thuật nổi tiếng nhất thì chỉ số cầu thủ qua các phiên bản có trọng số (tôi nói trọng số vì không phải hoàn toàn) rất lớn từ thống kê kết quả thi đầu của cầu thủ A mùa giải trước: anh Rooney mùa trước ghi có 15 bàn, ít hơn 10 bàn so với mùa trước nữa nên bản này Finishing sẽ từ 18 xuống 15. Các chỉ số đấy khi vào game thì biểu trưng cho một xác suất cho hành động: ví dụ Heading 20/20 thì có khả năng đánh đầu trúng 80% nếu không xét tới các chỉ số khác (Jumping, Positioning,…).

![](https://4.bp.blogspot.com/-Do2LG_8HDtk/V3PYEqEAKzI/AAAAAAAAYmg/GVXSQaQ6EBIhCdKWQ_MZappis4IsYTmPACK4B/s1600/ecoblader-d%25E1%25BB%25AF-li%25E1%25BB%2587u-c%25E1%25BA%25A7u-th%25E1%25BB%25A7.png)
Football Manager là một game bóng đá chiến thuật nổi tiếng

Trong mức độ thông thường, các Dữ liệu mà ta thường thấy ở một trận đấu bao gồm: Ball Possession, Goals, Fouls, Red-Yellow Cards, Goal Attempts, Offside, Tackles, Interception, Pass Accuracy, Shoot Accuracy… Đó là số liệu thời gian thực. Các số liệu này với một giải đấu, một quãng thời gian thi đấu, một đội… thì là số liệu lịch sử. Mức độ đa dạng trong nhu cầu sử dụng Dữ liệu này yêu cầu độ chính xác đến mức biến một video trận đấu thành một tệp số liệu, và ngược lại, có thể tái hiện một tệp số liệu thành video mô phỏng từng hành động của từng cầu thủ trên sân (sẽ nói thêm ở phần sau).

Cũng đã đề cập qua ở trên, những bên sử dụng dữ liệu này bao gồm:

- Truyền hình: sử dụng dữ liệu để đưa lên cùng hình ảnh trận đấu. Đặc biệt là hỗ trợ bình luận viên trực tiếp cũng như các bản tin, chương trình bình luận trước sau trận đấu.
- Báo chí: phần lớn là báo online dùng số liệu trong các bài viết và để trong các widget trên trang của mình.
- Công chúng: tiêu thụ để chém gió .
- Dân cá cược: lấy dữ liệu để đặt cửa.
- Các câu lạc bộ: Dùng để phân tích phong độ cầu thủ trong đội, dùng để đánh giá các thương vụ tiềm năng.
- Các tổ chức/hiệp hội thể thao (như FIFA, UEFA,…): để hỗ trợ tổ chức giải đấu cũng như việc trao các phần thưởng.
- Các công trình nghiên cứu về thể thao ở các trường đại học, nhà báo tự do, tác giả viết sách…
- Các công ty games: Dùng để xây dựng nội dung cho sản phẩm của mình.

## Các công ty cung cấp dữ liệu thể thao chuyên nghiệp ##

Chưa có những tài liệu viết đầy đủ và chuẩn xác về ngành thống kê dữ liệu thể thao. Tuy nhiên, theo một số bài viết đọc được, thì việc thống kê này bắt nguồn đầu tiên từ các câu lạc bộ. Động lực cho việc này là ban lãnh đạo cần có cách để đánh giá mức độ đóng góp của cầu thủ (nhân viên) của mình, từ đó phân chia tiền thưởng hay đánh giá ký hợp đồng với ai, đuổi việc ai. Sau này, nó phát triển sang việc đánh giá các cầu thủ đội khác để chuyển nhượng (ở các câu lạc bộ bóng đá chuyên nghiệp có bộ phận Scouts làm việc này) thay vì cảm tính huấn luyện viên như trước kia. Rồi giới truyền thông, ban tổ chức cũng vào thu thập cùng phục vụ cho mục đích của riêng mình. Sau này khi có công nghệ ghi hình, lưu giữ, phát sinh các hoạt động như nhau và chồng chéo hao phí dẫn đến ra đời các tổ chức thu thập dữ liệu độc lập.

[![](https://4.bp.blogspot.com/-Nz1qo0KCOb8/V3PYupqgEoI/AAAAAAAAYms/cxlErCN_89kTfN7ykzQkNDzHut4y1Vu_QCK4B/s1600/ecoblader-d%25E1%25BB%25AF-li%25E1%25BB%2587u-b%25C3%25B3ng-%25C4%2591%25C3%25A1.jpg)](https://4.bp.blogspot.com/-Nz1qo0KCOb8/V3PYupqgEoI/AAAAAAAAYms/cxlErCN_89kTfN7ykzQkNDzHut4y1Vu_QCK4B/s1600/ecoblader-d%25E1%25BB%25AF-li%25E1%25BB%2587u-b%25C3%25B3ng-%25C4%2591%25C3%25A1.jpg)

Nhu cầu về Dữ liệu xuất phát đầu tiên từ chính các câu lạc bộ

Hiện nay có hai nguồn Dữ liệu thể thao chính: Một là, từ các hiệp hội hay tổ chức như PFRA (Professional Football Researchers Associations). Hai là, từ các công ty cung cấp dữ liệu thể thao chuyên nghiệp như [OPTA](http://www.optasports.com/). Tùy vào tính chất, mục đích thu thập dữ liệu cũng rất khác nhau: PFRA chủ yếu phục vụ nghiên cứu và một số giải thưởng của FIFA và UEFA, trong khi đó các công ty như OPTA đơn giản là thu thập dữ liệu rồi bán cho các bên có nhu cầu. Ở đây xin phép đi sâu vào loại hình thứ hai.

Những công ty như OPTA ra đời nhằm giải quyết nhu cầu về dữ liệu các đối tượng kể ở phần đầu bài viết: Truyền hình, Báo chí, Cá cược, Các câu lạc bộ, Games,… Các công ty này bán các gói dịch vụ như Data feeds và Statistic cho giới Media, cung cấp Broadcast Data Solutions cho truyền hình, các báo cáo và dữ liệu cho các câu lạc bộ, công ty games hay cá cược có nhu cầu. Ví dụ như OPTA có các đối tác về Media như Kicker, Yahoo, AOL whoscored, L’equipe, Bild.de, Marca, The Sun,… Broadcast có ESPN, SkySport, Canal+, BBC,… Các câu lạc bộ sử dụng dữ liệu do OPTA cung cấp có thể kể đến Arsenal, Barcelona, Chelsea, Manchester City, Bayern Munich, Roma, Dortmund,…

Mô hình kinh doanh này có mấy điểm cần chú ý: 

- Một là, việc thu thập dữ liệu phải liên tục, trong thời gian dài sẽ tự tăng được giá trị của công ty. 
- Hai là, tăng trưởng về quy mô không nhanh bằng tăng trưởng về doanh thu, do các gói sản phẩm có thể bán lại cho nhiều khách hàng khác nhau mà không cần đầu tư nhiều vào sản xuất. 

Đây là những điểm tôi rất thích ở các công ty loại này. Hoạt động chính (Key activities) hàng ngày đó là xem các trận đấu, chuyên gia phân tích nhập dữ liệu vào hệ thống, sau đó bán các dữ liệu này (có customize) cho các khách hàng khác nhau.

## Chuyển hóa hình ảnh thể thao thành dữ liệu số ##

Logic của công việc này đó là tạo ra một hệ không gian dữ liệu nhiều chiều rồi mọi thứ đều có thể biểu diễn lại trên đó. Điều này yêu cầu phải thống kê và phân loại TOÀN BỘ các tiêu chuẩn cũng như các trường hợp xảy ra ngoài đời thực và gán hằng số cho nó. 

Ví dụ, sẽ có biến là Chân thuận thì sẽ phải có đúng ba hằng số là Chân trái = 1, Chân phải = 2, Thuận cả hai = 3; hoặc như Biến vị trí cầu thủ thì cần có một trục tọa độ phụ là sân bóng 105*68m rồi sẽ có tọa độ cầu thủ chuẩn bị ghi bàn là (10,22) chẳng hạn. Đương nhiên, chất lượng của hệ thống thông tin này là sự khác biệt cốt lõi của dữ liệu công ty này hay công ty khác.

Đi vào một case study cụ thể là bàn thắng lịch sử của Iniesta cho Tây Ban Nha tại chung kết Worldcup 2010 trước Hà Lan. Dưới góc độ người xem thì là một khoảnh khắc kỳ diệu, nhưng các chuyên viên Dữ liệu thể thao ở OPTA lại có góc nhìn hoàn toàn khác. Ví dụ như trường hợp này họ cần lưu một số dữ liệu như sau:

- Game ID (trận đấu nào) : 318304;
- Event ID (sự kiện thứ bao nhiêu trong trận đấu trên): 1196;
- Action ID (loại hành động nào): 16 – một bàn thắng (có khoảng 80 loại khác nhau, ví dụ như 1 – Passing, 3 – Dribble, 13 – Off target,… Mọi hành động có thể xảy ra trên sân bóng đều đã được mã hóa);
- Period ID (hiệp thứ mấy):  4 – hiệp phụ thứ 2;
- Period minute: 115/Period second: 54;
- Player ID (mã số cầu thủ trong database): 12237 – Andres Iniesta (tôi cá là gõ mã này vào có luôn cả Personal Information của cầu thủ luôn);
- Team ID: 118 – Tây Ban Nha;
- Kit ID: 16;
- Tọa độ cầu thủ: x:9, y:62.3, dựa trên một hệ trục đặt vào sân bóng;
- Tọa độ bàn thắng: x:5.6, y:47.57, dựa trên hệ trục đặt vào gôn thủ môn;
- Goal information: (cùng 1 dãy qualifier ID khác) như 115 (Intentional Assists);  76 (Low left), 118 (One Bounce), 20 (Right foot), 108( Volley),…

[![](https://1.bp.blogspot.com/-bOVinKhwz6s/V3PZWeLiySI/AAAAAAAAYm4/wT682Z072PIitKSjbb2ucAPFS0fVROjMACK4B/s1600/ecoblader-t%25E1%25BB%258Da-%25C4%2591%25E1%25BB%2599-d%25E1%25BB%25AF-li%25E1%25BB%2587u-th%25E1%25BB%2583-thao.jpg)](https://1.bp.blogspot.com/-bOVinKhwz6s/V3PZWeLiySI/AAAAAAAAYm4/wT682Z072PIitKSjbb2ucAPFS0fVROjMACK4B/s1600/ecoblader-t%25E1%25BB%258Da-%25C4%2591%25E1%25BB%2599-d%25E1%25BB%25AF-li%25E1%25BB%2587u-th%25E1%25BB%2583-thao.jpg)

Các nhân viên phân tích Dữ liệu xem bóng đá kiểu rất… hại não

Những dữ liệu trên khi nhập vào sẽ thành một phần số hóa của trận đấu. Theo thống kê thì một trận đấu bình thường có khoảng 16000 tình huống như vậy trong 1 trận đấu 90 phút – lượng dữ liệu rất lớn và chi tiết khi biết chỉ riêng giải ngoại hạng anh có 760 trận đấu mỗi mùa. Các công ty này có thể miêu tả rõ ràng lại điều gì đã xảy ra và như thế nào vào một thời điểm tình huống nhất định. Cool huh?

Hay ho nhất là các dữ liệu đi theo nó. Ví dụ như qua thống kê 300 trận đấu chuyên nghiệp của một cầu thủ, người ta có thể biết tỷ lệ sút trúng khung thành của anh ta là bao nhiêu, xu hướng sút vào vị trí nào của gôn, với thủ môn như vậy thì đứng ở vị trí đấy có bao nhiêu cơ hội bị cản phá,… Những người ở đó chắc phát hiện ra nhiều sự thật bóng đá nhất thế giới chứ chẳng đùa.

## Những vấn đề còn bỏ ngỏ ##

- Việc sử dụng dữ liệu trong đánh giá cầu thủ ở các câu lạc bộ.
- Công nghệ up-to-date dữ liệu trong truyền hình trực tiếp.
- Khoa học bóng đá ở các CLB như Munich, Dortmund, AC Milan.

## Tham khảo ##

- [How Big Data and Analytics are Changing Soccer](https://www.linkedin.com/pulse/how-big-data-analytics-changing-soccer-bernard-marr)
- [How Big Data is Changing the World of Football](https://datafloq.com/read/how-big-data-is-changing-the-world-of-football/1796)
