---
title: Airflow control the parallelism and concurrency (draw)
date: '2023-07-16'
author: Duyet
category: Data
tags:
  - Data
  - Data Engineering
  - Airflow
slug: /2023/07/airflow-control-parallelism-concurrency.html
thumbnail: /media/2023/07/airflow-control-parallelism-concurrency.svg
description: 'How to control parallelism and concurrency'
---

![Airflow control the parallelism and concurrency](/media/2023/07/airflow-control-parallelism-concurrency.svg)

Airflow configuration to allow for a larger scheduling capacity and frequency:

- [parallelism](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html#config-core-parallelism)
- [max_active_tasks_per_dag](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html#config-core-max-active-tasks-per-dag)
- [max_active_runs_per_dag](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html#config-core-max-active-runs-per-dag)

DAGs have configurations that improve efficiency:

- `max_active_tasks`: Overrides [max_active_tasks_per_dag](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html#config-core-max-active-tasks-per-dag).
- `max_active_runs`: Overrides [max_active_runs_per_dag](https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html#config-core-max-active-runs-per-dag).

Operators or tasks also have configurations that improves efficiency and scheduling priority:

- `max_active_tis_per_dag`: This parameter controls the number of concurrent running task instances across `dag_runs` per task.
- `pool`: See [Pools](https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/pools.html#concepts-pool).
- `priority_weight`: See [Priority Weights](https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/priority-weight.html#concepts-priority-weight).
- `queue`: See [Queues](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/celery.html#executor-celeryexecutor-queue) for CeleryExecutor deployments only.

## Credits

- [Airflow Fundamental Concepts > Backfill](https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html#backfill)
- [How to control the parallelism or concurrency of an Airflow installation?](https://stackoverflow.com/a/56370721)
