---
title: Migrating from Vim to NeoVim
date: '2021-06-15'
author: Duyet
category: Productivity
tags:
  - Vim
  - IDE
thumbnail: https://1.bp.blogspot.com/-D5-xqeucXwM/YMi6sJPYO7I/AAAAAAACGPg/7bD9Fb7RESkklbaVh_s72hqyIj5dlEmYQCLcBGAsYHQ/s0/Screen%2BShot%2B2021-06-15%2Bat%2B20.13.21.png
slug: /2021/06/neovim.html
description: I migrated to NeoVim, after six month with Vim.
---

I've been using VSCode for a long time. It's a great editor, but I wanted something that makes me faster and more productive. I tried to learn Vim many times since university, but I always gave up.

This time was different. I went all in, and after six months, I hit two goals: using Vim 100% of the time, and being just as fast as I was with VSCode.

<figure class="float-right" style="width: 600px">
    <img src="/media/2021/06/vim-learning-curve-duyet.png" />
    <img src="/media/2021/06/using-vim.png" style="border: 1px" />
</figure>

So this week, I decided to take the next step and move to NeoVim. Here's why:

- It has a remote API, so other programs can talk to it.
- Better default settings out of the box.
- Works in many GUIs, IDEs, and even web browsers.
- It fixes all the small issues I had with Vim.
- Runs tasks in the background, so it feels faster.
- Almost fully compatible with my existing Vim config and plugins.
- And honestly, the website looks pretty cool :)

# Installing

There are many ways to install NeoVim. Check the wiki for details: https://github.com/neovim/neovim/wiki/Installing-Neovim.

On my Mac, I just use Homebrew:

```bash
brew install neovim
```

# Setting up the config

The good news is you don't need to start from scratch. You can just copy your `~/.vimrc` to `~/.config/nvim/init.vim` and most things will work.

What I did instead was create a file at `~/.config/nvim/init.vim` that points NeoVim to my existing Vim config:

```vim
set runtimepath^=~/.vim runtimepath+=~/.vim/after
let &packpath = &runtimepath
source ~/.vimrc
```

NeoVim isn't 100% compatible with Vim, but almost all plugins work just fine. I had zero issues with mine.

I also use this vimrc preset which comes with a ton of useful plugins, color schemes, and settings: https://github.com/amix/vimrc

![](/media/2021/06/neovim.png)

![](/media/2021/06/neovim-2.png)

One more thing — NeoVim has its own set of plugins that take advantage of features only available in NeoVim. You can explore them [here](https://github.com/neovim/neovim/wiki/Related-projects).

---

_Updated Aug 2021_

I just switched to NvChad (https://nvchad.netlify.app). It comes with a beautiful UI and a lot of built-in settings. Give it a try!

![](/media/2021/06/nvchad.png)

---

_Updated Aug 2023_

Moved to my own setup: [My Neovim Setup in 2023](https://blog.duyet.net/2023/09/nvim-setup-2023.html)

![](/media/2023/09/nvim/screenshot_4.png)

---

# Recommended tutorials

If you're just getting started with Vim or NeoVim, these two videos are worth watching:

- [VIM isn't about speed](https://www.youtube.com/watch?v=X9xq4-AzGSI)
- [Learn VIM Fast: Full Tutorial](https://www.youtube.com/watch?v=9cC9x-ntNQY)
