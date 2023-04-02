---
template: post
title: Spark on Kubernetes Performance Tuning
date: "2021-04-10"
author: Van-Duyet Le
category: Data Engineer
tags:
  - Data Engineer
  - Spark
  - Apache Spark
thumbnail: https://1.bp.blogspot.com/-DqjllNPwXAs/YHG4KE1w2bI/AAAAAAAB_Hc/-laW2XvRNHgXvgub8XcNgw83tajD2ihlQCLcBGAsYHQ/s0/image-20210221-073612.png
slug: /2021/04/spark-kubernetes-performance-tuning.html
draft: false
description: Spark Performance tuning is a process to improve the performance of the Spark, on this post, I will focus on Spark that runing of Kubernetes.
fbCommentUrl: none
---

# Adaptive Query Execution

Adaptive Query Execution (AQE) is an optimization technique in Spark SQL that makes use of the runtime statistics to choose the most efficient query execution plan. AQE is disabled by default. As of Spark 3.0, there are three major features in AQE, including coalescing post-shuffle partitions, converting sort-merge join to broadcast join, and skew join optimization.

Enable this optimization: `spark.sql.adaptive.enabled=true`

Reference: https://docs.databricks.com/spark/latest/spark-sql/aqe.html

# Kryo serialization

Serialization plays an important role in the performance of any distributed application. By default, Spark serializes objects using Java’s ObjectOutputStream framework. Spark can also use the Kryo library (version 4) to serialize objects more quickly. Kryo is significantly faster and more compact than Java serialization (often as much as 10x), but does not support all Serializable types and requires you to register the classes you’ll use in the program in advance for best performance..

Enable this optimization: `spark.serializer=org.apache.spark.serializer.KryoSerializer`

Reference: https://spark.apache.org/docs/latest/tuning.html#data-serialization

# Tuning Java Pointer
Java pointer: reduce memory consumption is to avoid the Java features that add overhead, such as pointer-based data structures.

Enable this optimization:
 - Avoid nested structures
 - Consider using numeric IDs or enumeration objects instead of strings for keys
    - Set the JVM flag `-XX:+UseCompressedOops` to make pointers be four bytes instead of eight
`spec.driver.javaOptions and spec.executor.javaOptions`

Reference: https://spark.apache.org/docs/latest/tuning.html#tuning-data-structures

# Ignoring Data Locality in Spark

Data Locality in Apache Spark avoided the data movement over network in HDFS, so whenever spark connects to sources like HDFS, s3 it captures the locations of files.

The above approach makes sense when spark cluster is co-located with distributed file system like HDFS. But with S3, reading locations of files is not useful as spark schedule can’t use this information for co-locating the processing. We need to avoid the `wasting a lot of time` initially to figure all block location of remote files in S3.

![Ignoring Data Locality in Spark](https://1.bp.blogspot.com/-DqjllNPwXAs/YHG4KE1w2bI/AAAAAAAB_Hc/-laW2XvRNHgXvgub8XcNgw83tajD2ihlQCLcBGAsYHQ/s0/image-20210221-073612.png)

Enable this optimization: `spark.sql.sources.ignoreDataLocality.enabled=true`

Reference: https://issues.apache.org/jira/browse/SPARK-29189


# I/O with S3

It's longer time to append data to an existing dataset and in particular, all of Spark jobs have finished, but your command has not finished, it is because driver node is moving the output files of tasks from the job temporary directory to the final destination one-by-one, which is slow with cloud storage (e.g. S3).

Enable this optimization: `spark.hadoop.mapreduce.fileoutputcommitter.algorithm.version=2`

Reference: https://kb.databricks.com/data/append-slow-with-spark-2.0.0.html


# Dynamic Allocation Shuffle File Tracking

Experimental. Enables shuffle file tracking for executors, which allows dynamic allocation without the need for an external shuffle service. This option will try to keep alive executors that are storing shuffle data for active jobs.

Enable this optimization: `spark.dynamicAllocation.shuffleTracking.enabled=true`
