---
template: post
title: Bootstrap - Giới thiệu về Components thành phần được xây dựng sẵn trong Twitter
  Bootstrap
date: "2015-04-27"
author: Van-Duyet Le
tags:
- Css
- Bootstrap
- Components
modified_time: '2015-04-27T20:50:25.576+07:00'
thumbnail: https://1.bp.blogspot.com/-TAp70-55a34/VT3u2ezvzzI/AAAAAAAACaA/L32plzw7ZWY/s1600/bs-components-intro.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5009922903661231408
blogger_orig_url: https://blog.duyet.net/2015/04/bootstrap-gioi-thieu-ve-components.html
slug: /2015/04/bootstrap-gioi-thieu-ve-components.html
category: Web
description: Ở bài trước mình đã giới thiệu về Bootstrap về hệ thống Grid, giúp bạn tạo nên bố cục, giao diện Responsive cho trang web. Cùng với các định dạng sẵn tất cả các Tag HTML theo phong cách của Bootstrap nếu muốn dùng nhanh thì có thể không cần phải code thêm chút CSS nào nữa. Mình sẽ giúp các bạn tìm hiểu tiếp Components là gì và cách sử dụng chúng ra sao.
fbCommentUrl: none

---

Ở bài trước mình đã giới thiệu về Bootstrap về [hệ thống Grid](https://blog.duyet.net/2015/04/gioi-thieu-ve-responsive-web-design-va-grid-system-trong-twitter-bootstrap.html), giúp bạn tạo nên bố cục, giao diện Responsive cho trang web. Cùng với các định dạng sẵn tất cả các Tag HTML theo phong cách của Bootstrap nếu muốn dùng nhanh thì có thể không cần phải code thêm chút CSS nào nữa. Mình sẽ giúp các bạn tìm hiểu tiếp Components là gì và cách sử dụng chúng ra sao.

## Components là gì? ##
Nói một cách dễ hiểu là Bootstrap đã tạo sẵn các thành phần thường hay dùng và định dạng chúng sẵn bằng CSS rồi. Bây giờ muốn sử dụng cái nào thì chỉ cần vào trang Components của Bootstrap 3 xem code rồi đưa vào trang HTML thôi.

Có rất nhiều thành phần được làm sẵn trong trang Components bạn cũng đã thấy như: Glyphicons, Dropdowns, Button groups, Navs, Breadcrumbs ….

## Cách sử dụng Components ##
Mình sẽ làm qua 1 số ví dụ thôi, vì mọi Components đã có code và demo rõ ràng trên trang [Components Bootstrap](http://getbootstrap.com/components/) rồi.

![](https://1.bp.blogspot.com/-TAp70-55a34/VT3u2ezvzzI/AAAAAAAACaA/L32plzw7ZWY/s1600/bs-components-intro.png)

Giờ mình sẽ làm qua một ví dụ để chỉ cách các bạn đem nó vào trang web như thế nào.

Ví dụ tạo thanh Navbar

Đầu tiên truy cập vào trang Bootstrap Components, chọn mục Navbar: [http://getbootstrap.com/components/#navbar](http://getbootstrap.com/components/#navbar)

![](https://1.bp.blogspot.com/-TVHoV9o1TkA/VT3vp62oFII/AAAAAAAACaI/FRssZ3OUf3Y/s1600/bs-navbar-demo.png)

Trang Components có nhiều mục, gồm phần giới thiệu, ví dụ, code, ... Nếu đọc được tiếng Anh thì ok, còn không bạn chỉ cần nhìn demo và copy code sử dụng thôi, các class và cấu trúc của nó thì giữ nguyên, hoặc điều chỉnh cho phù hợp với trang của bạn thiết kế.

Chỉnh sửa phần nội dung nav-brand, phần liên kết, ... cho phù hợp. Ví dụ dưới đây mình sẽ sử dụng kết hợp navbar và jumbotron

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Navbar Template for Bootstrap</title>

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">

    <style>.navbar { margin-top: 20px; }</style>

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>

  <body>

    <div class="container">

      <!-- Static navbar -->
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">LvDuit</a>
          </div>
          <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
              <li class="active"><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Dropdown <span class="caret"></span></a>
                <ul class="dropdown-menu" role="menu">
                  <li><a href="#">Action</a></li>
                  <li><a href="#">Another action</a></li>
                  <li><a href="#">Something else here</a></li>
                  <li class="divider"></li>
                  <li class="dropdown-header">Nav header</li>
                  <li><a href="#">Separated link</a></li>
                  <li><a href="#">One more separated link</a></li>
                </ul>
              </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
              <li class="active"><a href="#">Login</a></li>
              <li><a href="#">Register</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div><!--/.container-fluid -->
      </nav>

      <!-- Main component for a primary marketing message or call to action -->
      <div class="jumbotron">
        <h1>Hi, My name is Van-Duyet Le</h1>
        <p>This example is a quick exercise to illustrate how the default, static navbar and fixed to top navbar work. It includes the responsive CSS and HTML, so it also adapts to your viewport and device.</p>
        <p>
          <a class="btn btn-lg btn-primary" href="#" role="button">See more &raquo;</a>
        </p>
      </div>

    </div> <!-- /container -->
  </body>
</html>

```

Kết quả:

![](https://2.bp.blogspot.com/-d8IFTRjmzA8/VT3zMGxRpxI/AAAAAAAACac/qjghCLUV9f0/s1600/bs-components-demo.png)

Đọc thêm các phần mở rộng trong hướng dẫn của Bootstrap để có thể tùy biến thêm bằng việc sử dụng các class có sẵn. Hãy đọc qua  mục: Alignment, Headers, Disabled menu items.
Các bạn có thể hiểu thêm nếu đọc Docs của Bootstrap và thông qua các ví dụ.

## Kết ##
Sử dụng các Components của Bootstrap thực sự khá dễ dàng và nhanh chóng. Ngoài ra cũng có vài trang mở rộng số lượng các Components này lên rất nhiều, tất cả miễn phí và bạn chỉ cần copy về xài thôi.
