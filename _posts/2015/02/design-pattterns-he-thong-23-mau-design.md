---
template: post
title: Design Pattterns - hệ thống 23 mẫu Design Patterns
date: "2015-02-23"
author: Van-Duyet Le
tags:
- Design Patterns
modified_time: '2015-02-23T22:40:07.138+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4798576285479581791
blogger_orig_url: https://blog.duyet.net/2015/02/design-pattterns-he-thong-23-mau-design.html
slug: /2015/02/design-pattterns-he-thong-23-mau-design.html
description: Hệ thống các mẫu design pattern hiện có 23 mẫu được định nghĩa trong cuốn Design patterns Elements of Reusable Object Oriented Software
fbCommentUrl: none

---

Hệ thống các mẫu design pattern hiện có 23 mẫu được định nghĩa trong cuốn "**Design patterns Elements of Reusable Object Oriented Software**" ([pdf](http://www.uml.org.cn/c++/pdf/DesignPatterns.pdf)).  

## Về tác giả

  
Các tác giả của cuốn sách là **Erich Gamma**, **Richard Helm**, **Ralph Johnson** và **John Vlissides**, hay còn được biết đến với các tên **"Gang of Four"** hay đơn giản là "**GoF**". Hệ thống các mẫu này có thể nói là đủ và tối ưu cho việc giải quyết hết các vấn đề của bài toán phân tích thiết kế và xây dựng phần mềm trong thời điểm hiện tại. Hệ thống các mẫu design pattern được chia thành 3 nhóm: nhóm **Creational** (5 mẫu), nhóm **Structural** (7 mẫu) và nhóm **Behavioral** (11 mẫu).  

  

## Danh sách 23 mẫu

<table class="table table-bordered" style="border: 1px solid #ccc">
    <thead>
        <tr class="cms_table_grid_tr" valign="top">
            <td>STT</td>
            <td>Tên</td>
            <td>Mục đích</td>
        </tr>
    </thead>
    <tbody>
        <tr class="cms_table_grid_tr" valign="top">
            <td colspan="3"><b>Nhóm Creational (nhóm kiến tạo)</b></td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>1</td>
            <td>Abstract Factory</td>
            <td>Cung cấp một interface cho việc tạo lập các đối tượng (có liên hệ với nhau) mà không cần qui định lớp khi hay xác định lớp cụ thể (concrete) tạo mỗi đối tượng
                <br />Tần suất sử dụng: cao</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>2</td>
            <td>Builder</td>
            <td>Tách rời việc xây dựng (construction) một đối tượng phức tạp khỏi biểu diễn của nó sao cho cùng một tiến trình xây dựng có thể tạo được các biểu diễn khác nhau.
                <br />Tần suất sử dụng: trung bình thấp</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>3</td>
            <td>Factory Method</td>
            <td>Định nghĩa Interface để sinh ra đối tượng nhưng để cho lớp con quyết định lớp nào được dùng để sinh ra đối tượng Factory method cho phép một lớp chuyển quá trình khởi tạo đối tượng cho lớp con.
                <br />Tần suất sử dụng: cao</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>4</td>
            <td>Prototype</td>
            <td>Qui định loại của các đối tượng cần tạo bằng cách dùng một đối tượng mẫu, tạo mới nhờ vào sao chép đối tượng mẫu này.
                <br />Tần suất sử dụng: trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>5</td>
            <td>Singleton</td>
            <td>Đảm bảo 1 class chỉ có 1 instance và cung cấp 1 điểm truy xuất toàn cục đến nó.
                <br />Tần suất sử dụng: cao trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td colspan="3"><b>Nhóm Structural (nhóm cấu trúc)</b></td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>6</td>
            <td>Adapter</td>
            <td>Do vấn đề tương thích, thay đổi interface của một lớp thành một interface khác phù hợp với yêu cầu người sử dụng lớp.
                <br />Tần suất sử dụng: cao trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>7</td>
            <td>Bridge</td>
            <td>Tách rời ngữ nghĩa của một vấn đề khỏi việc cài đặt ; mục đích để cả hai bộ phận (ngữ nghĩa và cài đặt) có thể thay đổi độc lập nhau.
                <br />Tần suất sử dụng: trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>8</td>
            <td>Composite</td>
            <td>Tổ chức các đối tượng theo cấu trúc phân cấp dạng cây; Tất cả các đối tượng trong cấu trúc được thao tác theo một cách thuần nhất như nhau.
                <br />Tạo quan hệ thứ bậc bao gộp giữa các đối tượng. Client có thể xem đối tượng bao gộp và bị bao gộp như nhau -&gt; khả năng tổng quát hoá trong code của client -&gt; dễ phát triển, nâng cấp, bảo trì.
                <br />Tần suất sử dụng: cao trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>9</td>
            <td>Decorator</td>
            <td>Gán thêm trách nhiệm cho đối tượng (mở rộng chức năng) vào lúc chạy (dynamically).
                <br />Tần suất sử dụng: trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>10</td>
            <td>Facade</td>
            <td>Cung cấp một interface thuần nhất cho một tập hợp các interface trong một "hệ thống con" (subsystem). Nó định nghĩa 1 interface cao hơn các interface có sẵn để làm cho hệ thống con dễ sử dụng hơn.
                <br />Tần suất sử dụng: cao</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>11</td>
            <td>Flyweight</td>
            <td>Sử dụng việc chia sẻ để thao tác hiệu quả trên một số lượng lớn đối tượng "cở nhỏ" (chẳng hạn paragraph, dòng, cột, ký tự…).
                <br />Tần suất sử dụng: thấp</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>12</td>
            <td>Proxy</td>
            <td>Cung cấp đối tượng đại diện cho một đối tượng khác để hỗ trợ hoặc kiểm soát quá trình truy xuất đối tượng đó. Đối tượng thay thế gọi là proxy.
                <br />Tần suất sử dụng: cao trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td colspan="3"><b>Nhóm Behavioral (nhóm tương tác)</b></td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>13</td>
            <td>Chain of Responsibility</td>
            <td>Khắc phục việc ghép cặp giữa bộ gởi và bộ nhận thông điệp; Các đối tượng nhận thông điệp được kết nối thành một chuỗi và thông điệp được chuyển dọc theo chuỗi nầy đến khi gặp được đối tượng xử lý nó.Tránh việc gắn kết cứng giữa phần tử gởi request với phần tử nhận và xử lý request bằng cách cho phép hơn 1 đối tượng có có cơ hội xử lý request . Liên kết các đối tượng nhận request thành 1 dây chuyền rồi "pass" request xuyên qua từng đối tượng xử lý đến khi gặp đối tượng xử lý cụ thể.
                <br />Tần suất sử dụng: trung bình thấp</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>14</td>
            <td>Command</td>
            <td>Mỗi yêu cầu (thực hiện một thao tác nào đó) được bao bọc thành một đối tượng. Các yêu cầu sẽ được lưu trữ và gởi đi như các đối tượng.Đóng gói request vào trong một Object , nhờ đó có thể nthông số hoá chương trình nhận request và thực hiện các thao tác trên request: sắp xếp, log, undo…
                <br />Tần suất sử dụng: cao trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>15</td>
            <td>Interpreter</td>
            <td>Hỗ trợ việc định nghĩa biểu diễn văn phạm và bộ thông dịch cho một ngôn ngữ.
                <br />Tần suất sử dụng: thấp</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>16</td>
            <td>Iterator</td>
            <td>Truy xuất các phần tử của đối tượng dạng tập hợp tuần tự (list, array, …) mà không phụ thuộc vào biểu diễn bên trong của các phần tử.
                <br />Tần suất sử dụng: cao</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>17</td>
            <td>Mediator</td>
            <td>Định nghĩa một đối tượng để bao bọc việc giao tiếp giữa một số đối tượng với nhau.
                <br />Tần suất sử dụng: trung bình thấp</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>18</td>
            <td>Memento</td>
            <td>Hiệu chỉnh và trả lại như cũ trạng thái bên trong của đối tượng mà vẫn không vi phạm việc bao bọc dữ liệu.
                <br />Tần suất sử dụng: thấp</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>19</td>
            <td>Observer</td>
            <td>Định nghĩa sự phụ thuộc một-nhiều giữa các đối tượng sao cho khi một đối tượng thay đổi trạng thái thì tất cả các đối tượng phụ thuộc nó cũng thay đổi theo.
                <br />Tần suất sử dụng: cao</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>20</td>
            <td>State</td>
            <td>Cho phép một đối tượng thay đổi hành vi khi trạng thái bên trong của nó thay đổi , ta có cảm giác như class của đối tượng bị thay đổi.
                <br />Tần suất sử dụng: trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>21</td>
            <td>Strategy</td>
            <td>Bao bọc một họ các thuật toán bằng các lớp đối tượng để thuật toán có thể thay đổi độc lập đối với chương trình sử dụng thuật toán.Cung cấp một họ giải thuật cho phép client chọn lựa linh động một giải thuật cụ thể khi sử dụng.
                <br />Tần suất sử dụng: cao trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>22</td>
            <td>Template method</td>
            <td>Định nghĩa phần khung của một thuật toán, tức là một thuật toán tổng quát gọi đến một số phương thức chưa được cài đặt trong lớp cơ sở; việc cài đặt các phương thức được ủy nhiệm cho các lớp kế thừa.
                <br />Tần suất sử dụng: trung bình</td>
        </tr>
        <tr class="cms_table_grid_tr" valign="top">
            <td>23</td>
            <td>Visitor</td>
            <td>Cho phép định nghĩa thêm phép toán mới tác động lên các phần tử của một cấu trúc đối tượng mà không cần thay đổi các lớp định nghĩa cấu trúc đó.
                <br />Tần suất sử dụng: thấp</td>
        </tr>
    </tbody>
</table>

## Kết 

Các bài viết sau mình sẽ đi sâu vào 3 nhóm chính, cuối cùng là các bài viết về từng mẫu của từng nhóm.