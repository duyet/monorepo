---
title: Monitoring ClickHouse on Kubernetes
date: '2024-03-27'
featured: true
author: Duyet
category: Data
series: ClickHouse on Kubernetes
tags:
  - Data
  - ClickHouse
  - ClickHouse on Kubernetes
slug: /2024/03/clickhouse-monitoring.html
thumbnail: /media/2024/03/monitoring-clickhouse/clickhouse-monitoring.png
description: Complete guide to monitoring ClickHouse on Kubernetes. Learn about built-in dashboards, Prometheus + Grafana setup, powerful system tables for monitoring queries, and the ClickHouse Monitoring UI dashboard. Includes practical examples, essential monitoring queries, and best practices for production observability.
twitterCommentUrl: https://x.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2024%2F03%2Fclickhouse-monitoring.html
---

Now that you have your [first ClickHouse instance on Kubernetes](https://blog.duyet.net/2024/03/clickhouse-on-kubernetes.html) and are starting to use it, monitoring and observing what happens on it is an important task to achieve stability and optimal performance.

**In this guide, you'll learn about:**
- Built-in advanced observability dashboard
- Setting up Prometheus + Grafana for metrics visualization
- Leveraging ClickHouse system tables for deep insights
- Using ClickHouse Monitoring UI for simplified management

There are several effective approaches to monitoring ClickHouse:

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

# Summary and Best Practices

Effective monitoring is crucial for maintaining a healthy ClickHouse cluster. Let's recap the key monitoring strategies and best practices:

## Monitoring Approaches Comparison

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **Built-in Dashboard** | ✅ No setup required<br>✅ Real-time metrics<br>✅ Lightweight | ❌ Basic features<br>❌ No historical data<br>❌ Single instance view | Quick health checks, Development |
| **Prometheus + Grafana** | ✅ Industry standard<br>✅ Extensive customization<br>✅ Alerting support<br>✅ Long-term storage | ❌ Complex setup<br>❌ Resource intensive<br>❌ Requires expertise | Production environments, Large clusters |
| **System Tables** | ✅ Most detailed insights<br>✅ SQL-based queries<br>✅ No external deps | ❌ Manual querying<br>❌ No visualization<br>❌ Requires SQL knowledge | Debugging, Performance tuning |
| **Monitoring UI** | ✅ Easy to use<br>✅ Multiple clusters<br>✅ Quick deployment | ❌ Limited customization<br>❌ Community tool | Small to medium clusters, Quick setup |

## Key Metrics to Monitor

**Performance Metrics:**
- 📊 **Queries per second (QPS)** - Request throughput
- ⏱️ **Query duration** - P50, P90, P99 latencies
- 💾 **Memory usage** - Per query and cluster-wide
- 🔄 **CPU utilization** - Query processing load
- 📝 **Merge activity** - Background operations health

**Operational Metrics:**
- 🗂️ **MergeTree parts** - Data organization efficiency
- 📦 **Disk usage** - Storage capacity tracking
- 🔌 **Connections** - Active client connections
- ⚠️ **Failed queries** - Error rate monitoring
- 🔄 **Replication lag** - For replicated setups

**Critical System Tables:**
- `system.query_log` - Query history and performance
- `system.processes` - Currently running queries
- `system.merges` - Merge operations status
- `system.replication_queue` - Replication health
- `system.parts` - Table parts information
- `system.metrics` - Real-time metrics
- `system.asynchronous_metrics` - Periodic metrics

## Essential Monitoring Queries

**Find slow queries:**
```sql
SELECT
    query_duration_ms,
    query,
    user,
    query_start_time
FROM system.query_log
WHERE type = 'QueryFinish'
  AND query_duration_ms > 10000
ORDER BY query_duration_ms DESC
LIMIT 10
```

**Check current running queries:**
```sql
SELECT
    elapsed,
    query,
    user,
    memory_usage
FROM system.processes
ORDER BY elapsed DESC
```

**Monitor disk usage:**
```sql
SELECT
    database,
    table,
    formatReadableSize(sum(bytes)) AS size
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes) DESC
LIMIT 20
```

## Production Recommendations

**1. Implement Multi-Layer Monitoring:**
- Use Prometheus + Grafana for real-time metrics and alerting
- Keep system tables accessible for deep debugging
- Deploy Monitoring UI for quick cluster overview

**2. Set Up Alerting:**
- High query error rate (> 1%)
- Memory usage > 80%
- Disk usage > 85%
- Too many table parts (> 300 per partition)
- Replication lag > 5 minutes
- Query duration spikes

**3. Regular Health Checks:**
- Daily: Review slow query log
- Weekly: Analyze query patterns and optimize
- Monthly: Capacity planning review
- Quarterly: Performance benchmarking

**4. Documentation:**
- Maintain runbooks for common issues
- Document baseline metrics for your workload
- Keep track of configuration changes
- Share monitoring dashboards with team

**5. Continuous Improvement:**
- Regularly review and update alert thresholds
- Add custom metrics for business-specific KPIs
- Optimize queries based on monitoring insights
- Scale infrastructure proactively based on trends

## Next Steps

Now that you have monitoring in place:
1. Explore [ReplicatedReplacingMergeTree](/2024/06/clickhouse-replicatedreplacingmergetree.html) for high availability
2. Learn about [query optimization techniques](https://clickhouse.com/docs/en/guides/improving-query-performance)
3. Implement [backup and disaster recovery](https://clickhouse.com/docs/en/operations/backup)
4. Set up proper [access control and security](https://clickhouse.com/docs/en/operations/access-rights)

Remember: Good monitoring is not just about collecting metrics—it's about understanding your system's behavior and making informed decisions to maintain performance and reliability.

## Resources

- 📖 [Official ClickHouse Monitoring Documentation](https://clickhouse.com/docs/en/operations/monitoring)
- 🎥 [Visualizing Data with ClickHouse + Grafana](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- 🔧 [ClickHouse Monitoring UI](https://github.com/duyet/clickhouse-monitoring)
- 📊 [Grafana Dashboards](https://github.com/Altinity/clickhouse-operator/tree/master/grafana-dashboard)
- 💬 [ClickHouse Community Slack](https://clickhouse.com/slack)
