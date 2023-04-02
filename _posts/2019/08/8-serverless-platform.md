---
template: post
title: 8 nền tảng serverless platform tốt nhất hiện nay
date: "2019-08-09"
author: Van-Duyet Le
category: Server
tags:
- Server
- Serverless

thumbnail: https://2.bp.blogspot.com/-UXFKQHmgZr4/XU5GBRoYgMI/AAAAAAABFX4/36g3ohD57bUaGSoqwPctGsTdL4lG85vPwCK4BGAYYCw/s1600/serverless-arch.jpg
slug: /2019/08/8-serverless-platform.md
description: Một vài nền tảng serverless tốt nhất hiện nay cho ứng dụng của bạn.
fbCommentUrl: none
---

Serverless architecture không có nghĩa là bạn không cần server. Thay vào đó là bạn cần ít server hơn để quản lý. Ở các ứng dụng truyền thống, bạn sẽ phải quản lý mọi thứ từ logic ứng dụng trong máy ảo, máy vật lý hoặc cloud server. Tuy nhiên, xu thế hiện nay đang dần thay đổi.

<script type="text/javascript" src="https://ssl.gstatic.com/trends_nrtr/1845_RC03/embed_loader.js"></script> <script type="text/javascript"> trends.embed.renderExploreWidget("TIMESERIES", {"comparisonItem":[{"keyword":"serverless","geo":"","time":"today 5-y"}],"category":0,"property":""}, {"exploreQuery":"date=today%205-y&q=serverless","guestPath":"https://trends.google.com:443/trends/embed/"}); </script> 


Khi sử dụng kiến trúc serverless, bạn sẽ có nhiều lợi ích như:
- Không cần quan tâm về hosting runtime nữa (Node.js, Python, Go, etc.)
- Chỉ trả tiền trên những gì bạn sử dụng (cost-effective)
- Không quan tâm đến việc ứng dụng của bạn bùng nổ lượt truy cập (scalable)
- Để nhà cung cấp serverless quản lý security hay cập nhật ứng dụng
- Dễ dàng tích hợp với các dịch vụ khác
- Deploy nhanh, thay đổi nhanh

Và điều quan trọng nhất là giúp developer và chủ doanh nghiệp chỉ tập trung vào code, các chuyên gia sẽ thực thi code cho bạn. 

Hãy khám phá một số dịch vụ FaaS (Functions as a Service) sau

# 1. AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda/) là một trong những ứng cử viên hàng đầu bởi AWS. Ban đầu, Lambda chỉ hỗ trợ Node.js nhưng giờ đây bạn có thể chạy Python, Go, Java, C#.

![](https://4.bp.blogspot.com/-i6E1jLX5Ebo/XU4-S8lgbpI/AAAAAAABFWo/UhzrkUDRYAgtM4_ibuF8AE-Md59bu2s1gCK4BGAYYCw/s1600/aws-lambda.png)

Như bạn thấy trên hình, chỉ cần upload code, Lambda sẽ lo việc thực thi code của bạn. Bạn có thể thủ công hoặc tự động trigger thông qua các dịch vụ AWS hoặc web application.

AWS Lambda có thể giúp ích trong các ngữ cảnh cần tác vụ real-time như xử lý file, streaming, data validation, data transformations, handling API requests, etc. 

Một vài chức năng nổi bật: 
- Tích hợp sâu với các dịch vụ AWS khác.
- Stateless Lambda functions
- High-available và fault-tolerant infrastructure
- Hỗ trợ logging và monitoring (AWS Cloud Watch)
- Tự động scaling
- ...

Với gói free tier, AWS hỗ trợ miễn phí **1 triệu requests** và **400,000 GB-seconds** compute time, thích hợp cho các project cá nhân và nhỏ.

# 2. Cloudflare Workers

[Cloudflare](https://cloudflare.com) không chỉ là một cty CDN và bảo mật, họ còn cung cấp rất nhiều dịch vụ khác. 

Gần đây, Cloudflare cho ra mắt dịch vụ [Cloudflare workers](https://www.cloudflare.com/products/cloudflare-workers/) cho phép bạn chạy Javascript trên 150 data centers của họ trên khắp thế giới. 

Cloudflare sử dụng V8 JS Engine, vì thế nếu bạn cần thực thi Javascript với tốc độ nhanh hơn, hãy thử sử dụng workers. 

![](https://3.bp.blogspot.com/-YEcQW5CMowM/XU47r2PXLJI/AAAAAAABFWQ/KbBfS4sgDyQm5ZnRXSKP3Lxecd3HtEJUwCK4BGAYYCw/s1600/cloudflare-workers-e1552762535324.png)

Bạn có thể tích hợp workers với [Serverless framework](https://serverless.com/) để deployment nhanh hơn. Giá của Cloudflare workers bắt đầu từ $5/tháng. Bạn có thể tham khảo các [scripts recipes](https://developers.cloudflare.com/workers/recipes/) có sẵn.

# 3. Now.sh

[Now by Zeit](https://zeit.co/now) là một dịch vụ cực kì hay cho developers. Bạn chỉ cần viết code và push, mọi việc còn lại do Now lo, không cần phải quan tâm về hosting optimization hay quản lý cấu hình. 

![](https://1.bp.blogspot.com/-njcOOJws1gc/XU4-GxoBUwI/AAAAAAABFWg/ATJ8hG7aPlgQy072zb0jPT1g3ZSuM-JZACLcBGAs/s1600/Screen%2BShot%2B2019-08-10%2Bat%2B10.43.54%2BAM.png)


Now hỗ trợ Node.js, PHP, Go, React và nhiều ngôn ngữ khác. Now còn giúp tiết kiệm khi chỉ build lại những phần thay đổi trong repo của ứng dụng. Now miễn phí và trả thêm tiền khi ứng dụng của bạn phát triển lớn hơn. 


# 4. Azure Functions

Tương tự như AWS Lambda, [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) hỗ trợ rất nhiều ngôn ngữ:
- Javascript
- C#
- F#
- Java
- Python
- PHP
- TypeScript
- Bash
- PowerShell

Azure Functions sẽ lo infrastructure cho ứng dụng của bạn, tự động scale up hay down khi cần thiết. Bạn không cần quan tâm đến gói capacity. 

Bạn có thể trigger function từ web application, HTTP API từ ứng dụng mobile, blob storage, streaming, webhooks, ...

![](/media/2019/azure-function.svg)

Giá được tính dựa vào tổng thời gian để thực thi code, không có upfront cost, Azure hỗ trợ 1 triệu lần thực thi code miễn phí.

# 5. Google Cloud

Google Cloud giới thiệu [một loạt các giải pháp serverless computing](https://cloud.google.com/serverless/).

![Serverless computing GCP](https://2.bp.blogspot.com/-qldMB_ilBXo/XU5A7We4OkI/AAAAAAABFW8/2OGXEBDl4VIwD_RzsNaDcBzCsg1TE958wCK4BGAYYCw/s1600/Screen%2BShot%2B2019-08-10%2Bat%2B10.58.23%2BAM.png)

**App Engine** - fully managed cho web và mobile. Bạn có thể deploy PHP, Python, C#, Node.js, Ruby, Go, etc. Bạn trả theo resource sử dụng và scale dựa trên lưu lượng sử dụng.

**Cloud Functions** - event-driven platform chạy Node.js, Golang và Python. Bạn có thể sử dụng Functions để xây dựng IoT backend, API processing, chatbots, sentiment analysis, stream processing, ...

**Firebase Functions** - là một phiên bản khác của Cloud Function.

Còn nhiều dịch vụ khác - Storage, Firestore, BigQuery, Dataflow, Pub/Sub, ML engine. Các ứng dụng này đủ để bạn build một hệ thống cho doanh nghiệp đầy đủ.

# 6. IBM Cloud Functions

[IBM Cloud Functions](https://cloud.ibm.com/functions/) dựa trên nền tảng Apache OpenWhisk để phát triển ứng dụng thực thi dựa trên sự kiện trigger. 

![IBM Cloud Functions](https://2.bp.blogspot.com/-C7R-_R3M35Y/XU5ChgIbh4I/AAAAAAABFXQ/SKp4sfa16WckI_85SvI2AbOUB13_BDZOwCK4BGAYYCw/s1600/Screen%2BShot%2B2019-08-10%2Bat%2B11.04.57%2BAM.png)

Có nhiều bài viết hướng dẫn xây dựng ứng dụng serverless, API, mobile backend, searchable video, etc.

# 7. Alibaba Function Compute

Một lựa chọn hoàn hảo cho ứng dụng chạy tại Trung Quốc, Alibaba là một nhà cung cấp Cloud Computing lớn ở TQ, họ cũng có dịch vụ Serverless Function cho riêng mình. Chức năng và hoạt động cũng giống như các nhà cung cấp khác. 

Bên dưới là một sơ đồ mô hình serverless backend server bởi Alibaba:

![](https://1.bp.blogspot.com/-FiatH7qdS0s/XU5DlXF7h2I/AAAAAAABFXg/C_bHlQ1yotgYcfWZle0l9mRFbraGTkyqQCK4BGAYYCw/s1600/TB1OuNEG7yWBuNjy0FpXXassXXa-1530-1140.png)

Alibaba cho miễn phí 1 triệu request mỗi tháng, rất đáng để thử.

# 8. EdgeEngine

[EdgeEngine](https://www.stackpath.com/products/edge-computing/serverless-scripting/) by StackPath deploy serverless functions viết bằng JS, Perl, Rust, Go, C++, PHP, etc. cho thời gian thực thi và phản hồi rất nhanh, theo công bố là dưới 50ms. Cách hoạt động của EdgeEngine cũng gần giống như Cloudflare Workers.

![](https://4.bp.blogspot.com/-gL5OCoFFI9o/XU5Eb51EYHI/AAAAAAABFXs/eXY1IJgiPCg7wsiT-1y7IC07Ip5gwfxdgCK4BGAYYCw/s1600/stackpath-edgeengine-instant-global-deployment-1.png)

Chi phí bắt đầu từ $10 mỗi tháng bao gồm 15 triệu requests và không giới hạn số script.

# Kết luận

Sử dụng serverless là cách tốt nhất để tiết kiệm chi phí hosting và chi phí quản lý infrastructure. Move từ ứng dụng sẵn có sang serverless có thể khó khăn và rủi ro. Nhưng nếu bạn đang build mới, bạn có thể cân nhắc sử dụng kiến trúc serverless hay không.

Good luck!