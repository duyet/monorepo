---
template: post
title: "Pricetrack: theo dõi giá và cashback (by Firebase)"
date: "2019-05-13"
author: Van-Duyet Le
category: Project
tags:
- Firebase
- Firebase Functions
- Firebase Hosting
- Side Project
- Project

thumbnail: https://1.bp.blogspot.com/-YI_vbZhajkU/XNl4r1H3CRI/AAAAAAABAgI/eZRSFuf3RXQsltqLb2_ObS_lWlE475n5wCLcBGAs/s1600/screenshot-detail.png
blogger_orig_url: https://blog.duyet.net/2019/05/pricetrack-cashback.html
slug: /2019/05/pricetrack-cashback.html
description: "Pricetrack (https://pricetrack.web.app) là một side project nhỏ của mình với chức năng theo dõi giá liên tục từ các trang TMDT (tiki.vn, shopee.vn, ...), thông báo và cashback hoàn tiền.
Vì hay mua sắm nên pricetrack giúp mình check được giá ảo lên xuống thất thường, hoặc track khi nào có khuyến mãi thì mua.
Khi giá thay đổi, giảm hoặc dưới ngưỡng mong muốn, tracker sẽ alert thông qua email hoặc push notification qua trình duyệt. Được build hoàn toàn từ Firebase của Google, trong lúc mình test các dịch vụ của nền tảng này thì pricetrack ra đời."
fbCommentUrl: https://blog.duyetdev.com/2019/05/pricetrack-cashback.html
---

Pricetrack ([https://pricetrack.web.app](https://pricetrack.web.app/)) là một side project nhỏ của mình với chức năng theo dõi giá liên tục từ các trang TMDT (**tiki.vn, shopee.vn, ...**), thông báo và **[cashback](https://tracker.duyet.net/cashback/)** hoàn tiền.  
Vì hay mua sắm nên pricetrack giúp mình check được giá ảo lên xuống thất thường, hoặc track khi nào có khuyến mãi thì mua.  
Khi giá thay đổi, giảm hoặc dưới ngưỡng mong muốn, tracker sẽ alert thông qua email hoặc push notification qua trình duyệt. Được build hoàn toàn từ [Firebase](http://firebase.google.com/) của Google, trong lúc mình test các dịch vụ của nền tảng này thì pricetrack ra đời.  


**Update 2021**: Sau một thời gian thì chi phí cho Firebase khá tốn kém, như một số bạn đã báo trước với mình như thế. 
Vì project này mình muốn thử các tính năng của Firebase thôi, do đó mình đã cho dừng một số API crawling. 
Khi có thời gian mình sẽ refactor tại với một infra mới hiệu quả và ít tốn kém hơn.


[![](https://1.bp.blogspot.com/-YI_vbZhajkU/XNl4r1H3CRI/AAAAAAABAgI/eZRSFuf3RXQsltqLb2_ObS_lWlE475n5wCLcBGAs/s1600/screenshot-detail.png)](https://1.bp.blogspot.com/-YI_vbZhajkU/XNl4r1H3CRI/AAAAAAABAgI/eZRSFuf3RXQsltqLb2_ObS_lWlE475n5wCLcBGAs/s1600/screenshot-detail.png)

  
Các service [pricetrack](https://tracker.duyet.net/) sử dụng bao gồm:  

1.  Backend: [Firebase Functions](https://firebase.google.com/docs/functions) (Nodejs 8.x) với chức năng Serverless như AWS Lambda
2.  Database: [Firestore](https://firebase.google.com/docs/firestore)
3.  Frontend: [Firebase Hosting](https://firebase.google.com/docs/hosting) (+ [GatsbyJS](https://www.gatsbyjs.org/) Framework) + [Firebase Authentication](https://firebase.google.com/docs/auth)

Demo: [https://pricetrack.web.app](https://pricetrack.web.app/) hoặc [https://tracker.duyet.net](https://tracker.duyet.net/)  
Source code: [https://github.com/duyet/pricetrack](https://github.com/duyet/pricetrack)  
  
**Pricetrack hoạt động như thế nào?**  

1.  User đăng nhập vào frontend. Thêm các URL sản phẩm cần theo dõi
2.  Các worker (thực chất là firebase functions) sẽ chạy định kỳ 15 phút, crawl và lấy thông tin sản phẩm bao gồm giá, tên, tồn kho, ...
3.  Nếu có thay đổi sẽ trigger function alert theo thông tin trên Firestore DB.
4.  Chức năng cashback hoàn tiền được cung cập bởi [Accesstrade](https://s.duyet.net/r/accesstrade)

Mỗi URL chạy 15 phút, với số lượng nhỏ tầm 500 urls trên hệ thống này thì chi phí gọi functions và read/write Firestore cũng cần được quan tâm. Mình có dự định move các worker này sang các platform khác tiết kiệm hơn. Serverless chưa chắc là đã ít tốn kém hơn truyền thống.


[![](https://4.bp.blogspot.com/-yjLFKumnkqU/XNl8gozJj2I/AAAAAAABAgs/SZGXZ2gb4jUTS9RKbBvemyoN3UwUEzGGwCLcBGAs/s1600/Screen%2BShot%2B2019-05-13%2Bat%2B9.17.24%2BPM.png)](https://4.bp.blogspot.com/-yjLFKumnkqU/XNl8gozJj2I/AAAAAAABAgs/SZGXZ2gb4jUTS9RKbBvemyoN3UwUEzGGwCLcBGAs/s1600/Screen%2BShot%2B2019-05-13%2Bat%2B9.17.24%2BPM.png)

Với khoản 300 urls mình tốn hơn 31.000 lần gọi functions một ngày

  

Nếu có thời gian mình sẽ có một bài chi tiết để build pricetracker trên Firebase step-by-step, nhược điểm và khó khăn khi sử dụng Firebase. Sau đây là screenshot quảng cáo.  
  

[![](https://4.bp.blogspot.com/-qWer4_8UhKc/XNl84gVOOtI/AAAAAAABAg0/EpXkmgbUE5Y7df0o_4WvOrk9wTzBfYYSgCLcBGAs/s1600/screenshot-home.png)](https://4.bp.blogspot.com/-qWer4_8UhKc/XNl84gVOOtI/AAAAAAABAg0/EpXkmgbUE5Y7df0o_4WvOrk9wTzBfYYSgCLcBGAs/s1600/screenshot-home.png)


[![](https://2.bp.blogspot.com/-10Mnwwqwpw8/XNl86re22sI/AAAAAAABAg4/B67YJ6cS5Ds8iFZc775w5L46ZWSw01hAwCLcBGAs/s1600/screenshot-detail.png)](https://2.bp.blogspot.com/-10Mnwwqwpw8/XNl86re22sI/AAAAAAABAg4/B67YJ6cS5Ds8iFZc775w5L46ZWSw01hAwCLcBGAs/s1600/screenshot-detail.png)


[![](https://4.bp.blogspot.com/-El1Ibr9MTN0/XNl87g5iGpI/AAAAAAABAg8/dAp5GoZidschzMs3zy8ftuiSBlDVIoUNwCLcBGAs/s1600/screenshot-about.png)](https://4.bp.blogspot.com/-El1Ibr9MTN0/XNl87g5iGpI/AAAAAAABAg8/dAp5GoZidschzMs3zy8ftuiSBlDVIoUNwCLcBGAs/s1600/screenshot-about.png)


[![](https://2.bp.blogspot.com/-IYU-qtevl4c/XNl88SOs9cI/AAAAAAABAhA/VVYy92Ykqf4Y_dSHavmXrfV30Ia2gyRxgCLcBGAs/s1600/screenshot-cashback.png)](https://2.bp.blogspot.com/-IYU-qtevl4c/XNl88SOs9cI/AAAAAAABAhA/VVYy92Ykqf4Y_dSHavmXrfV30Ia2gyRxgCLcBGAs/s1600/screenshot-cashback.png)
  

[![](https://2.bp.blogspot.com/-_GpCFBsDRO0/XNl9CAP1VSI/AAAAAAABAhE/lmOIFpbksU0YrK7ol3XZ_r_h6NDkpLjkgCLcBGAs/s1600/intro-raw-api.png)](https://2.bp.blogspot.com/-_GpCFBsDRO0/XNl9CAP1VSI/AAAAAAABAhE/lmOIFpbksU0YrK7ol3XZ_r_h6NDkpLjkgCLcBGAs/s1600/intro-raw-api.png)
