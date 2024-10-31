---
title: Nodejs - Cache in-memory trong Nodejs
date: '2015-11-13'
author: Duyet
tags:
  - Node.js
  - Tutorial
modified_time: '2016-01-11T02:02:28.742+07:00'
thumbnail: https://1.bp.blogspot.com/-AyUtco9W0rE/VkYN8h_yUBI/AAAAAAAAFqI/IY2bT1tt5VU/s1600/nodejs-logo.png
slug: /2015/11/nodejs-cache-in-memory-trong-nodejs.html
category: Javascript
description: memory-cache là một package đơn giản trong Nodejs, giúp chúng ta cache 1 biến hay một giá trị bất kì vào bộ nhớ để dễ dàng quản lý, ngoài ra còn có thể thiết lập thời gian để tự hủy cache khi cần thiết.
---

memory-cache là một package đơn giản trong Nodejs, giúp chúng ta cache 1 biến hay một giá trị bất kì vào bộ nhớ để dễ dàng quản lý, ngoài ra còn có thể thiết lập thời gian để tự hủy cache khi cần thiết.

![](https://1.bp.blogspot.com/-AyUtco9W0rE/VkYN8h_yUBI/AAAAAAAAFqI/IY2bT1tt5VU/s1600/nodejs-logo.png)![](https://1.bp.blogspot.com/-NpW8Cw34Ay0/VkYPmTU76DI/AAAAAAAAFqY/UroPqdRt4mg/s400/hdd_hard_drive_disk_technology_storage_save_hardware_information_data_sata_device_memory_tool_backup_computer_electronics_equipment_flat_design_icon-512.png)

## Installation

```
npm install --save memory-cache
```

## Usage

```
var cache = require('memory-cache');

// now just use the cache

cache.put('foo', 'bar');
console.log(cache.get('foo'))

// that wasn't too interesting, here's the good part

cache.put('houdini', 'disappear', 100) // Time in ms
console.log('Houdini will now ' + cache.get('houdini'));

setTimeout(function() {
  console.log('Houdini is ' + cache.get('houdini'));
}, 200);
```

sẽ in ra:

```
bar
Houdini will now disappear
Houdini is null
```

## API

### put = function(key, value, time)

- Lưu một giá trị vào bộ nhớ.
- Nếu không có time thì biến được lưu vĩnh viễn.

### get = function(key)

- Lấy giá trị cache.
- Nếu key không tồn tại, trả về giá trị null

### del = function(key)

- Xóa giá trị, trả về true nếu xóa thành công, ngược lại false.

### clear = function()

- Xóa toàn bộ cache.

### size = function()

- Trả về số lượng giá trị lưu trong cache.

### memsize = function()

- Trả về tổng số bộ nhớ mà cache sử dụng.

### debug = function(bool)

- Bật tắt chế độ debug

### keys = function()

- Trả về danh sách các keys.
