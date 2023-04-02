---
template: post
title: PM - So sánh mô hình Waterfall, mô hình mẫu, mô hình xoắn ốc
date: "2015-03-15"
author: Van-Duyet Le
tags: 
modified_time: '2015-03-15T23:58:50.492+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-786013932565707269
blogger_orig_url: https://blog.duyet.net/2015/03/so-sanh-cac-mo-hinh-thac-nuoc-mo-hinh-mau-mo-hinh-xoan-oc.html
slug: /2015/03/so-sanh-cac-mo-hinh-thac-nuoc-mo-hinh-mau-mo-hinh-xoan-oc.html
category: News
description: 
---

<table class="table">
    <thead>
        <tr>
            <td style="width:10%"></td>
            <td style="width:30%">Mô hình Waterfall</td>
            <td style="width:30%">Mô hình mẫu</td>
            <td style="width:30%">Mô hình xoắn ốc</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Ưu điểm</td>
            <td>Các giai đoạn được định nghĩa, với đầu vào và đầu ra rõ ràng.
                <br />Mô hình này cơ bản dựa trên tàiliệu nhất là trong các giai đoạn đầu, đầu vào và đầu ra đều là tài liệu.
                <br />Sản phẩm phần mềm được hình thành thông qua chuỗi các hoạt động xây dựng phần mềm theotrình tự rõ ràng</td>
            <td>Người sử dụng sớm hình dung ra chức năng và đặc điểm của hệ thống.
                <br />Cải thiện sự liên lạc giữa nhà phát triển và người sử dụng</td>
            <td>Phân tích đánh giá rủi ro được đẩy lên như một phần thiết yếu trong mỗi "spiral" để tăng mức độ tin cậy của dự án.
                <br />Kết hợp những tính chất tốt nhất của mô hình waterfall và tiến hóa.
                <br />Cho phép thay đổi tùy theo điều kiện thực tế dự án tại mỗi "spiral".
                <br />Đây chính là mô hình tổng quát nhất, tất cả các mô hình khác đều có thể xem là một hiện thựccủa mô hình tổng quát này, hay cũng có thể xem nó là mô hình tổng hợp các mô hình khác.
                <br />Đặc biệt, nó được ứng dụng không chỉ trong phát triển phần mềm mà còn trong phát triển phần cứng</td>
        </tr>
        <tr>
            <td>Nhược điểm</td>
            <td>Đòi hỏi tất cả yêu cầu phần mềm phải được xác định rõ ràng ngay từ đầu dự án. Nhưng đa số dựán thực tế cho thấy yêu cầu phần mềm thường ẩn chứa không nhiều thì ít những điểm khôngchắc chắn.
                <br />
                <br />Một thực tế là các dự án hiếm khi được thực hiện đầy đủ các bước trong suốt chu kỳ dự án.
                <br />Đặc biệt là giai đoạn kiểm thử khi gần đến ngày giao hàng chẳng hạn, nếu có trục trặc xảy ra do yêucầu phần mềm không rõ ràng hay thiết kế có lỗi, xu hướng là mã nguồn được sửa đổi trực tiếpmà không qua các bước bổ sung theo đúng mô hình, nên dẫn đến bản đặc tả phần mềm cũng nhưmột số sản phẩm trung gian khác như bản thiết kế, cho dù có được cập nhật sau này cũng có thểkhông phản ánh đầy đủ những gì đã được sửa đổi trong mã nguồn.
                <br />Người sử dụng không có cơ hội tham gia trong suốt thời gian của các giai đoạn trung gian từ thiết kế cho đến kiểm thử.
                <br />Đặc biệt với những dự án lớn, người sử dụng chỉ có thể nhận ra rằnghệ thống phần mềm không phù hợp cho nhu cầu của họ vào thời điểm cuối dự án.
                <br />Nói chung, mô hình này thường ẩn chứa nhiều rủi ro mà chỉ có thể phát hiện ở giai đoạn cuối cùng &nbsp;và chi phí để sửa chữa có thể rất cao.</td>
            <td>Khi mẫu (prototype) không chuyển tải hết các chức năng, đặc điểm của hệ thống phần mềm thì người sử dụng có thể thất vọng và mất đi sự quan tâm đến hệ thống sẽ được phát triển.Prototype thường được làm nhanh, thậm chí vội vàng, theo kiểu "hiện thực - sửa" và có thể thiếusự phân tích đánh giá một cách cẩn thận tất cả khía cạnh liên quan đến hệ thống cuối cùng. Nói chung mô hình này vẫn chưa thể cải thiện được việc loại trừ khoảng cách giữa yêu cầu vàứng dụng cuối cùng.</td>
            <td>Phức tạp và không phù hợp cho dự án nhỏ với ít rủi ro.
                <br />Cần có kỹ năng tốt về phân tích rủi ro.</td>
        </tr>
        <tr>
            <td>Ứng dụng</td>
            <td>Yêu cầu được định nghĩa rất rõ ràng, chi tiết và hầu như không thay đổi, thường xuất phát từ sản phẩm đã đạt mức ổn định.
                <br />Yêu cầu mới bổ sung (nếu có) cũng sớm được xác định rõ ràng, đầy đủ từ đầu dự án.
                <br />Đội ngũ thực hiện quen thuộc và hiểu rõ tất cả yêu cầu của dự án, và có nhiều kinh nghiệm vớicác công nghệ được dùng để phát triển sản phẩm.
                <br />Dự án được xác định hầu như không có rủi ro</td>
            <td>Hệ thống chủ yếu dựa trên giao diện người dùng (GUI)
                <br />Khách hàng, nhất là người sử dụng cuối, không thể xác định rõ ràng yêu cầu.</td>
            <td>Dự án lớn có nhiều rủi ro hay sự thành công của dự án không có được sự đảm bảo nhất định;những dự án đòi hỏi nhiều tính toán, xử lý như hệ thống hỗ trợ quyết định.
                <br />
                <br />Đội ngũ thực hiện dự án có khả năng phân tích rủi ro.
                <br />
                <br />Trên đây là một số so sánh giữa các mô hình, thực sự việc lựa chọn cụ thể mô hình nào không phải dễ dàng và trên thực tế người ta thường dùng mô hình lai, kết hợp một số mô hình với nhausao cho phù hợp với dự án
                <br />Việc cải tiến các mô hình phát triển phần mềm luôn là đề tài nghiên cứu hấp dẫn, với sự tham gia tích cực không những từ các nhà sản xuất phần mềm mà còn từ các viện đại học khắp thếgiới.
                <br />Riêng với các nhà phát triển phần mềm, họ luôn cố gắng cải tiến liên tục qui trình phát triểncủa mình nhằm không ngừng đổi mới, nâng cao năng suất và chất lượng sản phẩm.
                <br />Tuy nhiên,một điều dễ thấy là việc lựa chọn, tùy biến mô hình phù hợp cho các dự án đã khó, nhưng việcvận hành nó vào trong quá trình phát triển sản phẩm càng khó hơn.
                <br />Đó chính là thách thức cho các nhà phát triển phần mềm.</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>