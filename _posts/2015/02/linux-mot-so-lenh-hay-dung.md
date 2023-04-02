---
template: post
title: Linux - Một số lệnh hay dùng
date: "2015-02-13"
author: Van-Duyet Le
tags:
- Linux
modified_time: '2015-02-15T11:47:58.252+07:00'
thumbnail: https://3.bp.blogspot.com/-4cvpjZwnz50/VN4p_hlVBOI/AAAAAAAACFE/0kqpzy9wJQ0/s1600/IMG_8804_resize.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4682840170666481275
blogger_orig_url: https://blog.duyet.net/2015/02/linux-mot-so-lenh-hay-dung.html
slug: /2015/02/linux-mot-so-lenh-hay-dung.html
description: Dùng Linux cũng đã lâu. Thấy nhiều bạn học HDH, nếu không nắm được một số câu lệnh cần thiết thì công việc quản trị của bạn sẽ gặp không ít khó khăn, mình ghi ra vài lệnh hay, hay dùng trên Linux để tiện tham khảo.

---

Dùng Linux cũng đã lâu. Thấy nhiều bạn học HDH, nếu không nắm được một số câu lệnh cần thiết thì công việc quản trị của bạn sẽ gặp không ít khó khăn, mình ghi ra vài lệnh hay, hay dùng trên Linux để tiện tham khảo.

![](https://3.bp.blogspot.com/-4cvpjZwnz50/VN4p_hlVBOI/AAAAAAAACFE/0kqpzy9wJQ0/s1600/IMG_8804_resize.jpg)

## First of all ##
Trước hết, 1 lênh quan trọng nhất khi bắt đầu tìm hiểu về lệnh trên terminal là lệnh man, lệnh man giúp bạn xem thông tin hướng dẫn cách sử dụng 1 lệnh nào đó (man là viết tắt của manual nha)
Ví dụ:

```shell
$ man cp
$ man ls
```

Man sẽ hiển thị chi tiết, ý nghĩa, cách sử dụng và các tham số của 1 lệnh nào đó.

![](https://3.bp.blogspot.com/-msPIi9OmGCA/VN9w9joiUBI/AAAAAAAACGQ/6tpcUMXAuz8/s1600/Screenshot%2Bfrom%2B2015-02-14%2B22%3A57%3A02.png)

## Hay dùng nhất ##

- `pwd` in ra màn hình thư mục đang hoạt động (ví dụ: `/etc/home/lvduit/Downloads/`), xem thêm [đường dẫn tuyệt đối và đường dẫn tương đối trong linux](/2015/02/linux-duong-dan-tuyet-doi-va-duong-dan-tuong-doi.html).
- `cd` thay đổi thư mục, cái này là viết tắt của change directory ấy (ví dụ: `cd ..` – ra một cấp thư mục hiện tại; cd vidu – vào thư mục /vidu).
- `ls` đưa ra danh sách nội dung thư mục.
- `mkdir` tạo thư mục mới (`mkdir tên_thumuc`).
- `touch` tạo file mới (`touch ten_file`).
- `rmdir` xóa một thư mục (`rmdir ten_thumuc`).
- `cp` copy file hoặc thư mục (`cp file_nguồn file_đích`).
- `mv` di chuyển file hoặc thư mục; cũng được dùng để đặt lại tên file hoặc thư mục (m`v vị_trí_cũ vị_trí_mới hoặc mv tên_cũ tên_mới`).
- `rm` xóa file (`rm tên_file`).

Để tìm kiếm file, bạn có thể dùng:

- `find <tiêu chuẩn tìm kiếm>`: dùng cho các tên file.
- `grep < tiêu chuẩn tìm kiếm>`: để tìm nội dung trong file

Để xem một file, bạn có thể dùng:

- `more <tên file>` hiển thị file theo từng trang.
- `cat < tên file>` hiển thị tất cả file.
- `head < tên file>` hiển thị các dòng đầu tiên.
- `tail < tên file>` hiển thị các dòng cuối cùng (có thể hữu ích trong những trường hợp như khi bạn muốn xem thông tin log gần nhất của một file hệ thống).

## Editor trên Terminal ##
Để chỉnh sửa file, bạn phải sử dụng trình soạn thảo tích hợp sẵn trên dòng lệnh. Thông thường, đây là **vi** và được dùng với cú pháp: `vi <tên file>`.

Tham khảo: [Sử dụng trình soạn thảo "vi" trong linux](https://blog.duyet.net/2014/06/su-dung-trinh-soan-thao-vi-trong-linux.html#.VN9uBhJ811g)

Mình cũng hay dùng nhất nữa là chương trình nano để sửa nhanh các file config.

![](https://1.bp.blogspot.com/-FXksOXNjgQg/VN9zRVVhgEI/AAAAAAAACGk/6P9lylqoOwI/s1600/Screenshot%2Bfrom%2B2015-02-14%2B23%3A08%3A48.png)

## Giải nén ##
Để giải nén một lưu trữ (thông thường có đuôi tar.gz), bạn phải dùng lệnh tar với cú pháp `tar -xvf <tên_file>`.

## In file ##
Để in một file, dùng lệnh `lpr <tên_file>`. Chú ý là bạn phải có một số daemon hoạt động để quản lý máy in. Thông thường đây là các cup (chủ yếu là UNIX Printing System) có thể sử dụng cho tất cả các phân phối chính.

Để loại bỏ file khỏi hàng đợi ở máy in (bạn có thể lên danh sách hàng đợi bằng lệnh lpq), sử dụng câu lệnh `lprm <tên_file>`.

## Phím TAB ##
Dù ở phân phối nào, bạn cũng có thể dùng phím TAB để tự động hoàn chỉnh một lệnh hoặc tên file. Điều này rất hữu ích khi bạn quen với các lệnh. Bạn cũng có thể sử dụng các phím lên, xuống để cuộn xem các lệnh đã nhập.

![](https://1.bp.blogspot.com/-R4Z4Mi5BwPI/VN9x3N7tqRI/AAAAAAAACGY/cvd8VP1SbuM/s1600/Screenshot%2Bfrom%2B2015-02-14%2B23%3A02%3A52.png)

## Đa lệnh ##

Bạn có thể dùng lệnh đa dòng trên một dòng. Ví dụ như, nếu muốn tạo ba thư mục chỉ trên một dòng, cú pháp có thể là: 

```shell
$ mkdir ./lvduit; mkdir ./uit
```

hay 

```shell
$ mkdir ./lvduit && mkdir ./uit
```

## Lệnh dạng pipe ##
Một điều thú vị khác nữa là các lệnh dạng pipe. Bạn có thể xuất một lệnh thông qua lệnh khác. Ví dụ:` man mkdir | tail` sẽ đưa ra thông tin các dòng cuối cùng trong trang hướng dẫn của lệnh `man mkdir`.
Tức là lệnh `man mkdir` in ra cái gì, thì tail bắt lấy rồi in ra các dòng cuối của mấy cái vừa bắt được đó.

## Hiển thị tiến trình trong hệ thống Linux ##
Một trong những công việc cần thiết khi quản trị hệ thống Linux đó là kiểm soát các tiến trình hiện đang chạy. Khi đã biết được những tiến trình nào đang chạy bạn có thể tắt những tiến trình gây giảm tốc độ của hệ thống. Ngoài ra, thông tin về những tiến trình hệ thống cho chúng ta biết nên tắt nhưng tiến trình làm cho hệ thống vận hành không ổn định. Do đó việc biết được những tiến trình nào đang chạy trên hệ thống rất quan trọng. Linux hỗ trợ nhiều phương pháp kiểm tra tiến trình, một trong số đó là sử dụng lệnh ps. Khi sử dụng lệnh này mọi thông tin về những tiến trình đang chạy sẽ được hiển thị. Bạn chỉ cần nhập cú pháp lệnh sau vào cửa sổ terminal:

```
$ ps aux | less
```

Ngoài ra lệnh này có thể sử dụng kết hợp với một số tham số khác như:

- `ps –A` Kiểm tra mọi tiến trình trong hệ thống.
- `ps -U root -u root –N` Kiểm tra mọi tiến trình ngoại trừ những tiến trình hệ thống.
- `ps -u username` Kiểm tra những tiến trình được thực hiện bởi một người dùng nhất định.

Hoặc bạn có thể sử dụng lệnh top để xem những tiến trình đang chạy trên hệ thống trong thời gian thực.

## Theo dõi Average CPU Load và Disk Activity ##
Nếu là một quản trị viên hệ thống Linux, bạn cần phải biết phương pháp duy trì một sự cân bằng hợp lý trong quá trình tải đầu vào và đầu ra giữa các ổ đĩa vật lý. Bạn có thể thay đổi cấu hình hệ thống để thực hiện tác vụ này. Tuy nhiên có một phương pháp đơn giản hơn rất nhiều đó là sử dụng lệnh isostat để quản lý hệ thống thiết bị tải đầu vào và đầu ra trong Linux bằng cách theo dõi thời gian hoạt động và tốc độ truyền trung bình của những thiết bị này. Lệnh này sẽ thông báo thông tin của CPU (Central Processing Unit), thông tin đầu vào và đầu ra cho những thiết bị, phân vùng và hệ thống file mạng (NFS).

Để lấy thông tin thư mục NFS bạn hãy sử dụng lệnh sau:

```shell
$ iostat –n
```

Kiểm tra Memory Map của các tiến trình trong Linux

```shell
$ free
```

Sau khi chạy lệnh này bạn sẽ thấy tổng dung lượng đã chiếm dụng và chưa chiếm dụng của bộ nhớ vật lý và tổng dung lượng bộ nhớ trong hệ thống. Ngoài ra nó còn hiển thị thông tin bộ nhớ đệm mà các nhân sử dụng.

## Kiểm soát hành vi hệ thống, phần cứng và thông tin hệ thống trong Linux ##
Với nhiều người dùng Linux, kiểm soát hệ thống là một tác vụ phức tạp. Hầu hết các bản phân phối Linux tích hợp khá nhiều công cụ kiểm soát. Những công cụ kiểm soát này cung cấp các phương pháp có thể được áp dụng để kiểm tra thông tin hành vi hệ thống. Việc kiểm soát hệ thống cho phép người dùng theo dõi nguyên nhân khả năng thực thi của hệ thống bị cản trở. Một trong những tác vụ cần thiết của quá trình kiểm soát hệ thống là tra cứu thông tin về hành vi hệ thống, phần cứng và thông tin bộ nhớ. Có một lệnh đơn giản giúp hiển thị thông tin về tiến trình, bộ nhớ, trang ghi, nhóm IO, lỗi và hành vi CPU đó là lệnh vmstat.

Bạn chỉ cần nhập lệnh sau vào cửa sổ terminal:

```shell
$ vmstat 3
```

Ngoài ra bạn có thể sử dụng lệnh vmstat –m để kiểm tra thông tin bộ nhớ, và lệnh `# vmstat –a` để hiển thị thông tin trang nhớ đang hoạt động và không hoạt động.

## Kiểm tra thông tin phần cứng của hệ thống Linux ##
Với một số người dùng Linux thì việc kiểm tra thông tin phần cứng thật không dễ dàng. Linux là một hệ thống phức tạp nhưng nó lại tích hợp một số công cụ giúp lấy thông tin chi tiết của phần cứng, chẳng hạn chúng ta có thể sử dụng một lệnh khá đơn giản để kiểm tra thông tin đĩa cứng trên hệ thống đó là lệnh hdparm. Lệnh này cung cấp một giao diện dòng lệnh để thực hiện quản lý nhiều loại đĩa cứng được hệ thống phụ điều khiển thiết bị ATA/IDE của Linux hỗ trợ. Nó cung cấp một lệnh giúp hiển thị thông tin xác minh như dung lượng, thông tin chi tiết, … trực tiếp từ ổ đĩa. Thông tin này được lưu dưới một định dạng mở rộng mới. Bạn chỉ cần đăng nhập dưới quyền root user và sử dụng lệnh sau:

```shell
$ hdparm -I /dev/sda
```

Hoặc dùng lệnh:

```shell
$ sudo hdparm -I /dev/sda
```

Khi đó thông tin về đĩa cứng của hệ thống sẽ được hiển thị.

## Quản lý hệ thống ##
- `ps`: hiển thị các chương trình hiện thời đang chạy (rất hữu ích: ps là cái nhìn toàn bộ về tất cả các chương trình).

- Ngừng một dịch vụ hay ứng dụng, dùng lệnh `kill <PID>`.

- `top`: hoạt động khá giống như Task Manager trong Windows. Nó đưa ra thông tin về tất cả tài nguyên hệ thống, các tiến trình đang chạy, tốc độ load trung bình… Lệnh top -d <delay> thiết lập khoảng thời gian làm tươi lại hệ thống. Bạn có thể đặt bất kỳ giá trị nào, từ .1 (tức 10 mili giây) tới 100 (tức 100 giây) hoặc thậm chí lớn hơn.

- `uptime`: thể hiện thời gian của hệ thống và tốc độ load trung bình trong khoảng thời gian đó, trước đây là 5 phút và 15 phút.

- `free`: hiển thị thông tin trên bộ nhớ hệ thống.

- `ifconfig <tên interface>`: để xem thông tin chi tiết về các giao diện mạng; thông thường giao diện mạng ethernet có tên là eth().

- `passwd`: cho phép bạn thay đổi mật khẩu (passwd người_dùng_sở_hữu_mật_khẩu hoặc tên người dùng khác nếu bạn đăng nhập hệ thống với vai trò root).

- `useradd`: cho phép bạn thêm người dùng mới (xem thê man useradd).

- `rlogin`: dùng để điều khiển hoặc thao tác lệnh trên một máy khác

- `exit` : thoát khỏi hệ thống (Bourne-Shell)

- `logout`: thoát khỏi hệ thống C-Shell

- `id`: chỉ danh của người sử dụng

- `logname`: tên người sử dụng login

- `newgrp`: chuyển người sử dụng sang một nhóm mới

- `uname`: tên của hệ thống (host)

- `who`: cho biết những ai đang thâm nhập hệ thống

##  ##

Nếu lúc nào đó được yêu cầu phải đăng nhập với tài khoản gốc (root), bạn có thể đăng nhập tạm thời bằng cách dùng lệnh su. Ngoài ra, bạn có thể dụng sudo lệnh để chạy 1 lệnh dưới quyền root

Bình thường user không được tạo thư mục tùm lum, vị trí nhất định thôi, giờ muốn tạo thư mục `/lvduit` ở trong nhà của thằng `/root`, `mkdir` thì nó la làng. Vậy nên thêm `sudo` vào là sẽ giải quyết được thôi

```
$ sudo mkdir /root/lvduit
```
