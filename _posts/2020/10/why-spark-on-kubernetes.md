---
template: post
title: 'Tại sao nên triển khai Apache Spark trên Kubernetes'
date: "2020-10-24"
author: Van-Duyet Le
category: Data Engineer
tags:
  - Spark
  - Data Engineer
  - Kubernetes
thumbnail: https://1.bp.blogspot.com/-aBPAW0o9sqY/X5Ps-9d_hLI/AAAAAAABp1A/ZCTOfwThNEUykd4biRSDnZj0D7menY9kACLcBGAsYHQ/s0/spark-on-k8s.jpg
slug: /2020/10/why-spark-on-kubernetes.html
draft: false
description: Spark đã quá nổi tiếng trong thế giới Data Engineering và Bigdata. Kubernetes cũng ngày càng phổ biến tương tự, là một hệ thống quản lý deployment và scaling application. Bài viết này bàn đến một số lợi ích khi triển khai ứng dụng Apache Spark trên hệ thống Kubernetes.
fbCommentUrl: none
---

Apache Spark đã quá nổi tiếng trong thế giới Data Engineering và Big Data. Kubernetes cũng ngày càng phổ biến tương tự, là một hệ thống quản lý deployment và scaling application. Bài viết này đề cập đến một số lợi ích khi [triển khai Apache Spark trên hệ thống Kubernetes](https://blog.duyet.net/2020/05/spark-on-k8s.html).

Có một số lý do bạn bạn nên triển khai Apache Spark trên Kubernetes.

- [Native option](#native-option)
- [Tận dụng sức mạnh của công nghệ Container](#tận-dụng-sức-mạnh-của-công-nghệ-container)
- [Monitoring và Logging](#monitoring-và-logging)
- [Namespace / Resource quotas](#namespace--resource-quotas)
- [Node selectors, Service Account](#node-selectors-service-account)

## Native option

Kubernetes đã trở thành native option cho Spark resource manager kể từ version 2.3 (thay vì Hadoop Yarn, Apache Mesos như trước). Trang tài liệu của Apache Spark có hướng dẫn rất đầy đủ các cài đặt để chạy Spark trên Kubernetes: https://spark.apache.org/docs/latest/running-on-kubernetes.html

![spark-submit can be directly used to submit a Spark application to a Kubernetes cluster](/media/2020/why-spark-k8s/k8s-cluster-mode.png)

Spark sẽ tạo một Spark driver bằng một [Kubernetes pod](https://kubernetes.io/docs/concepts/workloads/pods/pod/).

- Driver này sẽ tạo các Executors, mỗi executor cũng là một Kubernetes pods và kết nối các Pod này lại với nhau, sau đó thực thi application code.
- Sau khi ứng dụng complete, các Executor pods sẽ bị terminate. Nhưng driver pod sẽ chuyển sang trạng thái `completed` để giữ logs cho đến khi nó bị xóa bởi garbage collected hoặc manually cleaned up.

## Tận dụng sức mạnh của công nghệ Container

Chạy Spark trên Kubernetes dưới dạng các pod container, ta tận dụng được nhiều ưu điểm của công nghệ container:

- Đóng gói Spark application, package và dependencies vào cùng một container duy nhất, tránh xung đột phiên bản thư viện với Hadoop hay ứng dụng khác
- Version control bằng cách sử dụng image tags.
- Với cách này, bạn thậm chí còn có thể sử dụng nhiều phiên bản Spark trên cùng một cluster một cách dễ dàng. Ví dụ bạn có thể chạy Spark 2.3 và Spark 3.0 mà không hề có sự xung đột nào.

## Monitoring và Logging

Tận dụng monitoring và logging của Kubernetes: Kubernetes rất mạnh trong việc monitoring các pod, service, node. Bạn có thể dễ dàng xuất log hoặc metrics ra một hệ thống khác như Graylog, [Elasticsearch](https://kubernetes.io/docs/tasks/debug-application-cluster/logging-elasticsearch-kibana/), [Stackdriver](https://kubernetes.io/docs/tasks/debug-application-cluster/logging-stackdriver/), [Prometheus](https://prometheus.io/), Statd ... bằng cách cài thêm 1 pod logging agent hoặc thêm 1 sidecar container để export.

![Monitoring và Logging](/media/2020/why-spark-k8s/logging-with-streaming-sidecar.png)

Tham khảo thêm:

- [Logging Using Elasticsearch and Kibana](https://kubernetes.io/docs/tasks/debug-application-cluster/logging-elasticsearch-kibana/)
- [Logging Using Stackdriver](https://kubernetes.io/docs/tasks/debug-application-cluster/logging-stackdriver/)
- [Monitor Node Health](https://kubernetes.io/docs/tasks/debug-application-cluster/monitor-node-health/)
- [Tools for Monitoring Resources](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/)
- [Setting up, Managing & Monitoring Spark on Kubernetes](https://www.datamechanics.co/blog-post/setting-up-managing-monitoring-spark-on-kubernetes)

## Namespace / Resource quotas

Dễ dàng quản lý resources, phân chia giới hạn tài nguyên cho nhiều team bằng cách sử dụng Kubernetes [namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) và [resource quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/).

```yaml
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: mem-cpu
  namespace: cluster-spark-staging
spec:
  hard:
    requests.cpu: 500
    limits.cpu: 800
    requests.memory: "100Gi"
    limits.memory: "300Gi"
    pods: 500000

---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: mem-cpu
  namespace: cluster-spark-production
spec:
  hard:
    requests.cpu: 2000
    limits.cpu: 3000
    requests.memory: "800Gi"
    limits.memory: "1500Gi"
    pods: 500000

---
apiVersion: sparkoperator.k8s.io/v1beta2
kind: SparkApplication
metadata:
  name: spark-log-processing
  namespace: cluster-spark-production  # <-----
spec:
  type: Scala
  mode: cluster
  ...
```

## Node selectors, Service Account

Sử dụng Kubernetes [node selectors](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#nodeselector) để kiểm soát việc chạy Spark trên các loại máy khác nhau tùy theo mục đích của Spark app.

Ngoài ra Kubernetes [service account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) dùng để quản lý permission sử dụng [Role và ClusterRole](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole), cho phép team nào có thể sử dụng cluster nào.

```yaml
apiVersion: sparkoperator.k8s.io/v1beta2
kind: SparkApplication
metadata:
  name: spark-log-processing
  namespace: data-production
spec:
  type: Scala
  mode: cluster
  image: gcr.io/spark/spark:v3.0.0
  mainClass: org.duyet.spark.transformation.LogProcessing
  mainApplicationFile: s3://duyet/spark/etl/jars/spark-log-processing_2.12-3.0.0.jar

  nodeSelector:
    disktype: ssd
    clusterTeam: team-duyet

  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: kubernetes.io/e2e-az-name
                operator: In
                values:
                  - e2e-az1
                  - e2e-az2
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 1
          preference:
            matchExpressions:
              - key: cluster-label
                operator: In
                values:
                  - cluster-realtime
                  - cluster-production
```

## Kết luận

Mặc dù có nhiều điểm mạnh, Kubernetes scheduler support for Spark vẫn cần nhiều cải thiện do vẫn còn rất mới mẻ, so với thời gian phát triển nhiều năm của YARN hay Mesos.

Bạn có thể tham khảo các cách để chạy ứng dụng Spark trên Kubernetes như `spark-submit` hay `Spark Operator` ở [bài viết này](https://blog.duyet.net/2020/05/spark-on-k8s.html) và tối ưu hóa Spark trên Kubernetes của AWS [tại đây](https://aws.amazon.com/blogs/containers/optimizing-spark-performance-on-kubernetes/).
