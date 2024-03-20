---
title: ClickHouse on Kubernetes
date: '2024-03-13'
author: Duyet
category: Data
tags:
  - Data
  - ClickHouse
  - ClickHouse on Kubernetes
slug: /2024/03/clickhouse-on-kubernetes.html
thumbnail: /media/2024/03/clickhouse-k8s/clickhouse-operator.png
description: ClickHouse has been both exciting and incredibly challenging based on my experience migrating and scaling from Iceberg to ClickHouse, zero to a large cluster of trillions of rows. I have had to deal with many of use cases and resolve issues. I have been trying to take notes every day for myself, although it takes time to publish them as a series of blog posts. I hope I can do so on this ClickHouse on Kubernetes series.
---

ClickHouse has been both exciting and incredibly challenging based on my experience migrating and scaling from Iceberg to ClickHouse, zero to a large cluster of trillions of rows. I have had to deal with many of use cases and resolve issues such as table corruption, excessive data parts, slow start-up times, converting tables from `ReplacingMergeTree` to `ReplicatedReplacingMergeTree`, managing _clickhouse-keeper_, etc.

I have been trying to take notes every day for myself, although it takes time to publish them as a series of blog posts. I hope I can do so on this [ClickHouse on Kubernetes](/tag/clickhouse-on-kubernetes) series.

There are many ways to deploy **ClickHouse on Kubernetes**. You can install it using the [Bitnami ClickHouse Helm Chart](https://bitnami.com/stack/clickhouse/helm) or the [Altinity Kubernetes Operator](https://github.com/Altinity/clickhouse-operator). I have experience with both of them and found that the most effective way is to use the ClickHouse Operator from Altinity. With this operator, you can manage multiple clusters and configure users, profiles, or even customize the Pods using a CRD.

![](/media/2024/03/clickhouse-k8s/clickhouse-operator.png)

# 1. Install [clickhouse-operator](https://github.com/Altinity/clickhouse-operator)

You can install the operator via apply directly [clickhouse-operator-install-bundle.yaml](https://github.com/Altinity/clickhouse-operator/blob/master/deploy/operator/clickhouse-operator-install-bundle.yaml) but I recommend install it via helm so you can its config if needed.

```bash
helm repo add clickhouse-operator https://docs.altinity.com/clickhouse-operator
helm upgrade --install --create-namespace \
    --namespace clickhouse \
    clickhouse-operator \
    clickhouse-operator/altinity-clickhouse-operator
```

Operator is deployed in **clickhouse** namespace:

```bash
kubectl get pods -n clickhouse

NAME                                   READY   STATUS    RESTARTS   AGE
clickhouse-operator-5c46dfc7bd-7cz5l   1/1     Running   0          3s
```

Look [https://github.com/Altinity/clickhouse-operator/tree/master/deploy/helm/](https://github.com/Altinity/clickhouse-operator/tree/master/deploy/helm/) for details

# 2. Config and create single node clickhouse

Create the `clickhouse-single.yaml` file and apply it in Kubernetes. There are many configuration options, so you may need to refer to their example repository ([chi-examples](https://github.com/Altinity/clickhouse-operator/tree/master/docs/chi-examples)) to customize things. I will create a very basic ClickHouse node and explain more later below or in different posts.

```yml
# File: clickhouse-single.yaml
---
apiVersion: clickhouse.altinity.com/v1
kind: ClickHouseInstallation
metadata:
  name: single
  namespace: clickhouse
spec:
  configuration:
    clusters:
      - name: clickhouse
    users:
      # printf 'duyet-password' | sha256sum
      duyet/password_sha256_hex: ea3e0ba4c196be92523629d14b345d054588f5df9cfb338369e6a15a3b562fa9
      # or plaintext
      duyet/password: 'duyet-password'
      duyet/networks/ip:
        - 0.0.0.0/0
```

Apply:

```bash
$ kubectl apply -f 01-single.yaml
clickhouseinstallation.clickhouse.altinity.com/single created

$ kubectl get clickhouseinstallation -n clickhouse
NAME      CLUSTERS   HOSTS   STATUS      HOSTS-COMPLETED   AGE
single    1          1       Completed                     35s
```

Checking if the pods and services is ready:

```bash
$ kubectl k get po -n clickhouse
NAME                          READY   STATUS   RESTARTS  AGE
chi-single-clickhouse-0-0-0   1/1     Running  0         66s
```

ClickHouse Operator also create Services point to your single pod:

```bash
$ kubectl get svc -n clickhouse

NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                         AGE
clickhouse-single           LoadBalancer   10.152.183.156   <pending>     8123:32286/TCP,9000:30767/TCP   3m45s
chi-single-clickhouse-0-0   ClusterIP      None             <none>        9000/TCP,8123/TCP,9009/TCP      3m47s
```

You can access your first ClickHouse via port-forward:

- 8123 using for access via HTTP, for example access playground: http://localhost:8123/play
- 9000, native port, using for `clickhouse-client` command line

```bash
$ kubectl port-forward svc/clickhouse-single 8123 -n clickhouse
```

![](/media/2024/03/clickhouse-k8s/clickhouse-k8s-1.png)

To query via command line, install the `clickhouse` via

```bash
curl https://clickhouse.com/ | sh
```

Then

```bash
clickhouse client --host localhost --port 8123 --user duyet
```

![](/media/2024/03/clickhouse-k8s/clickhouse-k8s-2.png)

Check out the example [01-single.yaml](https://github.com/duyet/clickhouse-on-kubernetes-examples/blob/main/01-single.yaml)

### 2.1. Custom Clickhouse version

```yaml
# File: clickhouse-single.yaml
---
apiVersion: clickhouse.altinity.com/v1
kind: ClickHouseInstallation
metadata:
  name: single
  namespace: clickhouse
spec:
  defaults:
    templates:
      podTemplate: clickhouse:24.1

  configuration:
    clusters:
      - name: clickhouse

  users:
    duyet/password_sha256_hex: ea3e0ba4c196be92523629d14b345d054588f5df9cfb338369e6a15a3b562fa9
    duyet/networks/ip:
      - 0.0.0.0/0

  templates:
    podTemplates:
      - name: clickhouse:24.1
        spec:
          containers:
            - name: clickhouse
              image: clickhouse/clickhouse-server:24.1
```

Check out the example [02-single-custom-version.yaml](https://github.com/duyet/clickhouse-on-kubernetes-examples/blob/main/02-single-custom-version.yaml)

### 2.2. Persistent Volume

The simple spec above do not have PVC so data will be deleted on each restart!. You can define the `volumeClaimTemplates` for data and/or logs. Depends on your Kubernetes cluster and Cloud Provider, you can even specify the `storageClass` or `accessModes`.

```yaml
# File: clickhouse-single.yaml
---
apiVersion: clickhouse.altinity.com/v1
kind: ClickHouseInstallation
metadata:
  name: single
  namespace: clickhouse
spec:
  defaults:
    templates:
      podTemplate: clickhouse:24.1
      dataVolumeClaimTemplate: data-volume-template
      logVolumeClaimTemplate: log-volume-template

  configuration:
    clusters:
      - name: clickhouse

    users:
      duyet/password_sha256_hex: ea3e0ba4c196be92523629d14b345d054588f5df9cfb338369e6a15a3b562fa9
      duyet/networks/ip:
        - 0.0.0.0/0

  templates:
    podTemplates:
      - name: clickhouse:24.1
        spec:
          containers:
            - name: clickhouse
              image: clickhouse/clickhouse-server:24.1

    volumeClaimTemplates:
      - name: data-volume-template
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 100Gi
      - name: log-volume-template
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 100Mi
```

Applying again **clickhouse-operator** will create two new PVCs and attach it into your pod.

![](/media/2024/03/clickhouse-k8s/clickhouse-k8s-3.png)

Check out the example [03-with-pvc.yaml](https://github.com/duyet/clickhouse-on-kubernetes-examples/blob/main/03-with-pvc.yaml)

### 2.3. Store User Password in separated Secrets

You can store the password in separate Secrets for easier management or version it in your own way. Check the [example manifest here](https://github.com/Altinity/clickhouse-operator/blob/master/docs/chi-examples/05-settings-01-overview.yaml) and [here](https://github.com/duyet/clickhouse-on-kubernetes-examples/blob/main/04-ref-password-from-secrets.yaml).

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: clickhouse-password
type: Opaque
stringData:
  duyet_password: password
  duyet_password_sha256_hex: 65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5
  duyet_password_double_sha1_hex: c5bf7884d77d2294924d6dedcb60222f2730ff04
---
apiVersion: clickhouse.altinity.com/v1
kind: ClickHouseInstallation
metadata:
  name: single
  namespace: clickhouse
spec:
  configuration:
    clusters:
      - name: clickhouse

    users:
      # Directly
      duyet_1/password_sha256_hex: ea3e0ba4c196be92523629d14b345d054588f5df9cfb338369e6a15a3b562fa9

      # Ref from secrets
      duyet_2/k8s_secret_password: clickhouse-password/duyet_password
      duyet_3/k8s_secret_password_sha256_hex: clickhouse-password/duyet_password_sha256_hex
      duyet_4/password_double_sha1_hex:
        valueFrom:
          secretKeyRef:
            name: clickhouse-password
            key: duyet_password_double_sha1_hex
```

# Summary

From here, you can start deploying your first ClickHouse on Kubernetes. ClickHouse is quite performant but can be a real challenge for Data Engineers managing a large cluster like mine. You need to deal with a lot of issues and learn how to design the "correct" table.

I will soon publish more problems that you might need to deal with and scale from a small cluster to a larger one with high availability in the series on [ClickHouse on Kubernetes](/tag/clickhouse-on-kubernetes). Check out all the manifest on this series in here https://github.com/duyet/clickhouse-on-kubernetes-examples/tree/main.

Thank you.
