---
title: Monitoring ClickHouse on Kubernetes
date: '2024-03-27'
author: Duyet
category: Data
tags:
  - Data
  - ClickHouse
  - ClickHouse on Kubernetes
slug: /2024/03/clickhouse-monitoring.html
thumbnail: /media/2024/03/monitoring-clickhouse/clickhouse-monitoring.png
description: Now that you have your first ClickHouse instance on Kubernetes and are starting to use it, you need to monitoring and observing what happens on it is an important task to achieve stability.
---

Now that you have your [first ClickHouse instance on Kubernetes](https://blog.duyet.net/2024/03/clickhouse-on-kubernetes.html) and are starting to use it, you need to monitoring and observing what happens on it is an important task to achieve stability. There are many ways:

- [Built-in](#built-in-advanced-observability-dashboard) dashboard
- Export metrics to Prometheus and visualize them with Grafana
- [ClickHouse Monitoring UI](https://github.com/duyet/clickhouse-monitoring) that relies on powerful system tables

# 1. Built-in advanced observability dashboard

ClickHouse includes an advanced observability dashboard feature accessible at `$HOST:$PORT/dashboard` (login required).

It displays metrics such as Queries/second, CPU usage, Queries running, Merges running, Selected bytes/second, IO wait, CPU, Read/Write, Inserted rows/second, Total MergeTree parts, and Max parts for partition, etc.

![](/media/2024/03/monitoring-clickhouse/clickhouse-builtin-dashboard.png)

# 2. Monitoring with Prometheus + Grafana

You can configure ClickHouse to export metrics to [Prometheus](https://prometheus.io/). ClickHouse Operator do have a section for this:
1. Step 1: [Setup Prometheus](https://github.com/Altinity/clickhouse-operator/blob/master/docs/prometheus_setup.md) pool data from ClickHouse into Prometheus
2. Step 2: [Setup Grafana](https://github.com/Altinity/clickhouse-operator/blob/master/docs/grafana_setup.md)

They also have a dashboard for ClickHouse Operator Dashboard so you can just need to import it:
- [Altinity_ClickHouse_Operator_dashboard.json](https://github.com/Altinity/clickhouse-operator/blob/master/grafana-dashboard/Altinity_ClickHouse_Operator_dashboard.json)
- [ClickHouse_Queries_dashboard.json](https://github.com/Altinity/clickhouse-operator/blob/master/grafana-dashboard/ClickHouse_Queries_dashboard.json)
- [ClickHouseKeeper_dashboard.json](https://github.com/Altinity/clickhouse-operator/blob/master/grafana-dashboard/ClickHouseKeeper_dashboard.json)

References:
 - [ClickHouse Grafana plugin 4.0 - Leveling up SQL Observability](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
 - [A Story of Open-source GitHub Activity using ClickHouse + Grafana](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)
 - Video: [Visualizing ClickHouse Data with Grafana](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
 - [Visualizing Data with ClickHouse - Part 1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)

# 3. ClickHouse system tables

You should read these blog post by ClickHouse about [rely on the system tables](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) to get more insights about running queries and their performance. These contains about some topic like for example: most expensive SELECT queries, average query duration and number of requests, number of SQL queries by client or user, etc.

- [Essential Monitoring Queries - part 1 - INSERT Queries](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- [Essential Monitoring Queries - part 2 - SELECT Queries](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)

![](/media/2024/03/monitoring-clickhouse/clickhouse-blog.png)

# 4. ClickHouse Monitoring UI Dashboard

This is my simple monitoring dashboard for ClickHouse, built with [Next.js](https://nextjs.org/) for monitoring all my clusters. It relies on system tables above that provide rich information. A live demo is available at: https://clickhouse-monitoring.vercel.app/

![](https://github.com/duyet/clickhouse-monitoring/raw/main/.github/screenshots/screenshot_1.png)

![](https://github.com/duyet/clickhouse-monitoring/raw/main/.github/screenshots/screenshot_2.png)

You can install it into Kubernetes via the latest helm chart here: [https://github.com/duyet/charts/tree/master/clickhouse-monitoring](https://github.com/duyet/charts/tree/master/clickhouse-monitoring)

```shell
helm repo add duyet https://duyet.github.io/charts

cat <<EOF >> values.yaml
env:
  - name: CLICKHOUSE_HOST
    value: http://clickhouse-single.clickhouse.svc:8123
  - name: CLICKHOUSE_USER
    value: monitoring
  - name: CLICKHOUSE_PASSWORD
    value: ''
EOF

helm install -f values.yaml clickhouse-monitoring-release duyet/clickhouse-monitoring
```

---
# ClickHouse Series

 - [ClickHouse on Kubernetes](https://blog.duyet.net/2024/03/clickhouse-on-kubernetes.html)
 - [ClickHouse SELECT Advances](https://blog.duyet.net/2024/03/clickhouse-select-advances.html)
 - [Monitoring ClickHouse on Kubernetes](https://blog.duyet.net/2024/03/clickhouse-monitoring.html)
