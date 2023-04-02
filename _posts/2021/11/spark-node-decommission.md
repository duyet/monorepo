---
template: post
title: Spark on Kubernetes - better handling for node shutdown 
date: "2021-11-22"
author: Van-Duyet Le
category: Data
tags:
  - Data Engineer
  - Spark
  - Kubernetes
slug: /2021/11/spark-node-decommission.html
thumbnail: https://1.bp.blogspot.com/--34hINH9_uQ/YZqJZ0URtWI/AAAAAAACXDw/yGn6wkjBWaMDfSZL3Hylwz6ILzP4xKDvACLcBGAsYHQ/s0/spark-spot-node-shutdown.png
draft: false
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2021%2F11%2Fspark-node-decommission.html
hackerNewsCommentUrl: https://news.ycombinator.com/item?id=29974675
description: >
  Spark 3.1 on the Kubernetes project is now officially declared as production-ready and Generally Available. Spot instances in Kubernetes can cut your bill by up to 70-80% if you are willing to trade in reliability.
  The new feature - SPIP: Add better handling for node shutdown (SPARK-20624) was implemented to deal with the problem of losing an executor when working with spot nodes - the need to recompute the shuffle or cached data.

---

# Nodes Decommissioning

Spark 3.1 on the Kubernetes project is now officially declared as production-ready and Generally Available. Spot instances in Kubernetes can cut your bill by up to 70-80% if you are willing to trade in reliability.

Now, If you use EC2 Spot or GCP Preemptible instances for costs optimization, in such a scenario, these instances can go away at any moment, and you may need to recompute the tasks they executed. On a shared cluster where the jobs with a higher priority can take the resources used by lower priority and already running jobs.

The new feature - **SPIP: Add better handling for node shutdown** ([SPARK-20624](https://issues.apache.org/jira/browse/SPARK-20624)) was implemented to deal with the problem of losing an executor when working with spot nodes - the need to recompute the shuffle or cached data.

# Before this feature

Before this feature, executor pods are lost when a node kill occurs and shuffle files are lost as well. Therefore driver needs to launch new executors, recomputing the tasks.

# With the feature

When a node kill occurs, the executor on the spot which is going away is blacklisted. The driver will stop scheduling new tasks on it. The task will be marked as failure (not counting to the max retries).

Shuffle files and cached data are migrated to another executor. We can also config the `spark.storage.decommission.fallbackStorage.path=s3a://duyet/spark-storage/` to S3 during block manager decommissioning. The storage should be managed by TTL or using `spark.storage.decommission.fallbackStorage.cleanUp=true` to clean up its fallback storage data during shutting down.

![Spark Nodes Decommissioning](/media/2021/11/spark-spot-node-shutdown.png)


# How to enable this?

We need to config the the **Spark configs** to turn it on

- `spark.decommission.enabled`: When decommission enabled, Spark will try its best to shutdown the executor gracefully.
- `spark.storage.decommission.rddBlocks.enabled`: Whether to transfer RDD blocks during block manager decommissioning
- `spark.storage.decommission.shuffleBlocks.enabled`: Whether to transfer shuffle blocks during block manager decommissioning. Requires a migratable shuffle resolver (like sort based shuffle).
- `spark.storage.decommission.enabled`: Whether to decommission the block manager when decommissioning executor.
- `spark.storage.decommission.fallbackStorage.path`: The location for fallback storage during block manager decommissioning. For example, `s3a://spark-storage/`. In case of empty, fallback storage is disabled. The storage should be managed by TTL because Spark will not clean it up.

Please referring to the [source code](https://github.com/apache/spark/blob/2e31e2c5f30742c312767f26b17396c4ecfbef72/core/src/main/scala/org/apache/spark/internal/config/package.scala#L1954) to look at the other available configurations.

Install **Node Termination Event Handler** to the Kubernetes Cluster. Please looking into projects for:

- AWS: https://github.com/aws/aws-node-termination-handler
- GCP: https://github.com/GoogleCloudPlatform/k8s-node-termination-handler
- Azure: https://github.com/diseq/k8s-azspot-termination-handler

These projects provide an adapter for translating node termination events to graceful pod terminations in Kubernetes so that Spark Decommission can handle them.

# References

- [https://www.waitingforcode.com/apache-spark/what-new-apache-spark-3.1-nodes-decommissioning/read](https://www.waitingforcode.com/apache-spark/what-new-apache-spark-3.1-nodes-decommissioning/read)
- [https://issues.apache.org/jira/browse/SPARK-20624](https://issues.apache.org/jira/browse/SPARK-20624)
