---
template: post
title: Apache Spark on Docker
date: "2015-12-12"
author: Van-Duyet Le
tags:
- Docker
- Apache Spark
- Web
- Big Data
modified_time: '2016-01-11T02:00:26.381+07:00'
thumbnail: https://1.bp.blogspot.com/-KvlK1aCu4JA/VmsMOTCCySI/AAAAAAAALYo/H_kBQPB_dDE/s1600/KuDr42X_ITXghJhSInDZekNEF0jLt3NeVxtRye3tqco.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2717059024603161563
blogger_orig_url: https://blog.duyet.net/2015/12/apache-spark-on-docker.html
slug: /2015/12/apache-spark-on-docker.html
category: Data
description: Docker and Spark are two technologies which are very hyped these days
fbCommentUrl: none
---

Docker and Spark are two technologies which are very hyped these days. [The repository](https://github.com/duyet/docker-spark) contains a Docker file to build a Docker image with Apache Spark.

![](https://1.bp.blogspot.com/-KvlK1aCu4JA/VmsMOTCCySI/AAAAAAAALYo/H_kBQPB_dDE/s640/KuDr42X_ITXghJhSInDZekNEF0jLt3NeVxtRye3tqco.png)

## Install Docker on Ubuntu ##
Log into your Ubuntu installation as a user with sudo privileges.
Install wget and wget docker

```
sudo apt-get install wget
```

Get the latest Docker package.

```
wget -qO- https://get.docker.com/ | sh
```

The system prompts you for your sudo password. Then, it downloads and installs Docker and its dependencies.

Note: If your company is behind a filtering proxy, you may find that the apt-key command fails for the Docker repo during installation. To work around this, add the key directly using the following:

```
wget -qO- https://get.docker.com/gpg | sudo apt-key add -
```

Verify docker is installed correctly.

```
$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
535020c3e8ad: Pull complete
af340544ed62: Pull complete
Digest: sha256:a68868bfe696c00866942e8f5ca39e3e31b79c1e50feaee4ce5e28df2f051d5c
Status: Downloaded newer image for hello-world:latest

Hello from Docker.
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker Hub account:
 https://hub.docker.com

For more examples and ideas, visit:
 https://docs.docker.com/userguide/
```

## Pull the image from Docker Repository ##

```
docker pull duyetdev/docker-spark
```

## Building the image ##

```
docker build --rm -t duyetdev/docker-spark .
```

## Running the image ##

If using boot2docker make sure your VM has more than 2GB memory 

In your /etc/hosts file add $(boot2docker ip) as host 'sandbox' to make it easier to access your sandbox UI

Open yarn UI ports when running container

```
docker run -it -p 8088:8088 -p 8042:8042 -h sandbox duyetdev/docker-spark bash
```

or

```
docker run -d -h sandbox duyetdev/docker-spark -
```

## Testing ##

In order to check whether everything is OK, you can run one of the stock examples, coming with Spark.

```
cd /usr/local/spark
# run the spark shell
./bin/spark-shell --master yarn-client --driver-memory 1g --executor-memory 1g --executor-cores 1

# execute the the following command which should return 1000
scala> sc.parallelize(1 to 1000).count()
```
