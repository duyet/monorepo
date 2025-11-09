---
title: Offline-First trong Modern Web
date: '2016-01-07'
author: Duyet
tags:
  - Web
  - Offline
modified_time: '2016-01-11T01:58:30.083+07:00'
thumbnail: https://3.bp.blogspot.com/-kknlRujasGI/Vo6QpZWVJJI/AAAAAAAAN2U/Z2VbLAWnQOA/s1600/offline-text%2BMJN%2BTech%2BWeb.png
slug: /2016/01/offline-first-trong-modern-web.html
category: Web
description: '"Web" và "Online" là gần như là 2 khái niệm đi liền với nhau. Nhưng gần đây xu thế mới trong thế giới web còn tồn tại 1 khái niệm nữa là công nghệ web offline, offline-first.'
---

> **Lưu ý (2025):** Bài viết này được viết vào năm 2016, nhưng các khái niệm về offline-first vẫn còn rất có giá trị trong thời đại PWAs (Progressive Web Apps) ngày nay. Service Workers và IndexedDB đã trở thành tiêu chuẩn trong phát triển web hiện đại. Một số công cụ và liên kết trong bài có thể đã lỗi thời hoặc ngừng hoạt động.

"Web" và "Online" là gần như là 2 khái niệm đi liền với nhau. Nhưng gần đây xu thế mới trong thế giới web còn tồn tại 1 khái niệm nữa là công nghệ web offline, offline-first.

[![](https://3.bp.blogspot.com/-kknlRujasGI/Vo6QpZWVJJI/AAAAAAAAN2U/Z2VbLAWnQOA/s640/offline-text%2BMJN%2BTech%2BWeb.png)](https://blog.duyet.net/2016/01/offline-first-trong-modern-web.html)

## Các công nghệ mà W3C hỗ trợ

1. [Offline Web Applications](https://www.w3.org/TR/offline-webapps/) - Hỗ trợ nhiều chức năng giúp tăng trải nghiệm offline (SQL Client, các hàm sự kiện offline/online, localStorage API). Các chức năng mới trong HTML5 giúp xây dựng các trang web có thể hoạt động hoàn toàn Offline.
2. [Service Workers](https://www.w3.org/TR/service-workers/) - hỗ trợ mở rộng các tác vụ chạy dưới nền, cái này giúp cho web offline giống như một ứng dụng truyền thống. Đây là tiêu chuẩn hiện tại cho offline-first apps và PWAs.
3. [IndexedDB](https://www.w3.org/TR/IndexedDB/) - cung cấp các API, giúp lưu đối tượng dữ liệu Offline, dạng key-value và đánh chỉ mục chúng, tổ chức dữ liệu theo kiểu B-tree.
4. [WebStorage](https://www.w3.org/TR/webstorage/) - lưu trữ dữ liệu đơn giản dạng key-value.

## Công cụ

- [react-boilerplate](https://github.com/mxstbr/react-boilerplate): Quick setup for performance orientated, offline-first React.js applications.
- [Haywire](https://github.com/omnia-salud/haywire): A minimal javascript library for network issues detection.
- [sw-toolbox](https://github.com/GoogleChrome/sw-toolbox): A collection of tools for service workers.
- [UpUp](https://www.talater.com/upup/): An Offline First library designed to be the easiest way to add offline capabilities to a site.
- [simple-serviceworker-tutorial](https://github.com/jakearchibald/simple-serviceworker-tutorial): A really simple ServiceWorker example, designed to be an interactive introduction to ServiceWorker.
- [Hyperboot](http://hyperboot.org/): Offline webapp bootloader.
- [MakeDrive](https://github.com/mozilla/makedrive): A cloud-based Dropbox® equivalent for browser filesystems. **[DISCONTINUED - Mozilla Webmaker project was archived]**
- [ApplicationCache](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache): HTML5 provides an application caching mechanism that lets web-based applications run offline. **[DEPRECATED - Use Service Workers instead]**
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API): IndexedDB is an API for client-side storage of significant amounts of structured data and for high performance searches on this data using indexes.
- [ServiceWorkers](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker_API): A Service Worker acts like a proxy on the client. For page requests and requests made by pages, you get a fetch event that you can respond to yourself, creating offline experiences.
- [localForage](https://github.com/mozilla/localForage): Offline storage, improved. Wraps IndexedDB, WebSQL, or localStorage using a simple but powerful API.
- [remoteStorage](http://remotestorage.io/): remoteStorage enabled apps automatically sync your data across all of your devices, from desktop to tablet to smartphone, and even your TV.
- [pouchdb](http://pouchdb.com/): PouchDB is an open-source JavaScript database inspired by Apache CouchDB that is designed to run well within the browser.
- [Offline.js](https://github.com/hubspot/offline): An awesome JavaScript library to improve the experience of your app when your users lose connection.
- [Hoodie](http://hood.ie/): Hoodie is an Offline First and noBackend architecture for frontend-only web apps on the web and on iOS.
- [Offline States](http://offlinestat.es/): What show applications when we have not internet connection.

## Sách

- [Offline First: The book (draft)](http://www.webdirections.org/offlineworkshop/ibooksDraft.pdf) (by John Allsopp)
- [Pro HTML5 Programming - Chapter 12: Creating HTML5 Offline Web Applications](http://apress.jensimmons.com/v5/pro-html5-programming/ch12.html) (by Peter Lubbers, Brian Albers and Frank Salim)

## Sản phẩm sử dụng công nghệ Web Offline

- [Minutes.io](http://minutes.io/): Awesome offline first minute taking app built with [Hoodie](http://hood.ie/).
- [Swarm+React TodoMVC](http://ppyr.us/): Awesome offline implementation of [TodoMVC](http://todomvc.com/) with real-time sync.
- [2048](https://gabrielecirulli.github.io/2048/): The original 2048 is a great game to pin to your homescreen.
- [hospitalrun.io](http://hospitalrun.io/): Open source software for developing world hospitals.
- [pokedex.org](https://www.pokedex.org/): An index of Pokémon, built as a client-side JavaScript webapp. Powered by ServiceWorker, PouchDB, virtual-dom, and web workers.
