---
template: post
title: 'Teleconsole - Chia sẻ remote console '
date: "2017-01-26"
author: Van-Duyet Le
tags:
- Share Terminal
- Teleconsole
modified_time: '2017-01-26T09:53:34.037+07:00'
thumbnail: https://4.bp.blogspot.com/-SyehZxOfseM/WIlfpz8ZHGI/AAAAAAAAioQ/RZdJWwM9zwQttiAcu1ECPU4pk-hNVrFlACK4B/s1600/full-screen-teleconsole.gif
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6795422066370615639
blogger_orig_url: https://blog.duyet.net/2017/01/teleconsole.html
slug: /2017/01/teleconsole.html
category: Linux
description: Teleconsole là dịch vụ miễn phí dùng để chia sẻ terminal session với người khác, giống như Teamviewer cho Terminal.
fbCommentUrl: none 
---

Teleconsole là dịch vụ miễn phí dùng để chia sẻ terminal session với người khác, giống như Teamviewer cho Terminal.  
  

![](https://4.bp.blogspot.com/-SyehZxOfseM/WIlfpz8ZHGI/AAAAAAAAioQ/RZdJWwM9zwQttiAcu1ECPU4pk-hNVrFlACK4B/s640/full-screen-teleconsole.gif)

## Cài đặt

```
curl https://www.teleconsole.com/get.sh | sh
```

## Sử dụng

Ở máy A, bật teleconsole  

```
duyetdev@duyetdev:~$ teleconsole 
Starting local SSH server on localhost...
Requesting a disposable SSH proxy on as.teleconsole.com for duyetdev...
Checking status of the SSH tunnel...
```


[![](https://1.bp.blogspot.com/-gTY_lNouy1M/WIlisbyQlHI/AAAAAAAAioY/SC_KP1RKxXsrOYjDUvQJefHpaye4bW_gwCLcB/s1600/Screenshot%2Bfrom%2B2017-01-26%2B09-42-26.png)](https://1.bp.blogspot.com/-gTY_lNouy1M/WIlisbyQlHI/AAAAAAAAioY/SC_KP1RKxXsrOYjDUvQJefHpaye4bW_gwCLcB/s1600/Screenshot%2Bfrom%2B2017-01-26%2B09-42-26.png)

  
  
Ở máy B, join vào session của máy A  

```
teleconsole join as3b9434bd56d094530a9c002e9b9562c1******
```
  

[![](https://4.bp.blogspot.com/-sNR2s0CLJ3I/WIljEFYmoJI/AAAAAAAAioc/OE5x8h4XIeExKYtoZ2UIA0Ak0yueAtgawCLcB/s1600/Screenshot%2Bfrom%2B2017-01-26%2B09-44-04.png)](https://4.bp.blogspot.com/-sNR2s0CLJ3I/WIljEFYmoJI/AAAAAAAAioc/OE5x8h4XIeExKYtoZ2UIA0Ak0yueAtgawCLcB/s1600/Screenshot%2Bfrom%2B2017-01-26%2B09-44-04.png)

  
Hoặc mở giao diện Web mà Teleconsole cung cấp  
  

[![](https://4.bp.blogspot.com/-LJ9L5Ur3d-k/WIljqxnokII/AAAAAAAAiok/muVUPTNyUZUKBQFX7lFftTXQF1ycQ0GhACLcB/s1600/Screenshot%2Bfrom%2B2017-01-26%2B09-49-01.png)](https://4.bp.blogspot.com/-LJ9L5Ur3d-k/WIljqxnokII/AAAAAAAAiok/muVUPTNyUZUKBQFX7lFftTXQF1ycQ0GhACLcB/s1600/Screenshot%2Bfrom%2B2017-01-26%2B09-49-01.png)


<div>
    <iframe allowfullscreen="" frameborder="0" height="480" src="https://www.youtube.com/embed/R8CnrnquS_s?rel=0" width="853"></iframe>
</div>