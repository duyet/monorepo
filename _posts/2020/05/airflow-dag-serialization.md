---
template: post
title: Airflow DAG Serialization
date: "2020-05-01"
author: Van-Duyet Le
category: Data Engineer
tags:
- Data Engineer
- Airflow
thumbnail: https://1.bp.blogspot.com/-5cIyBwelyrQ/Xvg-wwqPJRI/AAAAAAABeeI/d4DPBinapik2Dffz3wXSTnsU7cgCHPqBACK4BGAYYCw/s1600/dag_serialization.png
slug: /2020/05/airflow-dag-serialization.html
draft: false
description: In order to make Airflow Webserver stateless, Airflow >=1.10.7 supports DAG Serialization and DB Persistence.

fbCommentUrl: none
---

![](/media/2020/airflow-dag-serialization/dag_serialization.png)

From [the Airflow docs](https://airflow.apache.org/docs/1.10.10/dag-serialization.html): 

Without DAG Serialization & persistence in DB, the Webserver and the Scheduler both needs access to the DAG files. Both the scheduler and webserver parses the DAG files.

With DAG Serialization we aim to decouple the webserver from DAG parsing which would make the Webserver very light-weight.

The Webserver now instead of having to parse the DAG file again, reads the serialized DAGs in JSON, de-serializes them and create the DagBag and uses it to show in the UI.

One of the key features that is implemented as the part of DAG Serialization is that instead of loading an entire DagBag when the WebServer starts we only load each DAG on demand from the Serialized Dag table. This helps reduce Webserver startup time and memory. The reduction is notable when you have large number of DAGs.

# Enable Dag Serialization

Add the following settings in `airflow.cfg`:

```ini
[core]
store_serialized_dags = True
min_serialized_dag_update_interval = 30
```

If you are updating Airflow from <1.10.7, please do not forget to run `airflow db upgrade`.

# References

- https://airflow.apache.org/docs/1.10.10/dag-serialization.html