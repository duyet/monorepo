---
template: post
title: Shell - Mọi thao tác với tệp và thư mục trên Bash
date: "2017-01-23"
author: Van-Duyet Le
tags:
- Linux
- Shell bash
- Ubuntu
- CMD
modified_time: '2017-01-23T11:38:35.234+07:00'
thumbnail: https://1.bp.blogspot.com/-LFMgOUBzTRc/WIWIaGmpQzI/AAAAAAAAieU/kvAZPXb218k53BpTdGwnVJQbL4KyhjtRgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B11-36-34.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8780458314288554113
blogger_orig_url: https://blog.duyet.net/2017/01/shell-thao-tac-voi-tep-va-thu-muc.html
slug: /2017/01/shell-thao-tac-voi-tep-va-thu-muc.html
category: Linux
description: Shell bash trên Linux nếu như biết khai thác thì nó sẽ là một công cụ rất mạnh, trong bài này mình sẽ liệt kê các thao tác với tệp và thư mục (copy, move, rename, zip, ...). Like a hacker :))
fbCommentUrl: none
---

Shell bash trên Linux nếu như biết khai thác thì nó sẽ là một công cụ rất mạnh, trong bài này mình sẽ liệt kê các thao tác với tệp và thư mục (copy, move, rename, zip, ...). Like a hacker :))

![](https://1.bp.blogspot.com/-LFMgOUBzTRc/WIWIaGmpQzI/AAAAAAAAieU/kvAZPXb218k53BpTdGwnVJQbL4KyhjtRgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B11-36-34.png)

## copy a file ##

Copy `readme.txt` vào thư mục `documents`

```bash
cp readme.txt documents/
```

## duplicate a file ##

```bash
cp readme.txt readme.bak.txt
```

## copy a folder ##

Copy thư mục `myMusic` vào thư mục `myMedia` 

```bash
cp -a myMusic myMedia/
# or
cp -a myMusic/ myMedia/myMusic/

```

## duplicate a folder ##
Chú ý dấu /

```bash
cp -a myMusic/ myMedia/
# or if `myMedia` folder doesn't exist
cp -a myMusic myMedia/

```

## move a file ##
Di chuyển file readme.txt vào thư mục documents/

```bash
mv readme.txt documents/
```

Luôn sử dụng dấu / cuối thư mục, [for this reason](http://unix.stackexchange.com/a/50533).

## rename a file ##
Đổi tên bằng cách move nó

```bash
mv readme.txt README.md

```

## move a folder ##
Tương tự di chuyển file

```bash
mv myMedia myMusic/
# or
mv myMedia/ myMusic/myMedia

```

## rename a folder ##

```bash
mv myMedia/ myMusic/

```

## create a new file ##
Tạo file rỗng

```bash
touch 'new file'

```

or

```bash
> 'new file'

```

## create a new folder ##

```bash
mkdir 'untitled folder'

```

or

```bash
mkdir -p 'path/may/not/exist/untitled folder'

```

## show file/folder size ##

```bash
stat -x readme.md

```

or

```bash
du -sh readme.md

```

## open a file with the default program ##
Mở file trên GUI

```bash
open file       # on macOS
xdg-open file   # on Linux

```

## zip a folder ##
Nén zip 1 thư mục

```bash
zip -r archive_name.zip folder_to_compress

```

## unzip a folder ##
Giải nén file zip

```bash
unzip archive_name.zip

```

## remove a file ##
Xóa hoàn toàn, không thể khôi phục file

```bash
rm my_useless_file
```

## remove a folder ##

```bash
rm -r my_useless_folder
```

## list folder contents ##
Liệt kê nội dung thư mục

```bash
ls -la my_folder

```

## tree view a folder and its subfolders ##
hiển thị dưới dạng cây thư mục

```bash
tree                                                       # on Linux
find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'     # on macOS

```

![](https://4.bp.blogspot.com/-tK8h8jZr_bE/WIWEVOZOijI/AAAAAAAAieI/M-j88WoOPgwUof29-7baFsDsniPOoLXPgCLcB/s1600/Screenshot%2Bfrom%2B2017-01-23%2B11-01-08.png)

## find a stale file ##

Tìm tất cả files modified hơn 5 ngày trước.

```bash
find my_folder -mtime +5
```
