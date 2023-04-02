---
template: post
title: How to Use a Webcam to take Pictures in PHP Application
date: "2014-04-17"
category: PHP
tags:
- Tutorials
- PHP
modified_time: '2014-04-17T14:51:24.337+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3526338306857782965
blogger_orig_url: https://blog.duyet.net/2014/04/how-to-use-webcam-to-take-pictures-in.html
slug: /2014/04/how-to-use-webcam-to-take-pictures-in.html
description: If you want to take a picture of a user to be used in a PHP Web site, you can do it with a little help of a JavaScript and a Flash library. This article is a tutorial that explains how to take picture snapshots using a Webcam to be uploaded to a PHP application.

---

If you want to take a picture of a user to be used in a PHP Web site, you can do it with a little help of a JavaScript and a Flash library. This article is a tutorial that explains how to take picture snapshots using a Webcam to be uploaded to a PHP application.

## Requirements ##

The first thing you need is your PHP editor or IDE, a Webcam, MySQL and a cup of coffee. The PHP editor is of course for coding your PHP scripts, Webcam to take the image, MySQL for savingit in a database and Coffee is for your refreshment. :-)

In this article we will discuss how to capture the webcam image from our PHP and jQuery and save it to the database. It will use the Flash for the webcam screen. So you need JavaScript and Flash files that you can [download from the bottom of this page](https://www.vivekmoyal.in/webcam-in-php-how-to-use-webcam-in-php/).

## Capturing Pictures from the Webcam ##
To create our capturing applications we need to create three files:
1. Web page for showing the webcam
2. Script to handle the image upload
3. Script to access to the database

1. Web Page for Showing the Webcam

With this file we will show our Webcam screen on our PHP page.
index.php

Here we will use the webcam.js file for the webcam functions to take the snap and save it.

```html
<script src="webcam.js" type="text/javascript"></script>
```

We will make a form with the one text field and one button.

```php
 <form action="<?php echo HtmlSpecialChars($_SERVER['PHP_SELF']);?>"
  method="post">
 <input type="text" name="myname" id="myname">
 <input type="submit" name="send" id="send">
 </form>

```

Below the form we will put our webcam window to show the webcam screen.   

```html
<script type="text/javascript">
<!-- 
document.write( webcam.get_html(320, 240) ); 
// -->
</script>

```
