---
template: post
title: Migrate Blogger sang Gatsby
date: "2019-08-07"
author: Van-Duyet Le
category: Story
tags:
- Story
- Javascript

thumbnail: https://images.unsplash.com/photo-1470175369463-7bb9f41e614b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1652&q=80
slug: /2019/08/migrate-blogger-to-gatsby.html
description: Mình đã migrate từ Blogger sang Gatsby
fbCommentUrl: https://blog.duyetdev.com/2019/08/migrate-blogger-to-gatsby.html
---

Những bài viết đầu tiên của blog này được bắt đầu năm 2014, đã nhiều năm sử dụng nền tảng Blogger của Google.
Nhìn chung blogger khá ổn, vì mình cực kì yên tâm và luôn uptime 99.99%, luôn miễn phí, lưu trữ hình ảnh không giới hạn, và đơn giản. 

Từ trước đến nay blogger đã trải qua vài lần nâng cấp, nhưng vẫn còn khá nhiều thiếu xót khiến nó không còn là đối thủ của các nền tảng khác như Medium, Ghost, Wordpress, ... Hai điểm khiến mình khá không hài lòng đó là: *(1) editor cũ kỹ, thiếu đi công cụ chèn code* và *(2) hệ thống theme XML cũ*.


![](/media/2019/blogger_old_editor.png)
Với editor của blogger, mình muốn chèn coding highlight phải bật qua chế độ HTML, sau đó chèn code trong tag `<pre class="prettyprint">...</pre>` sau đó sử dụng [code-prettify](https://github.com/google/code-prettify) để hiển thị bên ngoài.


Mình quyết định move blog sang nền tảng [Gatsby](https://gatsbyjs.org), deploy trên [Netlify](https://www.netlify.com). Với các ưu điểm như:
- Nhanh, và siêu nhanh
- Dễ tùy chỉnh, làm việc với React và GraphQL
- Blog editor cũng chỉnh là Code Editor, giờ đây mình có thể sử dụng VSCode để viết bài.
- Git: Version control cho toàn bộ blog.
- Sử dụng Markdown thay cho công cụ WYSIWYG/HTML.
    + Markdown đơn giản và dễ đọc.
    + Có thể convert thành HTML.
    + Format đa dạng.
    + Viết công thức toán bằng Latex dễ dàng.
- Netlify
    + Deploy blog CDN
    + Auto build và deploy (CI/CD)
    + Rollback
    + Split traffic to multiple branches

# Migrate blogger sang Gatsby

Mình chọn [gatsby-starter-lumen](https://github.com/alxshelepenok/gatsby-starter-lumen) để bắt đầu blog mới này, mình sẽ tùy chỉnh dần theo thời gian để phù hợp. 

Mình mất 1 ngày migrate toàn bộ sang nền tảng mới mà vẫn đảm bảo không ảnh hưởng gì phía user, link không thay đổi, chỉ thấy là blog chạy nhanh hơn thôi :D 

Mình thực hiện các bước sau: 

- Export blog cũ: Vào Blogger **Settings** > **Other** > **Content (pages, posts & comments)**
    ![](/media/2019/blogger_export.png)

- Blogger sẽ xuất toàn bộ bài viết thành một file xml **blog-08-07-2019.xml**

- Mình sử dụng công cụ [jekyll-import](https://import.jekyllrb.com/docs/blogger/) của Jekyll, vì format bài viết của Gatsby và Jekyll tương đối giống nhau.
    ```bash
    $ ruby -r rubygems -e 'require "jekyll-import";
    JekyllImport::Importers::Blogger.run({
      "source"                => "blog-08-07-2019.xml",
      "no-blogger-info"       => false
      "replace-internal-link" => false
    })'
    ```

- Mình được một folder chứa các bài viết dạng html, tiếp tục sử dụng `h2m` để convert sang markdown. Các bạn có thể tham khảo thêm ở bài viết này: https://blog.abhi.host/blog/2017/09/29/Migrate-Blog-to-Jekyll/

- Cuối cùng được toàn bộ bài viết dưới dạng Markdown: 
    ![](/media/2019/blogger_export_md.png)

- Với từng bài mình tinh chỉnh thêm 1 ít để phù hợp với Gatsby, như set giá trị `slug` từ `blogger_orig_url` lúc export ra, để giữ nguyên url của từng bài viết. Thêm các thuộc tính khác như `category`, `tag`, ... chỉnh sửa lại các bài viết cũ... Mọi thứ có thể làm dễ dàng thông qua công cụ *Find and Replace* của VSCode.
    ```markdown
    blogger_orig_url: https://blog.duyet.net/2019/04/shorten-url-voi-firebase.html
    slug: /2019/04/shorten-url-voi-firebase.html
    ...
    ```

- Đưa mọi thứ lên Github, setup Netlify để deploy, mọi thứ đơn giản chỉ mất 5 phút. Mỗi lần cập nhật git thì Netlify cũng tự động build lại luôn, khá tiện lợi. 
    ![](/media/2019/blogger_setup_netlify.png)

- Sau khi deploy, trỏ DNS domain về Netlify, mình dùng Cloudflare nên việc này cũng hết sức nhanh chóng.

    ![](/media/2019/new_blog_gatsby.png)

# Hiệu năng

Blog bây giờ đã có load nhanh hơn, mặc dù mình chưa tiến hành tối ưu với các thư viện của Gatsby. 

Mình đo đạc với công cụ [Web.dev/Measure](https://web.dev/measure) của Google.

![](/media/2019/new_blog_perf.png)

Với 100 điểm performance và Best Practices. Xem report tại [đây](https://lighthouse-dot-webdotdevsite.appspot.com/lh/html?url=https://duyet.netlify.com#performance)


Ngoài ra giờ đây mình có thể viết bài bằng Markdown trên `VSCode`, cực kỳ nhanh chóng và chuẩn xác.

![](/media/2019/new_editor_vscode.png)

