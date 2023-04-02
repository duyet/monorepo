---
template: post
title: How to Install Oracle 12c on Ubuntu 15.04
date: "2015-09-13"
author: Van-Duyet Le
tags:
- Tutorial
- Oracle
modified_time: '2015-09-14T12:45:56.662+07:00'
thumbnail: https://1.bp.blogspot.com/-CB9-dLfNP90/VfZd6RSwrNI/AAAAAAAAC5M/rmrmrNrd86s/s1600/Screenshot%2Bfrom%2B2015-09-14%2B12%253A38%253A55.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7369024314224121340
blogger_orig_url: https://blog.duyet.net/2015/09/how-to-install-oracle-12c-on-ubuntu-1504.html
slug: /2015/09/how-to-install-oracle-12c-on-ubuntu-1504.html
category: Linux
description: Cách cài đặt Oracle 12c trên Ubuntu 15.04
fbCommentUrl: none
---

This tutorial show How to Install Oracle 12C on Ubuntu 15.04. Ubuntu like systems are not in the list of Oracle 12c Database Supported OS, so you should be careful and use it at most for Development and not as Production Database Server

Following is the summarized steps of How to Install Oracle 12c on Ubuntu 15.04

1. Oracle Installation Prerequisites
2. Install Oracle 12c on Ubuntu
3. Post Installation

Detailed Step by Step of How to Install Oracle 12c on Ubuntu 15.04

## 1. Oracle Installation Prerequisites ##
Host file modification
The /etc/hosts file must contain a fully qualified name for the server.

```
IP-address  fully-qualified-machine-name machine-name
```

## 2. Hardware requirement ##

1. General Server Minimum Requirements
Server should be started in runlevel 3 or runlevel 5.
Server display cards provide at least 1024 x 768 display resolution.
2. Disk Space Requirements on Linux x86-64
Disk Space for Enterprise Edition Installation type is 6.4 GB
1 GB of space in the /tmp directory on your Linux system.
3. Server Memory Minimum Requirements
Ensure that your system meets the following memory requirements:
Minimum: 1 GB of RAM
Recommended: 2 GB of RAM or moreSwap Space Requirement for Linux

1. If RAM size is between 1 GB to 2 GB then Swap space should be 1.5 times of the RAM
2. If RAM size is between 2 GB to 16 GB then Swap space should be equal to the size of the RAM
3. If RAM size is more than 16 GB then Swap space should be 16 GB

## 3. Install Prerequisites packages ##

1. Open a command prompt by pressing CTRL + ALT + t and run following command as a root / root equivalent user to downloads the package lists from the repositories and updates them to get information on the newest versions of packages and their dependencies. It will do this for all repositories and PPAs.

```
sudo apt-get update
```

2. Run following command to handle changing dependencies with new versions of packages.

```
sudo apt-get dist-upgrade
```

3. Restart machine by running following command

```
sudo reboot --reboot
```

4. Again run dist-upgrade to check if there is any new versions of packages

```
sudo apt-get dist-upgrade
```

5. Run following command to install dependencies

```
sudo apt-get -y install alien binutils build-essential \
cpp-4.4 debhelper g++-4.4 gawk gcc-4.4 gcc-4.4-base \
gettext html2text lib32z1 lib32ncurses5 intltool-debian \
ksh lib32z1-dev libaio-dev libaio1 libbeecrypt7 libc6 \
libc6-dev libc6-dev-i386 libelf-dev libelf1 libltdl-dev \
libltdl7 libmotif4 libodbcinstq4-1 libodbcinstq4-1:i386 \
libqt4-core libqt4-gui libsqlite3-0 libstdc++5 libstdc++6 \
libstdc++6-4.4-dev lsb lsb-core lsb-cxx lsb-desktop \
lsb-graphics make odbcinst pax po-debconf rpm \
rpm-common sysstat unixodbc unixodbc-dev unzip
```

## 4. Creating Required Operating System Groups and Users ##

1. Run following command as root/ root equivalent user to create required Operating System groups and users

```
sudo addgroup oinstall
sudo addgroup dba
sudo addgroup nobody
sudo usermod -g nobody nobody
sudo useradd -g oinstall -G dba -p password -d /home/oracle -s /bin/bash oracle
sudo mkdir /home/oracle
sudo chown -R oracle:dba /home/oracle
sudo mkdir -p /u01/app/oracle
sudo mkdir -p /u01/binaries
sudo chown -R oracle:dba /u01
```

2. Set the password for the oracle user which we have created for installation purpose

```
sudo passwd oracle
```

## 5. Configuring Kernel Parameters and Resource Limits ##

1. Make ourself as Red Hat by running following command as root/ root equivalent user

```
echo 'Red Hat Linux release 6' | sudo tee -a /etc/redhat-release

```

2. We need to create some soft links to start the installation. To do so run the following commands as root/ root equivalent user,

```
sudo mkdir /usr/lib64
sudo ln -s /etc /etc/rc.d
sudo ln -s /lib/x86_64-linux-gnu/libgcc_s.so.1 /lib64/
sudo ln -s /usr/bin/awk /bin/awk
sudo ln -s /usr/bin/basename /bin/basename
sudo ln -s /usr/bin/rpm /bin/rpm
sudo ln -s /usr/lib/x86_64-linux-gnu/libc_nonshared.a /usr/lib64/
sudo ln -s /usr/lib/x86_64-linux-gnu/libpthread_nonshared.a /usr/lib64/
sudo ln -s /usr/lib/x86_64-linux-gnu/libstdc++.so.6 /lib64/
sudo ln -s /usr/lib/x86_64-linux-gnu/libstdc++.so.6 /usr/lib64/
```

3. To change the shell configuration for oracle user run following commands as root/ root equivalent user

```
sudo cp /etc/security/limits.conf /etc/security/limits.conf.original
echo "#Oracle 12C shell limits:" | sudo tee -a /etc/security/limits.conf
echo "oracle soft nproc 2048" | sudo tee -a /etc/security/limits.conf
echo "oracle hard nproc 16384"| sudo tee -a /etc/security/limits.conf
echo "oracle soft nofile 1024" | sudo tee -a /etc/security/limits.conf
echo "oracle hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

4. Run following command to change the kernel parameters as root/ root equivalent user.

```
echo "#" | sudo tee -a /etc/sysctl.conf
echo "# Oracle 12C entries" | sudo tee -a /etc/sysctl.conf
echo "fs.aio-max-nr=1048576" | sudo tee -a /etc/sysctl.conf
echo "fs.file-max=6815744" | sudo tee -a /etc/sysctl.conf
echo "kernel.shmall=2097152" | sudo tee -a /etc/sysctl.conf
echo "kernel.shmmni=4096" | sudo tee -a /etc/sysctl.conf
echo "kernel.sem=250 32000 100 128" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.ip_local_port_range=9000 65500" | sudo tee -a /etc/sysctl.conf
echo "net.core.rmem_default=262144" | sudo tee -a /etc/sysctl.conf
echo "net.core.rmem_max=4194304" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_default=262144" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_max=1048586" | sudo tee -a /etc/sysctl.conf
echo "kernel.shmmax=1073741824" | sudo tee -a /etc/sysctl.conf
```

 Note: **kernel.shmmax = max possible value**, e.g. size of physical memory in bytes. In my case machine is having 2GB so we are specifying 1GB. Adjust the parameter as per your configuration  
5. Load new kernel parameters, by running following as root/ root equivalent user.

```
sudo sysctl -p
```

6. We need to do changes in start-up script, run following commands as root/ root equivalent user

```
for i in 0 1 2 3 4 5 6 S
do sudo ln -s /etc/rc$i.d /etc/rc.d/rc$i.d
done
```

## 6. Downloading Software ##
Login as a oracle user as we are going to install database using oracle user.
Go to following link to download Oracle 12c.
[Download Oracle 12c Enterprise Edition](http://www.oracle.com/technetwork/database/enterprise-edition/downloads/index.html)
Check Accept License Agreement radio button and Download 2 files.

Download the file to /u01/binaries.

![](https://1.bp.blogspot.com/-CB9-dLfNP90/VfZd6RSwrNI/AAAAAAAAC5M/rmrmrNrd86s/s1600/Screenshot%2Bfrom%2B2015-09-14%2B12%253A38%253A55.png)

## 7. Unpack Files ##
Login as a oracle user and open a terminal by pressing CTRL + ALT + T
Go to **/u01/binaries** folder using following command

```
cd /u01/binaries
```

Run following commands to extract binaries

```

unzip linuxamd64_12102_database_1of2.zip
unzip linuxamd64_12102_database_2of2.zip
```
Before doing the installation we need to give proper permission to the extracted file, to do the same run following command

```
chown -Rf oracle:dba /u01/binaries
```

## Install Oracle 12c on Ubuntu ##

1. Login as a oracle user and start installation using following command 
```
cd /u01/binaries/database
/u01/binaries/database/runInstaller -ignoreSysPrereqs
```

2. In the **Configure Security Updates** unchecked **I wish to receive security updates via My Oracle Support** and Click **Next**I have skipped Oracle Support Password provision as I don’t want to receive updates. 
