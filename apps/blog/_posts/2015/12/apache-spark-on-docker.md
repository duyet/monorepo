---
title: Apache Spark on Docker
date: '2015-12-12'
author: Duyet
tags:
  - Docker
  - Apache Spark
  - Web
  - Big Data
modified_time: '2016-01-11T02:00:26.381+07:00'
thumbnail: https://1.bp.blogspot.com/-KvlK1aCu4JA/VmsMOTCCySI/AAAAAAAALYo/H_kBQPB_dDE/s1600/KuDr42X_ITXghJhSInDZekNEF0jLt3NeVxtRye3tqco.png
slug: /2015/12/apache-spark-on-docker.html
category: Data
description: Containerizing Apache Spark with Docker remains essential in 2025. This guide covers modern deployment practices using Docker Compose, Kubernetes considerations, and best practices with current Spark versions.
---

Docker and Spark are two powerful technologies that remain highly relevant in 2025. While the original [docker-spark repository](https://github.com/duyet/docker-spark) demonstrates basic containerization, this guide has been updated to reflect modern best practices.

> **Updated for 2025**: This post was originally published in 2015. It has been significantly revised to replace deprecated tools (boot2docker), use current Spark versions (3.4+), add Docker Compose examples, include PySpark workflows, and mention Kubernetes deployment patterns.

![](https://1.bp.blogspot.com/-KvlK1aCu4JA/VmsMOTCCySI/AAAAAAAALYo/H_kBQPB_dDE/s640/KuDr42X_ITXghJhSInDZekNEF0jLt3NeVxtRye3tqco.png)

## Install Docker (2025 Edition)

### Docker Desktop (Recommended for 2024+)

Install Docker Desktop for your platform:

- **macOS**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: [Docker Engine Installation](https://docs.docker.com/engine/install/)

### Ubuntu/Debian Linux

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

### Verify Installation

```bash
docker run hello-world
```

This will pull and run the hello-world image, confirming Docker is working correctly.

## Modern Spark on Docker Context (2025)

When containerizing Apache Spark in 2025, consider these important points:

1. **Use Current Spark Versions**: Spark 3.4+ provides significant performance improvements and Python 3.10+ support
2. **Deployment Architecture**:
   - **Docker Compose**: Ideal for local development and testing
   - **Kubernetes**: Industry standard for production workloads (see [Spark on Kubernetes](https://spark.apache.org/docs/latest/running-on-kubernetes.html))
3. **Best Practices**:
   - Use lightweight base images (e.g., `eclipse-temurin:11-jre-slim` or `python:3.11-slim`)
   - Implement security scanning for container images
   - Use minimal, multi-stage builds
4. **PySpark Support**: Modern deployments typically support both Scala and Python APIs

## Pull the image from Docker Repository

```
docker pull duyetdev/docker-spark
```

## Building the image

```
docker build --rm -t duyetdev/docker-spark .
```

## Running the Image

### Historical Note: Boot2Docker

*Note: boot2docker was deprecated in favor of Docker Desktop (2016+). If you're using a legacy system, skip this section.*

### Modern Approach: Docker Compose (Recommended)

For containerized Spark with proper networking and resource management, use Docker Compose:

```yaml
version: '3.8'
services:
  spark-master:
    image: bitnami/spark:latest
    environment:
      - SPARK_MODE=master
      - SPARK_RPC_AUTHENTICATION_ENABLED=no
      - SPARK_RPC_ENCRYPTION_ENABLED=no
      - SPARK_LOCAL_STORAGE_ENCRYPTION_ENABLED=no
    ports:
      - "8080:8080"
      - "7077:7077"
      - "4040:4040"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3

  spark-worker:
    image: bitnami/spark:latest
    depends_on:
      - spark-master
    environment:
      - SPARK_MODE=worker
      - SPARK_MASTER_URL=spark://spark-master:7077
      - SPARK_WORKER_MEMORY=1G
      - SPARK_WORKER_CORES=1
    ports:
      - "8081:8081"
```

Then run:

```bash
docker-compose up -d
```

Access Spark Master UI at `http://localhost:8080`

### Legacy: Direct Docker Run (Not Recommended)

For simple testing with the original image:

```bash
docker run -it -p 8080:8080 -p 7077:7077 \
  -h spark-master \
  bitnami/spark:latest
```

## Testing Spark (2025 Edition)

### Using Spark Shell (Scala)

Connect to the running container and test with Scala:

```bash
docker-compose exec spark-master spark-shell --master spark://spark-master:7077

# In the Spark shell:
scala> sc.parallelize(1 to 1000).count()
res0: Long = 1000
```

### Using PySpark (Python) - Recommended

Modern Spark workflows typically use Python. Test with PySpark:

```bash
docker-compose exec spark-master pyspark --master spark://spark-master:7077

# In the PySpark shell:
>>> sc.parallelize(range(1, 1001)).count()
1000
>>> df = spark.createDataFrame([(i, i*2) for i in range(1, 100)], ["id", "value"])
>>> df.show(5)
```

### Submit a Spark Job

For production-like testing, submit a job:

```bash
docker-compose exec spark-master spark-submit \
  --master spark://spark-master:7077 \
  --class org.apache.spark.examples.SparkPi \
  /opt/spark/examples/jars/spark-examples_2.13-3.4.0.jar 100
```

### Monitor with Web UI

- **Spark Master UI**: http://localhost:8080
- **Spark Worker UI**: http://localhost:8081
- **Application UI**: http://localhost:4040 (while job is running)

## Additional Resources for 2025

- [Apache Spark Official Documentation](https://spark.apache.org/docs/latest/)
- [Spark on Kubernetes Guide](https://spark.apache.org/docs/latest/running-on-kubernetes.html)
- [Bitnami Spark Docker Image](https://hub.docker.com/r/bitnami/spark)
- [Spark Best Practices](https://spark.apache.org/docs/latest/tuning.html)
