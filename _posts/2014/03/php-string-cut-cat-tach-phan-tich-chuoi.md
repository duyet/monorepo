---
template: post
title: PHP String Cut - Cắt, tách, phân tích chuỗi trong PHP
date: "2014-03-06"
category: PHP
tags:
- Tutorials
- PHP
modified_time: '2014-03-06T21:22:33.526+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-791124830006177495
blogger_orig_url: https://blog.duyet.net/2014/03/php-string-cut-cat-tach-phan-tich-chuoi.html
slug: /2014/03/php-string-cut-cat-tach-phan-tich-chuoi.html
description: PHP String Cut, bạn có thể cắt, tách hoặc phân tích chuỗi hoặc load 1 page html rồi lọc lấy những thành phần cần thiết.
draft: false

---

PHP String Cut, bạn có thể cắt, tách hoặc phân tích chuỗi hoặc load 1 page html rồi lọc lấy những thành phần cần thiết.

Class này mình tìm thấy trên PhpClasses của tác giả Schroetter Christian. Class có các chức năng sau:

- Trích xuất 1 chuỗi nằm giữa 2 thành phần, ví dụ như tìm chuỗi nằm trong thẻ `<p>` và `</p>`
- Trích xuất 1 chuỗi giữa 1 chuỗi bắt đầu và nhiều chuỗi kết thúc. .
- Xóa 1 chuỗi giữa 2 tag.
- ....

Download code class [tại đây](https://1drv.ms/1iezGxU)

```php
<?php
    // function's list...
    // QuickDecoupe / QD
    // QuickDecoupeME
    // RemoveString
    // QuickDecoupeSingle / QDS
    // QDSTag
    // QuickDecoupeSingleME
    // QuickDecoupeFromBegin / QDBegin
    // QuickDecoupeToEnd / QDEnd

    include('./string.cut.class.php');

    $content = file_get_contents('./sample_content.txt');

    echo "\t" . 'Return ALL the string between \'<div>\' AND \'</div>\'' . "\n";
    $offset = 0;
    $sample_string_1 = CStringCut::QuickDecoupe($content, '<div>', '</div>', $offset); // same as CStringCut::QD(...)
    while($sample_string_1 !== false)
    {
        var_dump($sample_string_1);

        $sample_string_1 = CStringCut::QuickDecoupe($content, '<div>', '</div>', $offset); // same as CStringCut::QD(...)
    }
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the the string between \'<div>\' AND the third occurence of \'</div>\'\'$offset\'' . "\n";
    $offset = strpos($content, 'This is my title');
    $sample_string_2 = CStringCut::QuickDecoupeME($content, '<div class="class_1">', '</div>', $offset, 3);
    var_dump($sample_string_2);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Remove all the string + the delimiter between \'<div>\' and \'</div>\'' . "\n";
    $store = $content;
    while(strpos($store, '<div>') !== false && strpos($store, '</div>') !== false)
    {
        $store = CStringCut::RemoveString($store, '<div>', '</div>', true);
    }
    var_dump($store);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the string between \'<title>\' and \'</title>\'' . "\n";
    $title = CStringCut::QuickDecoupeSingle($content, '<title>', '</title>'); // same as CStringCut::QDS(...)
    var_dump($title);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the string between \'<div class="class_1">\' and \'</div>\'' . "\n";
    $sample_string_3 = CStringCut::QDS($content, '<div class="class_1">', '</div>');
    var_dump($sample_string_3);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the TAGS between \'<div class="class_1"\' and \'</div>\'' . "\n";
    $offset = 0;
    $sample_string_3 = CStringCut::QDSTag($content, '<div class="class_1">', '</div>', $offset);
    var_dump($sample_string_3);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the TAGS between \'<div class="class_1"\' and \'</div>\' AND remove the remains of the initial tag' . "\n";
    $offset = 0;
    $sample_string_4 = CStringCut::QDSTag($content, '<div class="class_1">', '</div>', $offset, true);
    var_dump($sample_string_4);
    // can be iterat as QuickDecoupe(...)
    /*
        $offset = 0;
        $sample_string_4 = CStringCut::QDSTag($content, '<div class="class_1">', '</div>', $offset, true);
        while($sample_string_4 !== false)
        {
            var_dump($sample_string_4);

            $sample_string_4 = CStringCut::QDSTag($content, '<div class="class_1">', '</div>', $offset, true);
        }
    */
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the STRING between \'[\' and \']\'' . "\n";
    $offset = 0;
    $sample_string_5 = CStringCut::QDSTag($content, '[', ']', $offset, false, true);
    var_dump($sample_string_5);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the the string between \'<div>\' AND the third occurence of \'</div>\'' . "\n";
    $sample_string_6 = CStringCut::QuickDecoupeSingleME($content, '<div class="class_1">', '</div>', 3);
    var_dump($sample_string_6);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the the string between offset 0 AND \'<div class="class_1">\'' . "\n";
    $sample_string_7 = CStringCut::QuickDecoupeFromBegin($content, 0, '<div class="class_1">'); // same as CStringCut::QDBegin(...)
    var_dump($sample_string_7);
    echo '----------------------------------------------------------' . "\n";

    echo "\t" . 'Return the the string between \'<div class="class_1">\' (starting at offset $offset) AND the end of the string' . "\n";
    $offset = 0;
    $sample_string_8 = CStringCut::QuickDecoupeToEnd($content, '<script>', $offset); // same as CStringCut::QDEnd(...)
    var_dump($sample_string_8);
    echo '----------------------------------------------------------' . "\n";

?>

```
