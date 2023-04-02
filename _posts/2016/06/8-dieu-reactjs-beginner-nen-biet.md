---
template: post
title: 8 điều React.js beginner nên biết
date: "2016-06-25"
author: Van-Duyet Le
tags:
- Beginner
- Redux
- Redux Dev Tools
- NPM
- ES6
- Babel
- React
- React Dev Tools
modified_time: '2016-06-26T18:04:26.960+07:00'
thumbnail: https://1.bp.blogspot.com/-KtYQVNUSOhM/V25BbTCHiII/AAAAAAAAYQk/-9QPfR5wy5ImvMrLutGZEklZSuz-0IZkgCK4B/s1600/1-MG736zGtLMBbSkhwu4D3cA.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2779797443065449271
blogger_orig_url: https://blog.duyet.net/2016/06/8-dieu-reactjs-beginner-nen-biet.html
slug: /2016/06/8-dieu-reactjs-beginner-nen-biet.html
category: Javascript
description: Mình bắt đầu nghiên cứu và sử dụng React.js một thời gian. Phải nói React và React Native là một trong nghệ của tương lai, sẽ phát triển mạnh.

fbCommentUrl: http://blog.duyetdev.com/2016/06/8-dieu-reactjs-beginner-nen-biet.html
---

Mình bắt đầu nghiên cứu và sử dụng [React.js](https://facebook.github.io/react/index.html) một thời gian. Phải nói React và React Native là một trong nghệ của tương lai, sẽ phát triển mạnh.

Có một số điểm và kinh nghiệm khi các bạn mới học React hoặc Redux nên biết qua.

![](https://1.bp.blogspot.com/-KtYQVNUSOhM/V25BbTCHiII/AAAAAAAAYQk/-9QPfR5wy5ImvMrLutGZEklZSuz-0IZkgCK4B/s1600/1-MG736zGtLMBbSkhwu4D3cA.png)

## 1. React chỉ là View Library ##
React không phải là một MVC framework như những framework khác. Đây chỉ là thư viện của Facebook giúp render ra phần view. Vì thế React sẽ không có phần M - Model và C - Controller, mà phải kết hợp với các thư viện khác. React cũng sẽ không có 2-way binding hay là Ajax, ...

## 2. Hãy giữ Components luôn nhỏ gọn ##
Bất cứ lập trình giỏi nào cũng đều biết, giữ cho function/class càng nhỏ gọn thì sẽ càng dễ hiểu và dễ bảo trì. Với React cũng vậy, và Components nhỏ sẽ đúng với tinh thần Thinking in React, chia các phần thành các Component nhỏ nhất có thể, để có thể tái sử dụng và hiệu năng cao. Độ chia nhỏ tùy thuộc và mức độ của Team nữa.

Ví dụ với với Components hiển thị danh sách bài viết liên quan ở cuối:

```js
const LatestPostsComponent = props => (
  <section>
    <div><h1>Latest posts</h1></div>
    <div>
      { props.posts.map(post => <PostPreview key={post.slug} post={post}/>) }
    </div>
  </section>
);
```

`<LastestPostsComponent />`  chỉ chứa 1 thẻ `<h1>` và mỗi `posts` được truyền cho components khác `<PostPreview />`

## 3. Write functional components ##
Có nhiều cách để viết Components, thứ nhất sử dụng `React.createClass()`:

```js
const MyComponent = React.createClass({
  render: function() {
    return <div className={this.props.className}/>;
  }
});
```

Và bằng ES6

```js
class MyComponent extends React.Component {
  render() {
    return <div className={this.props.className}/>;
  }
}
```

React 0.14 mới cho phép bạn viết nhanh 1 Components bằng 1 hàm với tham số `props`:

```js
const MyComponent = props => (
  <div className={props.className}/>
);
```

Với các Components lớn và nhiều xử lý, nên sử dụng cách 1 hoặc 2. Còn trong đa số các trường hợp khác, Components không cần `state`, chỉ `render()` từ `props` thì nên sử dụng cách thứ 3 này, giúp cho ứng dụng mạch lạc và nhanh hơn.

## 4. Sử dụng ít State components ##
State lưu giữ linh hồn của ứng dụng. React với các ứng dụng lớn và mở rộng liên tục, ta nên giữ State luôn đơn giản (stateless components).

- State làm cho test khó khăn hơn.
- State liên quan đến việc render() hiển thị, mỗi lần render() ta sẽ quan tâm: đã khởi tạo dữ liệu cho state hay chưa, state có thay đổi hay chưa, có nên render() lại hay không, ... 
- State chỉ tồn tại nội bộ trong 1 Components, với việc trao đổi dữ liệu với bên ngoài, việc sử dụng nhiều  state là không cần thiết. 

Chỉ sử dụng State khi cần thiết, và phản ánh đúng trạng thái của Components.

## 5. Kết hợp với Redux.js ##
React chỉ là View, nên việc kết hợp với [Redux](http://redux.js.org/), Flux, hay bất cứ mô hình luồng dữ liệu là cần thiết. Hiện tại mình thấy Redux đang có khá nhiều người sử dụng, và tư duy của nó cũng khá hay. Sau khi học React bạn tiếp tục kết hợp với Redux trong các ứng dụng.

[![](https://1.bp.blogspot.com/--30x560n-uU/V24_4PXcD3I/AAAAAAAAYQU/vxp2C7rvkNcuGXn8f0WxbyKzNjx-IKzLgCK4B/s640/1-dODKUGyGkF8qeGLrXKWkiA.png)](https://1.bp.blogspot.com/--30x560n-uU/V24_4PXcD3I/AAAAAAAAYQU/vxp2C7rvkNcuGXn8f0WxbyKzNjx-IKzLgCK4B/s1600/1-dODKUGyGkF8qeGLrXKWkiA.png)

Ảnh: code-cartoons.com

Một thư viện khác cũng nên quan tâm là [Immutable.js](https://facebook.github.io/immutable-js/) 

## 6. Luôn sử dụng propTypes ##
[propTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) định nghĩa, ràng buộc cho Props trong React Components, propTypes giúp cho người khác sử dụng các Components của chúng ta an toàn hơn.

```js
const ListOfNumbers = props => (
  <ol className={props.className}>
    {
      props.numbers.map(number => (
        <li>{number}</li>)
      )
    }
  </ol>
);

ListOfNumbers.propTypes = {
  className: React.PropTypes.string.isRequired,
  numbers: React.PropTypes.arrayOf(React.PropTypes.number)
};
```

Trong môi trường developments, nếu chúng ta truyền vào cho `props` sai kiểu dữ liệu, hoặc quên truyền dữ liệu cho `props`. React sẽ báo lỗi, và chúng ta phải kiểm tra bằng tay.
Ở ví dụ trên, `props.className` phải có kiểu `string` và `isRequired` (bắt buộc phải có), tương tự `numbers` phải là một `array` của `number`

## 7. Sử dụng JSX, ES6, Babel, Webpack, và NPM ##
[JSX](https://facebook.github.io/jsx/) (XML-like syntax extension to ECMAScript) là tính năng hay của React, những gì chúng ta viết sẽ là những gì hiển thị. Kết hợp với Babel, biên dịch và tận dụng [các tính năng mới của ES6](http://es6-features.org/). [NPM](https://www.npmjs.com/) và [Webpack](https://webpack.github.io/) giúp quá trình đóng gói và tận dụng các thư viện triệt để hơn.

## 8. Sử dụng React và Redux dev tools ##

Cuối cùng các trình Dev Tools của Redux và React sử dụng rất tốt, giúp chúng ta nhanh chóng Debug và tìm ra lỗi trong ứng dụng.

[React dev tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) có thể inspect ngược lại các Components của React, trạng thái các Props và State của từng Component.
Redux Dev Tools còn [hay hơn](https://www.youtube.com/watch?v=xsSnOQynTHs), giúp bạn quan sát được trạng thái actions, lý do thay đổi State, và back lại state trước. Tải vê Redux Dev Tools ở [Github](https://github.com/gaearon/redux-devtools) hoặc [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en).

[![](https://4.bp.blogspot.com/-VTtgxf13hdo/V24_YXHeb3I/AAAAAAAAYQM/kOlnn_Izy446MH_zpAmgJQfngN1__PWMgCK4B/s1600/react-dev-tools.jpg)](https://4.bp.blogspot.com/-VTtgxf13hdo/V24_YXHeb3I/AAAAAAAAYQM/kOlnn_Izy446MH_zpAmgJQfngN1__PWMgCK4B/s1600/react-dev-tools.jpg)

## Tham khảo ##
[A cartoon intro to Redux](http://saveto.co/lm4l1Z)
[React Developer Tools - Chrome Web Store](http://saveto.co/oedqhg)
