---
template: post
title: 'React + Redux cơ bản - Phần 1: Component, JSX, Props & State'
date: "2016-06-23"
author: Van-Duyet Le
tags:
- Redux
- Tutorial
- Tutorials
- Babel
- React
- Webpack
modified_time: '2016-07-07T21:19:47.188+07:00'
thumbnail: https://3.bp.blogspot.com/-BE6HQe1NzmM/V2rk2jjMk8I/AAAAAAAAYAs/7yUcpn2MzPIWPTxqZ6eZ3S84OHd5opEOwCK4B/s1600/React%2B1.0.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8141507994081076773
blogger_orig_url: https://blog.duyet.net/2016/06/react-redux-chap-1.html
slug: /2016/06/react-redux-chap-1.html
category: Javascript
description: Mình sẽ dành 1 chuỗi bài để viết về React, kết hợp với mô hình Redux, sử dụng Webpack để đóng gói và kết hợp với Sails.js để làm RESTful API Server.
fbCommentUrl: http://blog.duyetdev.com/2016/06/react-redux-chap-1.html
---

Mình sẽ dành 1 chuỗi bài để viết về [React](https://facebook.github.io/react), kết hợp với mô hình [Redux](https://github.com/reactjs/redux), sử dụng Webpack để đóng gói và kết hợp với Sails.js để làm RESTful API Server.

[![](https://3.bp.blogspot.com/-BE6HQe1NzmM/V2rk2jjMk8I/AAAAAAAAYAs/7yUcpn2MzPIWPTxqZ6eZ3S84OHd5opEOwCK4B/s400/React%2B1.0.png)](https://blog.duyet.net/2016/06/react-redux-chap-1.html)

Một số kiến thức cần nằm trước
- Node.js, NPM
- Sails.js: Xem lại bài [giới thiệu Sails.js](https://blog.duyet.net/2015/08/gioi-thieu-sailsjs-framework.html#.V2q8nYN97nU)
- Webpack
- Sử dụng Ubuntu (Windows tương tự)

## React Component ##
React.JS là một thư viện Javascript dùng để xây dựng giao diện người dùng. React được ví như phần View của mô hình MVC.
React được xây dựng xung quanh các Component, chứ không dùng template như các framework khác.

Bạn có thể tạo ra một component bằng các gọi phương thức createClass của đối tượng React.

```
var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

ReactDOM.render(<HelloMessage name="Duyệt" />, document.body);
```

Phương thức createClass nhận vào một tham số, là đối tượng mô tả đặc tính của component. Đối tượng này bao gồm tất cả các phương thức để hình thành nên component. Phương thức quan trọng nhất là render, phương thức này được trigger khi component đã sẵn sàng để được render lên trên page.
Trong các bài viết sau mình sẽ khuyến khích sử dụng class của ES6 hơn.

## JSX  -  Javascript Syntax Extension ##

Như ở ví dụ trên, mình viết HTML trong file Javascript. Đây đơn giản là một syntax extension của Javascript. Với nó bạn có thể viết Javascript với những tag giống như XML (XML-like). Về bản chất, các tag thực sự là những lời gọi hàm, sẽ được chuyển đổi trong React code và end up dưới dạng HTML và Javascript trong cây DOM. 

JSX render sẽ mô tả rõ nhất về những gì sẽ được hiển thị ra. 

## Props & State ##

Hai thuộc tính quan trọng của một React Component là Props và State. Sự khác biệt giữa hai kiểu thì hơi khó khăn để hiểu ngay từ ban đầu, ít nhất là về mặt khái niêm. Nhưng một khi bạn bắt đầu code, bạn sẽ nhanh chóng tách biệt được hai loại.

![](https://3.bp.blogspot.com/-FHsVtE24scg/V2rmbUfJytI/AAAAAAAAYBA/yGNf4ZsC2S46HVyteDYaqlsr7VA-TGslgCK4B/s400/screencapture-aeflash-com-imgs-data_flow2-svg-1466623529000.png)

- State biểu diễn  "trạng thải" của Component, state là private và chỉ có thể được thay đổi bên trong bản thân component.
- Props thì mang tính external, và không bị kiểm soát bởi bản thân component. Nó được truyền từ component cao hơn theo phân cấp, hay có thể hiểu đơn giản là truyền từ component cha xuống component con. Ở ví dụ trên `<HelloMessage name="Duyệt" />` thì `name` là một props.

State thay đổi, còn Props thì read-only trong mỗi Components. Chúng ta sẽ đi rõ ở các phần sau.

## Ứng dụng React đơn giản đầu tiên ##

### 1. Tạo thư mục project, cấu hình package.json và Webpack. ###

Tạo thư mục project

```
mkdir react-ex1 && cd $_
```

Cấu hình `package.json`

```
npm init
```

Điền các thông tin như hình:

[![](https://3.bp.blogspot.com/-BG5hFSC-JH8/V2rSS7ZFKbI/AAAAAAAAX_U/cOVSWB8dB1geGAcwQe6UsZQDlwGBdt3hACLcB/s1600/_react-1.png)](https://3.bp.blogspot.com/-BG5hFSC-JH8/V2rSS7ZFKbI/AAAAAAAAX_U/cOVSWB8dB1geGAcwQe6UsZQDlwGBdt3hACLcB/s1600/_react-1.png)

Ta được file package.json lưu lại thông tin các package của project. 

### 2. Cài đặt React + Webpack + Babel ###
Lần lượt cài đặt React, Webpack và Babel (để viết ES6) bằng các lệnh sau:

```
npm i react react-dom --save # Install React 
npm i babel babel-core babel-loader babel-preset-es2015 babel-preset-react webpack --save-dev
npm i -g webpack # Webpack global
npm i -g static-html-server # Static server để giả lập server HTTP

```

### 3. Cấu hình Webpack  ###
Tạo file webpack.config.js với nội dung sau:

```
var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
    entry: APP_DIR + '/index.jsx',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: { presets: ['es2015', 'react'] }
        }],
    },
};

module.exports = config;
```

Và cấu trúc thư mục như hình: 

[![](https://4.bp.blogspot.com/-r2qmxSXqm2k/V2rWi5K8MsI/AAAAAAAAX_k/K6uv74Zde08ZlcAYkZaCSHnSgBS9zohMACK4B/s1600/_react_2.png)](https://4.bp.blogspot.com/-r2qmxSXqm2k/V2rWi5K8MsI/AAAAAAAAX_k/K6uv74Zde08ZlcAYkZaCSHnSgBS9zohMACK4B/s1600/_react_2.png)

### 4. React Component <App /> ###
Tạo file `src/index.jsx` với nội dung như sau: 

```
import React from 'react';
import { render } from 'react-dom';

class App extends React.Component {
  render() {
    return (
      <div>Hello World!</div>
    );
  }
}

render(<App />, document.getElementById('app'));
```

Và file `index.html`

```
<!DOCTYPE html>
<html>
<head>
 <title>React by @duyetdev</title>
</head>
<body>
 <div id="app"></div>
 <script type="text/javascript" src="./build/bundle.js"></script>
</body>
</html>
```

Sau khi hoàn tất, khởi động webpack để tiến hành build toàn bộ source thành file `build/bundle.js` và được sử dụng trong `index.html`

[![](https://1.bp.blogspot.com/-wliVdNybXQY/V2rZqMQkEeI/AAAAAAAAX_w/JGv8wpbUtfoLgzSUAWUrlUaFQOpzq7k_QCK4B/s1600/_react-3.png)](https://1.bp.blogspot.com/-wliVdNybXQY/V2rZqMQkEeI/AAAAAAAAX_w/JGv8wpbUtfoLgzSUAWUrlUaFQOpzq7k_QCK4B/s1600/_react-3.png)

Mở Terminal mới, sử dụng `static-html-server` để khởi động static server

[![](https://4.bp.blogspot.com/-kICoxXoeiUg/V2raa0R0uZI/AAAAAAAAX_8/kKZJHe2mJa0n2rD4ZH1xbSp0_4tzsNiPwCK4B/s1600/_react-4.png)](https://4.bp.blogspot.com/-kICoxXoeiUg/V2raa0R0uZI/AAAAAAAAX_8/kKZJHe2mJa0n2rD4ZH1xbSp0_4tzsNiPwCK4B/s1600/_react-4.png)

Sau đó truy cập vào địa chỉ `http://localhost:7788` bằng trình duyệt.

[![](https://4.bp.blogspot.com/-LYitq5P93h4/V2ra5p85bOI/AAAAAAAAYAE/paXWTLZCttwGAVwESHYOpUrG-b5KFGxSACK4B/s1600/_react_5.png)](https://4.bp.blogspot.com/-LYitq5P93h4/V2ra5p85bOI/AAAAAAAAYAE/paXWTLZCttwGAVwESHYOpUrG-b5KFGxSACK4B/s1600/_react_5.png)

Vậy là đã xong bước nhập môn Hello World với React và Webpack.
Webpack với tham số --watch sẽ tự động build lại mỗi khi file source thay đổi, nên bạn sẽ không cần chạy lại webpack mỗi lần build.

### 5. Sử dụng Props  ###
Ví dụ sau hướng dẫn bạn cách sử dụng Components và Props trong React.
Tạo file mới đặt tên `src/Hello.jsx` với nội dung:

```
import React, { PropTypes, Component } from 'react';

export default class Message extends Component {
  render() {
    return (
      <div>Hello { this.props.name }</div>
    );
  }
}

Message.propTypes = {
 name: PropTypes.string.isRequired
}
```

Và cập nhật lại file src/index.jsx như sau: 

```
import React from 'react';
import { render } from 'react-dom';
import Message from './Message.jsx';

class App extends React.Component {
  render() {
    return (
      <div>
       <Message name='Duyệt' />
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
```

Như bạn thấy, `index.jsx` sẽ import Message Components, trong giao thức `render()` của `<App />` sử dụng `<Message />` như một thẻ trong HTML, truyền vào tham số `name="Duyệt"`, đây được gọi là `props.name`.

Trong Message Component nhận được props này và sử dụng dưới dạng `this.props.name`.

Mở lại trình duyệt để xem kết quả:

[![](https://2.bp.blogspot.com/-ZwpbyhibzSM/V2rfOQhY8jI/AAAAAAAAYAU/jo6JoN_MPtwYhMO8qQACrr2wkKn8InzgQCK4B/s1600/_react_6.png)](https://2.bp.blogspot.com/-ZwpbyhibzSM/V2rfOQhY8jI/AAAAAAAAYAU/jo6JoN_MPtwYhMO8qQACrr2wkKn8InzgQCK4B/s1600/_react_6.png)

### 6. Sử dụng State và Event  ###
Như đã nói React tập trung xử lý view, thành phần state trong React rất mạnh nhưng bản thân React không có các chức năng như xử lý Event hay 2-way binding, ta phải xử lý chúng bằng tay dựa vào các Event mặc định của DOM.

Ta viết thêm `<input />` và hàm `onChange` cho Component `<App />`

```
import React from 'react';
import { render } from 'react-dom';
import Message from './Message.jsx';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      name: 'Duyệt'
    }
  }

  onChange(e) {
    this.setState({name: e.target.value});
  }

  render() {
    return (
      <div>
        <input type='text' onChange={this.onChange.bind(this)} />
        <Message name={this.state.name} />
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
```

1. Ban đầu chúng ta khởi tạo state với `{ name:  'Duyệt' } `
2. Hàm `onChange` được gọi mỗi khi thay đổi giá trị trong input box, giá trị input sẽ thay đổi state name thông qua hàm `setState`
3. `state.name` được truyền vào Component thông qua `props`
4. Mỗi khi `state.name` thay đổi thì `<Message />` sẽ được render lại. Kết quả bạn xem tại trình duyệt. 

`![](https://3.bp.blogspot.com/-bnFowNNwjo4/V2riRkfIM_I/AAAAAAAAYAg/1KDbCrfYa-AF9npMVy6494lM92T3cgGZACK4B/s1600/_react_7.png)`

```

```

### 7. Sử dụng các thư viện của Node.js ###
Sử dụng Webpack để build bundle và sử dụng NPM để quản lý. Bạn cũng có thể sử dụng kết hợp với các thư viện của Node.js như (lodash, moment, crypt, ...) một cách dễ dàng. Chỉ cần cài đặt NPM và Import vào để sử dụng.

## Tổng kết  ##
Mình đã hướng dẫn các bạn tạo nên một ứng dụng cơ bản với React và Webpack. Hiểu được 2 thành phần Props và State.
Phần tiếp theo sẽ giải thích Virtual DOM, xây dựng ứng dụng TODO List, Load CSS trực tiếp vào JSX và các phương thức điều khiển React Lifecycle.

Source code: [https://github.com/labx-tech/react-redux-training/tree/master/react-week-1](https://github.com/labx-tech/react-redux-training/tree/master/react-week-1)
Nhớ theo dõi hoặc [đăng ký nhận bài viết mới qua Email tại đây](http://saveto.co/sfZ60w) nhé.

Xem thêm: [8 điều React.js beginner nên biết](https://blog.duyet.net/2016/06/8-dieu-reactjs-beginner-nen-biet.html#.V35k3qx97IU)
