---
title:
  Nginx - adding cross-origin resource sharing (CORS) support to reverse proxied
  APIs
date: '2016-02-08'
author: Duyet
tags:
  - Tutorial
modified_time: '2018-09-10T17:26:06.992+07:00'
slug: /2016/02/nginx-adding-cors.html
category: Linux
description: Example Nginx configuration for adding cross-origin resource sharing (CORS) support to reverse proxied APIs.
---

Example Nginx configuration for adding cross-origin resource sharing (CORS) support to reverse proxied APIs.

```
server {
    listen 80;
    listen [::]:80;

    server_name sub.duyet.net;

    location / {

        // ADD THIS ABOVE ========================================

        set $cors '';
        if ($http_origin ~* 'https?://(localhost|.*.duyet\.net)') {
                set $cors 'true';
        }
        if ($cors = 'true') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Credentials' 'true';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
        }

        // ======================================================

        proxy_pass http://192.168.26.22:9090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        proxy_set_header   X-Real-IP             $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

```

This config will add CORS support for all request from localhost and sub.duyet.net

## Resource

- [http://enable-cors.org](http://enable-cors.org/)
- [https://gist.github.com/michiel/1064640](https://gist.github.com/michiel/1064640)
- [https://gist.github.com/Stanback/7145487](https://gist.github.com/Stanback/7145487)
