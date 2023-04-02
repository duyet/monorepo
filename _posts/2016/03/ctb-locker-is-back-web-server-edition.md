---
template: post
title: 'CTB-Locker is back: the web server edition'
date: "2016-03-02"
author: Van-Duyet Le
tags:
- Security
- Tor
- CTB
- Ransomware
modified_time: '2016-05-02T19:41:20.131+07:00'
thumbnail: https://3.bp.blogspot.com/-OCj_qVWa3gQ/VtXfet69CWI/AAAAAAAAQiY/xhQ9CDVm7cg/s1600/ctb_locker_en_1.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-926667702342812968
blogger_orig_url: https://blog.duyet.net/2016/03/ctb-locker-is-back-web-server-edition.html
slug: /2016/03/ctb-locker-is-back-web-server-edition.html
category: News
description: Cryptolockers have become more and more sophisticated, bypassing system protections and terrifying anyone in their path. TeslaCrypt, CryptoWall, TorrentLocker, Locky and CTB-Locker are only some of the malware we have protected from for the past two years. We have seen many shapes and colors of cryptolockers, but the new CTB-Locker variant says it all. The world of cybercriminals is investing in how to reinvent cryptolockers.
fbCommentUrl: none
---

Cryptolockers have become more and more sophisticated, bypassing system protections and terrifying anyone in their path. TeslaCrypt, CryptoWall, TorrentLocker, Locky and CTB-Locker are only some of the malware we have protected from for the past two years. We have seen many shapes and colors of cryptolockers, but the new CTB-Locker variant says it all. The world of cybercriminals is investing in how to reinvent cryptolockers.

Before, CTB-Locker, or Onion Ransomware, differed from other ransomware in the usage of the Tor Project’s anonymity network to shield itself from takedown efforts that rely largely on static malware command and control servers. Its use of Tor also helped evading detection and blocking. Another thing that protected CTB-Locker controllers was accepting as payment only Bitcoins, the decentralized and largely anonymous crypto-currency known.  

## Defacement ##
This new variant aims to encrypt web servers and demand less than half a bitcoin as a ransom (0.4 BTC). If payment isn’t sent on time the ransom is doubled to approximately. When paid, the decryption key is generated and is used to decrypt the web server’s files.  

![](https://3.bp.blogspot.com/-OCj_qVWa3gQ/VtXfet69CWI/AAAAAAAAQiY/xhQ9CDVm7cg/s1600/ctb_locker_en_1.png)

In this case, the defacement, which contains a replacement of the main php/html page, is used as the message carrier and contains all the means necessary for the attack to leave the right impression on the victim. We will deep-dive into it in the next steps.

It is important to mention that the original code is not deleted. It is stored safely in the web root with a different name in an encrypted state. 

## The message ##
As variants of malware of this kind are based on the simple fact that a victim cares more about his content than about paying a ransom, the authors usually leave a very detailed message for everyone to see.  The decryption key is stored on a remote server, but the attackers were "kind enough" to allow the victim to decrypt two files free, as a sign of authenticity.  The other function that exists on the attacked website allows the victim to communicate with the attacker via chat: it requires a personal signature/code which is available for victims only. 

## Encryption  ##
I still don’t know how the CTB-Locker is being deployed on web servers, but there is one common thing among many of the attacked servers – they use the WordPress platform as a content management tool.  Once the malware author is inside WordPress system, he is able to replace the main website file and execute the encryption routine. The main file is renamed and saved in an encrypted state.  

![](https://2.bp.blogspot.com/-KeL8Xa2g9EI/VtXgdX9FmvI/AAAAAAAAQik/xAOvU-5ufuE/s1600/ctb_locker_en_4-768x313.png)

In the main page of the CTB-Locker, attackers are using jQuery to query proxy servers and verify payments. The following code was found in the page source code and the servers listed on the top are proxies which are used as another layer of protection, instead of the main server of the attackers:  

![](https://1.bp.blogspot.com/-S3P0-rrNufE/VtXgnUhUZXI/AAAAAAAAQis/58zLPLPHQjQ/s1600/ctb_locker_en_5-768x568.png)

Proxy servers which are part of the decryption process:  

- http://erdeni.ru/access.php
- http://studiogreystar.com/access.php
- http://a1hose.com/access.php

## Proxy to C&C ##

The attackers are utilizing servers which were already attacked to traffic through another layer of protection. On a victim server’s source code, a JavaScript code reveals how the decryption process is sent through three different servers randomly, however those are not the C&C

![](https://2.bp.blogspot.com/-4cIUzg45kiw/VtXhNdhRtQI/AAAAAAAAQi0/3JZi_4Pb1kM/s1600/ctb_locker_en_9.png)

When POST request is being sent with the right parameters, a socket instance is being created and sends a connect beam to the attacker’s C&C server. Later it is being determined if the decryption process succeeded.

## Free decrypt ##
The ransomware allows the victim to freely decrypt not more than two files. It is not for the victim to choose, since the files are pre-chosen and can be found in the malware’s designated file as listed above. The two files are randomly picked during the course of the encryption process.  

![](https://2.bp.blogspot.com/-WnJW97tIi9o/VtXhlHay7nI/AAAAAAAAQjA/O87ECLotvsQ/s1600/ctb_locker_en_6.png)

## Threat actor’s chat room ##
The ransomware also includes functionality to communicate with the malware authors. As already said, the victim is required to use the secret_ key in order to open the chat. Without it, the chat will remain unresponsive.  

![](https://3.bp.blogspot.com/-aXi6sGBiuwM/VtXh77RoDRI/AAAAAAAAQjM/JPrASyN5tvc/s1600/ctb_locker_en_8.png)

- [command-and-control server (C&C server)](http://whatis.techtarget.com/definition/command-and-control-server-CC-server)
- [Mã độc tống tiền CTB-Locker phát tán mạnh mẽ, lây nhiễm hàng trăm ngàn máy chủ web](http://securitydaily.net/ma-doc-tong-tien-ctb-locker-phat-tan-manh-me-lay-nhiem-hang-tram-ngan-may-chu-web/)
- [CTB-Locker is back: the web server edition](https://securelist.com/blog/research/73989/ctb-locker-is-back-the-web-server-edition/)
