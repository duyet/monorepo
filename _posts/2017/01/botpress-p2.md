---
template: post
title: 'Chatbot với Botpress - Phần 2: Coding'
date: "2017-01-24"
author: Van-Duyet Le
tags:
- Chatbot
- Javascript
- Node.js
- Node
modified_time: '2018-09-10T17:24:58.329+07:00'
thumbnail: https://3.bp.blogspot.com/-GXx1lZwBtgg/WIbK6HLTO8I/AAAAAAAAimw/B9qbrjjIQIMC2CxXk1O-xqYAbTMOe4rogCLcB/s1600/screenshot-ui.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3118916906750050409
blogger_orig_url: https://blog.duyet.net/2017/01/botpress-p2.html
slug: /2017/01/botpress-p2.html
category: Web
description: Chatbot với Botpress phần 2
fbCommentUrl: none
---

Tiếp tục phần 2, phần trước [Chatbot với Botpress](https://blog.duyet.net/2017/01/botpress.html#.WIarsRJ97_g) bạn đã có 1 bộ khung cho Bot chỉ với vài thao tác, [kết nối mới Messenger](https://blog.duyet.net/2017/01/botpress.html#KtniviMessenger) với Persistent Menu, Getting Started message, làm quen với postback, Auto response, ... module botpress-analytics để thống kê.

Về cơ bản Bot theo cơ chế lắng nghe lệnh (từ khóa) và trả lời. Sau mình sẽ ví dụ đơn giản về cách lập trình cho Bot, làm Bot thông minh hơn khi kết hợp với 1 số service API trí tuệ nhân tạo (Wit.ai, Api.ai, ...)

![](https://3.bp.blogspot.com/-GXx1lZwBtgg/WIbK6HLTO8I/AAAAAAAAimw/B9qbrjjIQIMC2CxXk1O-xqYAbTMOe4rogCLcB/s1600/screenshot-ui.png)

Xem lại phần 1: [Chatbot với Botpress - Phần 1: Init Chatbot](https://blog.duyet.net/2017/01/botpress.html#.WJP5QxJ97_g)

## Simple Hello World ##
OK để bắt đầu ta mở `index.js`

```js
module.exports = function(bp) {
  bp.middlewares.load()
}
```

Dòng 1: `bp` là biến global context object, từ `bp` ta có thể truy cập đến mọi chức năng của botpress và module api.
Dòng 2: Botpress sử dụng cơ chế middlewares để xử lý incoming và outcoming tin nhắn (hoặc tương tác).  Bạn có thể xem thêm về trang middleware [tại đây](https://docs.botpress.io/middlewares.html).

Bây giờ chúng ta thêm vào `index.js` như sau:

```js
module.exports = function(bp) {
  bp.middlewares.load()

  bp.hear('hello ku', event => { // Capture 'hello ku'
   bp.messenger.sendText(event.user.id, 'Hello world!') // Response
  })
}

```

Khởi động lại Botpress server.
Ở đây mình hardcoded, Bot sẽ lắng nghe chuỗi "hello ku" và trả lời "Hello world!". Đây chỉ là ví dụ cơ bản thôi, [hear](https://docs.botpress.io/core-reference.html) middleware thực sự rất hữu ích.

[![](https://1.bp.blogspot.com/--v33owHOC6Y/WIa2ZvmliqI/AAAAAAAAik4/EmA8Lc7XAgMAHGUHanOBtLs3uixdIlN1ACKgB/s640/Screenshot_2017-01-24-09-03-08-630_com.facebook.orca.png)](https://1.bp.blogspot.com/--v33owHOC6Y/WIa2ZvmliqI/AAAAAAAAik4/EmA8Lc7XAgMAHGUHanOBtLs3uixdIlN1ACKgB/s1600/Screenshot_2017-01-24-09-03-08-630_com.facebook.orca.png)

## Hello world nhưng bớt ngu hơn xíu ##
Bây giờ mình muốn mỗi khi bot nghe "hello" là tự động chào lại bằng tên (first_name) mình.

```js
module.exports = function(bp) {
  bp.middlewares.load()

  bp.hear(/hello/i, (event, next) => { // We use a regex instead of a hardcoded string
    const first_name = event.user.first_name

    bp.messenger.sendText(event.user.id, 'Hello, ' + first_name, { typing: true })
  })
}
```

- Ở lệnh `hear`, mình không dùng hardcoded string nữa mà sử dụng regex.  Bất kì tin nhắn nào chứa "hello" thì callback sẽ được gọi.
- Object `event.user` sẽ chứa mọi thông tin của user, mình sử dụng nó để reply lại chính tên người dùng. 
- Tham số thứ 3 của hàm `sendText`, ta dùng `{ typing: true }` messenger sẽ hiển thị hiệu ứng đang typing, nhìn sẽ thật hơn.

[![](https://4.bp.blogspot.com/-8vdkgAPplng/WIa4MtxfARI/AAAAAAAAilM/Ux0PKCpmXHoBui9hYc7fuO6busO4iJIaQCKgB/s640/Screenshot_2017-01-24-09-12-24-681_com.google.android.apps.photos.png)](https://4.bp.blogspot.com/-8vdkgAPplng/WIa4MtxfARI/AAAAAAAAilM/Ux0PKCpmXHoBui9hYc7fuO6busO4iJIaQCKgB/s1600/Screenshot_2017-01-24-09-12-24-681_com.google.android.apps.photos.png)

## Messenger Quick Reply ##
Quick Reply là chức năng trong Messenger, cho phép user thay vì phải chat thì có thể chọn 1 từ menu. Khai báo tham số quick_replies như sau:

```js
module.exports = function(bp) {
    bp.middlewares.load()

    bp.hear(/hello/i, (event, next) => { // We use a regex instead of a hardcoded string
        const first_name = event.user.first_name
        console.log('==========', event.user)

        bp.messenger.sendText(event.user.id, 'Hello, ' + first_name, { typing: true })
    })

    bp.hear(/help/i, (event, next) => {
        const options = {
            quick_replies: [{
                content_type: "text",
                title: "Đẹp",
                payload: "HELP_OPTION_1"
            }, {
                content_type: "text",
                title: "Rất đẹp",
                payload: "HELP_OPTION_2"
            }],
            typing: true,
            waitRead: true // `waitDelivery` or `waitRead` options
        }

        const text = 'Duyệt có đẹp trai không?'
        bp.messenger.sendText(event.user.id, text, options)
            .then(() => {
                // Do `waitRead` nên nội dung trong đây sẽ được thực thi khi user read. 
            })
    })
}

```

[![](https://1.bp.blogspot.com/-W7vlccclv-A/WIa9BT5alwI/AAAAAAAAil0/cGrnqfmlv_U-n2xJhOzgcZiZ9u9Oa0qDACKgB/s640/Screenshot_2017-01-24-09-32-42-123_com.facebook.orca.png)](https://1.bp.blogspot.com/-W7vlccclv-A/WIa9BT5alwI/AAAAAAAAil0/cGrnqfmlv_U-n2xJhOzgcZiZ9u9Oa0qDACKgB/s1600/Screenshot_2017-01-24-09-32-42-123_com.facebook.orca.png)

## Messenger Attachments ##
Messenger có thể gửi đính kèm với 4 định dạng: `'audio'`, `'file'`, `'image'` or `'video'`

```js
module.exports = function(bp) {
    bp.middlewares.load()

    bp.hear(/meo/i, event => {
        const type = 'image' // 'audio', 'file', 'image' or 'video'
        const img_url = 'https://avatars0.githubusercontent.com/u/5009534?v=3&s=460'
        bp.messenger.sendAttachment(event.user.id, type, img_url)
    })
}

```

Tham số thứ 3 `url` của file đính kèm.

[![](https://2.bp.blogspot.com/-cgMBrsS0v3E/WIa-rbq68cI/AAAAAAAAimE/0-05L5gKka8GI3qmJjjq20DrekMWIPjjwCKgB/s640/Screenshot_2017-01-24-09-40-29-234_com.facebook.orca.png)](https://2.bp.blogspot.com/-cgMBrsS0v3E/WIa-rbq68cI/AAAAAAAAimE/0-05L5gKka8GI3qmJjjq20DrekMWIPjjwCKgB/s1600/Screenshot_2017-01-24-09-40-29-234_com.facebook.orca.png)

## Messenger Templates ##
[Facebook hỗ trợ nhiều dạng message template](https://developers.facebook.com/docs/messenger-platform/send-api-reference/templates). Ví dụ như:

1. [Button Template](https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template)
2. [Generic Template](https://developers.facebook.com/docs/messenger-platform/send-api-reference/generic-template)
3. [List Template](https://developers.facebook.com/docs/messenger-platform/send-api-reference/list-template)
4. [Receipt Template](https://developers.facebook.com/docs/messenger-platform/send-api-reference/receipt-template)
5. [Airline Bording Pass](https://developers.facebook.com/docs/messenger-platform/send-api-reference/airline-boardingpass-template)
6. [Airline Checkin](https://developers.facebook.com/docs/messenger-platform/send-api-reference/airline-checkin-template)
7. [Airline Itinerary](https://developers.facebook.com/docs/messenger-platform/send-api-reference/airline-itinerary-template)
8. [Airline Flight Update](https://developers.facebook.com/docs/messenger-platform/send-api-reference/airline-update-template)

Để sử dụng chúng ta chỉ cần khai báo đúng template như trong [docs](https://developers.facebook.com/docs/messenger-platform/send-api-reference/templates) của facebook. Ví dụ:

```js
bp.hear(/duyetdev/i, event => {
    const payload = {
        template_type: "button",
        text: "duyetdev profile",
        buttons: [
            {
                type: "web_url",
                url: "https://duyet.net",
                title: "duyet.net"
            },
            {
                type: "web_url",
                url: "https://duyet.net",
                title: "Profile"
            },{
                type: "web_url",
                url: "https://facebook.com/duyetdev",
                title: "Facebook"
            },
        ]
    }

    bp.messenger.sendTemplate(userId, payload, { typing: true })
})
```

[![](https://4.bp.blogspot.com/-uw8VgTCx_n0/WIbDuJ6D-ZI/AAAAAAAAimg/gi7ug_nLreYFnbTCj5pPSxqr1ofyLvYfACK4B/s640/Screenshot_2017-01-24-09-59-12-331_com.facebook.orca.png)](https://4.bp.blogspot.com/-uw8VgTCx_n0/WIbDuJ6D-ZI/AAAAAAAAimg/gi7ug_nLreYFnbTCj5pPSxqr1ofyLvYfACK4B/s1600/Screenshot_2017-01-24-09-59-12-331_com.facebook.orca.png)

## Kết ##
ChatBot không chỉ phải biết trả lời theo từ khóa mà còn phải hiểu được ý người chat khi viết bằng nhiều cách khác nhau, phần tiếp theo chúng ta sẽ làm cho con ahihi "thông minh" hơn bằng cách kết hợp với các Service API NLP để get được context, object, ... từ tin nhắn của người dùng.

Nếu có thời gian mình sẽ viết 1 bài tự build ra model cho Bot để có thể đọc hiểu và trả lời ở mức cơ bản.

Xem phần 1: [Chatbot với Botpress - Phần 1: Init Chatbot](https://blog.duyet.net/2017/01/botpress.html#.WJP5QxJ97_g)

## Tham khảo ##

1. [Nodejs - Chatbot với Botpress](https://blog.duyet.net/2017/01/botpress.html)
2. [Botpress Advanted Topics](https://docs.botpress.io/advanced-topics.html)
3. [Botpress Messenger](https://github.com/botpress/botpress-messenger)
4. [Messenger Platform - Facebook Developers](https://developers.facebook.com/docs/messenger-platform).
