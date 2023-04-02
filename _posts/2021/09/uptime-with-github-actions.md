---
template: post
title: Uptime with GitHub Actions 
date: "2021-09-20"
author: Van-Duyet Le
category: Dev
tags:
  - Data Engineer
  - Docker
slug: /2021/09/uptime-with-github-actions.html
thumbnail: https://1.bp.blogspot.com/-uGEmZa3e2Pc/YUiWb8qAkaI/AAAAAAACQig/bPXGd6Kl6EULxY61aolS0W6-PSldz5kOgCLcBGAsYHQ/s0/uptime-1.png
draft: false
description: >
  Hey, I just found this tool, so incredibly clever that 
  it uses Github Actions for uptime monitor and status page.
fbCommentUrl: none
---

Hey, I just found this tool, so incredibly clever that
it uses Github Actions for uptime monitor and status page.

Firstly, look at my Uptime Repo (https://github.com/duyet/uptime) and 
the Status Page (https://duyet.github.io/uptime) hosted by Github Page.

![Uptime](/media/2021/09/uptime-1.png)

![Uptime](/media/2021/09/uptime-2.png)

So cool, huh?

# How it works

Upptime doesn't require a server, it's all powered by GitHub:

1. GitHub Actions is used as an uptime monitor: users can schedule workflows to automatically run every 5-minutes (shortest interval) visits your websites and makes sure that they're up.
2. GitHub Issues are used for incident reports: when a specified endpoint goes down, Upptime automatically opens a new issue in your GitHub repository.
3. GitHub Pages are used for the status website: a beautiful, staticly-generated status website.

# Getting started

Just follow the detailed tutorials here (https://upptime.js.org/docs/get-started), 
create your repository from the template with a few configuration.


Upptime uses thousands of build minutes every month (approximately 3,000 minutes in the default setting). 
If you use a public repository, GitHub offers unlimited free build minutes, 
but if you use a private repository, you'll have to pay for this time.


# References

- https://upptime.js.org/docs/get-started
- https://github.com/upptime/upptime
