---
template: post
title: Flv2mp3 PHP Class - Chuyển FLV thành MP3 bằng PHP
date: "2014-03-06"
category: PHP
tags:
- class
- Tutorials
- PHP
modified_time: '2014-03-06T21:39:01.547+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5126285540887242083
blogger_orig_url: https://blog.duyet.net/2014/03/flv2mp3-php-class-chuyen-flv-thanh-mp3.html
slug: /2014/03/flv2mp3-php-class-chuyen-flv-thanh-mp3.html
description: Với class Flv2mp3 bạn có thể dễ dàng chuyển đổi file video với định dạng flv thành file âm thanh mp3 một cách dễ dàng.
---

Với class Flv2mp3 bạn có thể dễ dàng chuyển đổi file video với định dạng flv thành file âm thanh mp3 một cách dễ dàng.
Download class [tại đây](https://www.phpclasses.org/package/5212-PHP-Extract-MP3-audio-from-Flash-video-movies.html) và sử dụng theo ví dụ bên dưới.

```php
<?php 

// @exsample 
/* 
 * This file I have download from youtube.com with the url 
 * https://www.youtube.com/watch?v=P_gDz-Qlef0&feature=PlayList&p=E79725C3F709B278&playnext=1&index=1 
*/ 

try { 

// Path to the downloaded flv file 
(string) $file = "P_gDz-Qlef0.flv"; 

// Load the Flv2Mp3 class 
include_once( 'flv2mp3.class.php' ); 

// Create the $mp3 object 
$mp3 = new Flv2Mp3( array( 'delete' => False ) ); 

// Convert the flv file into mp3 
if ( $mp3->convert( $file ) ) { 
    if ( is_file( $mp3->getOutfile( $file ) ) ) { 
        $mp3->stream( $mp3->getOutfile( $file ) ); 
    } 
} 

// If you have set the parameter delete => Fale you have 
// to delete the converted file manually. 
if ( is_file( $mp3->getOutfile( $file ) ) ) { 
    echo $mp3->getOutfile( $file )." exist!"; 
} 

// You can also stream the mp3 with the convert method 
// if ( !$mp3->convert( $file, True ) ) { 
//       echo "Can't convert ".$file; 
// } 

} catch ( Exception $error ) { 

    echo "Error: <br/>\n"; 
    echo $error->getMessage()."<br/>\n"; 
    echo "Line: ".$error->getLine()." in ".$error->getFile()."<br/>\n"; 
    echo $error; 

} 

?> 

```

Chúc bạn thành công.
