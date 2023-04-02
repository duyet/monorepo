---
template: post
title: Guess.js
date: "2019-08-09"
author: Van-Duyet Le
category: Javascript
tags:
- Data
- Web
- Data Engineer
- Javascript

thumbnail: https://4.bp.blogspot.com/-Gjsnx_YH4HM/XU2UV2DlnnI/AAAAAAABFVM/LjDl6ilxQeYPzQgs_acID9VEwy4L62QsACK4BGAYYCw/s200/guess.png
slug: /2019/08/guess-js.html
description: Guess.js - Thư viện và công cụ cải thiện UX dựa trên Dữ liệu, thống kê và Machine Learning. Và cách cài đặt plugin Gatsby. 
fbCommentUrl: none
---

Guess.js là một tập các thư viện và công cụ giúp sử dụng dữ liệu và thuật toán để cải thiện UX của trang. Thư viện gồm các thuật toán sử dụng nội dung trang và dữ liệu Google Analytics, sử dụng [predictive analytics](https://en.wikipedia.org/wiki/Predictive_analytics) để cải thiện hiệu năng tải trang thông qua `<link rel="[prerender/prefetch/preload]">`, quyết định xem nên tải tài nguyên nào trước. Dự đoán người dùng bấm vào link nào tiếp theo từ trang hiện tại.


Preloading tài nguyên là một cách hay để cải thiệu hiệu năng trang. Tuy nhiên preloading mọi thứ sẽ khiến lãng phí băng thông, đặt biệt là với mobile, guess.js sẽ giúp bạn điều này.

![Guess.js](https://4.bp.blogspot.com/-Gjsnx_YH4HM/XU2UV2DlnnI/AAAAAAABFVM/LjDl6ilxQeYPzQgs_acID9VEwy4L62QsACK4BGAYYCw/s400/guess.png)


Bạn có thể xem thông báo ra mắt chính thức của Guess.js bởi Addy Osmani và Ewa Gasperowicz tại Google I/O 2018: 

<iframe width="560" height="315" src="https://www.youtube.com/embed/Mv-l3-tJgGk?start=2275" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


# Cài đặt Guess.js vào Gatsby

Với plugin [gatsby-plugin-guess-js](https://www.gatsbyjs.org/packages/gatsby-plugin-guess-js/) Guess.js sẽ tự động dữ liệu từ Google Analytics lúc build để tạo model predict, trang nào có xác suất được người dùng bấm vào nhiều nhất từ trang hiện tại.

Plugin sẽ làm 2 việc:
- Khi generate HTML pages, tự động thêm `<link prefetch>` cho các tài nguyên của các trang có  xác suất cao sẽ được user xem tiếp. Có nghĩa là ngay khi người dùng vừa truy cập, trình duyệt sẽ tự động tải các trang tiếp theo dưới background. 
- Khi một người dùng đã xem một vài trang, plugin sẽ tiếp tục dự đoán các trang tiếp theo nữa và prefetch tài nguyên.

## Cài đặt

```
npm install --save gatsby-plugin-guess-js
```

Mở file `gatsby-config.js`

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-guess-js",
      options: {
        // Find the view id in the GA admin in a section labeled "views"
        GAViewID: `VIEW_ID`,
        minimumThreshold: 0.03,
        // The "period" for fetching analytic data.
        period: {
          startDate: new Date("2018-1-1"),
          endDate: new Date(),
        },
      },
    },
  ],
}
```

Tích hợp với CI

Việc tích hợp với CI sẽ có thể có lỗi vì plugin sẽ hiện thông báo đăng nhập vào tài khoản Google Analytics để lấy dữ liệu, bạn có thể cài đặt `jwt` để tự động truy cập dữ liệu

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-guess-js",
      options: {
        // Find the view id in the GA admin in a section labeled "views"
        GAViewID: `VIEW_ID`,
        minimumThreshold: 0.03,
        // Set Google Analytics jwt with Google Service Account email and private key
        jwt: {
          client_email: `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
          private_key: `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`,
        },
        // The "period" for fetching analytic data.
        period: {
          startDate: new Date("2018-1-1"),
          endDate: new Date(),
        },
      },
    },
  ],
}
```

# References

- Machine Learning-Driven Bundling. The Future of JavaScript Tooling. https://blog.mgechev.com/2018/03/18/machine-learning-data-driven-bundling-webpack-javascript-markov-chain-angular-react/
- Teach Your Bundler Users’ Habits https://www.youtube.com/watch?v=L5tPWCB7jX0
- Predictive analytics https://en.wikipedia.org/wiki/Predictive_analytics
- Guess.js organization on GitHub https://github.com/guess-js
- Guess.js Route Parser https://github.com/guess-js/guess/tree/master/packages/parser#react
- Guess.js on GitHub https://github.com/guess-js/guess
- Gatsby.js https://www.gatsbyjs.org/
- Guess.js plugin for Gatsby https://github.com/guess-js/gatsby-guess
- Demo of Gatsby.js using Guess.js https://guess-gatsby-wikipedia.firebaseapp.com/
