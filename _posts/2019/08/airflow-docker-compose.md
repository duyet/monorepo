---
template: post
title: Cài đặt Apache Airflow với Docker Compose
date: "2019-08-26"
category: Data Engineer
tags:
- Airflow
- Data
- Data Engineer
slug: /2019/08/airflow-docker-compose.html
thumbnail: https://1.bp.blogspot.com/-vBHaHxwvMFw/XWQHodWBFeI/AAAAAAABGCg/Hdlx-I1PSx8_Gip6o7N_2mejUSsT2TCigCLcBGAs/s1600/Screen%2BShot%2B2019-08-26%2Bat%2B11.22.59%2BPM.png
description: Trong bài này mình sẽ hướng dẫn cách thiết lập môi trường develop Apache Airflow dưới local bằng Docker Compose.
fbCommentUrl: none
---

Trong bài này mình sẽ hướng dẫn cách thiết lập môi trường develop Apache Airflow dưới local bằng Docker Compose.

**TL;DR** Source ví dụ của bài viết này: https://github.com/duyet/airflow-docker-compose


![Airflow in Docker Compose](https://1.bp.blogspot.com/-vBHaHxwvMFw/XWQHodWBFeI/AAAAAAABGCg/Hdlx-I1PSx8_Gip6o7N_2mejUSsT2TCigCLcBGAs/s1600/Screen%2BShot%2B2019-08-26%2Bat%2B11.22.59%2BPM.png)


# 1. Cấu trúc project

Đầu tiên thiết lập cấu trúc project như dưới đây. Thư mục `dags` sẽ chứa các DAG python của Airflow.

```shell
.
├── dags
│   └── first_dag.py
├── Dockerfile
└── docker-compose.yaml
```


## 1.1 `Dockerfile`

Nội dung file `Dockerfile`:

```dockerfile
FROM puckel/docker-airflow:1.10.4
COPY dags /usr/local/airflow/dags
# RUN pip install <packages> ...
```

`Dockerfile` ở đây mình kế thừa của tác giả [Puckel](https://github.com/puckel/docker-airflow), `COPY` thư mục `dags` vào Docker image. Có thể cài thêm các thư viện khác bằng lệnh Docker `RUN <cmd>`.


## 1.2 `docker-compose.yaml`

Nội dung file `docker-compose.yaml`:

```yaml
version: '2.1'

services:
    postgres:
        image: postgres:9.6
        environment:
            - POSTGRES_USER=airflow
            - POSTGRES_PASSWORD=airflow
            - POSTGRES_DB=airflow
        volumes:
            - /tmp/postgres-data:/var/lib/postgresql/data

    webserver:
        build: .
        restart: always
        depends_on:
            - postgres
        environment:
            - LOAD_EX=n
            - EXECUTOR=Local
            - AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres:5432/airflow
        volumes:
            - ./dags:/usr/local/airflow/dags
            - /tmp/airflow_logs:/root/airflow/logs
        ports:
            - "8080:8080"
        command: webserver
        healthcheck:
            test: ["CMD-SHELL", "[ -f /usr/local/airflow/airflow-webserver.pid ]"]
            interval: 30s
            timeout: 30s
            retries: 3

    scheduler:
        build: .
        restart: always
        depends_on:
            - postgres
        environment:
            - LOAD_EX=n
            - EXECUTOR=Local
            - AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres:5432/airflow
        volumes:
            - ./dags:/usr/local/airflow/dags
            - /tmp/airflow_logs:/root/airflow/logs
        command: scheduler
```

Docker compose mình thiết lập gồm các service:
- Postgres
- Airflow Webserver
- Airflow Scheduler

Mount thư mục `./dags:/opt/airflow/dags` để link thư mục `dags` với thư mục trong Docker instance.

> Note: mount thư mục `/root/airflow/logs` để Webserver có thể đọc được logs từ Scheduler.

# 2. Chạy Docker compose

Tại thư mục project:

```shell
docker-compose up
```

![Docker Compose Up - Terminal](https://1.bp.blogspot.com/-ITYnJ2ylqug/XWQGI_t08CI/AAAAAAABGCM/NjRtqyCsJlYw1mWgdVYzkNX1bqBTSf47QCLcBGAs/s1600/Screen%2BShot%2B2019-08-26%2Bat%2B11.12.49%2BPM.png)

Truy cập Airflow: http://localhost:8080

![Airflow UI in Local](https://1.bp.blogspot.com/-odCDCFx2JsY/XWQG6olVq7I/AAAAAAABGCU/9qEsVmVoMGwMgja_aifZlrU8vUk5ZIeVgCLcBGAs/s1600/Screen%2BShot%2B2019-08-26%2Bat%2B11.20.36%2BPM.png)

Từ bây giờ mình có thể viết và test các DAG bằng cách viết trong thư mục `dags`.

Chúc các bạn thành công.


# Tham khảo
 - https://github.com/duyet/airflow-docker-compose
 - [puckel/docker-airflow](https://github.com/puckel/docker-airflow)
 - https://towardsdatascience.com/getting-started-with-airflow-using-docker-cd8b44dbff98
