---
template: post
title: Python - Churn prediction with Graphlab
date: "2017-03-18"
author: Van-Duyet Le
tags:
- Python
- Javascript
- Churn
- Data Science
- Machine Learning
modified_time: '2018-09-01T22:32:19.839+07:00'
thumbnail: https://3.bp.blogspot.com/-QM-iDbzDDHA/WMyzyHEo0bI/AAAAAAAAkLg/xshMvTyQvmYvUQMzROiW4NOmuewyGoXfACK4B/s1600/churn-illustration.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8557769755258742344
blogger_orig_url: https://blog.duyet.net/2017/03/python-churn-prediction-with-graphlab.html
slug: /2017/03/python-churn-prediction-with-graphlab.html
category: Machine Learning
description: Churn prediction is the task of identifying whether users are likely to stop using a service, product, or website. With Graphlab toolkit, you can start with raw (or processed) usage metrics and accurately forecast the probability that a given customer will churn. 
fbCommentUrl: none 
---


Churn prediction is the task of identifying whether users are likely to stop using a service, product, or website. With Graphlab toolkit, you can start with raw (or processed) usage metrics and accurately forecast the probability that a given customer will churn.  
  

## Introduction

A churn predictor model learns historical user behavior patterns to make an accurate forecast for the probability of no activity in the future (defined as churn).  

## How is churn defined?

Customer churn can be defined in many ways. In this toolkit, churn is defined to be **no activity** for a fixed period of time (called the **churn\_period**). Using this definition, a user is said to have churned if there is no activity for a duration of time known as the **churn\_period** (by default, this is set to 30 days). The following figure better illustrates this concept.  
  

[![](https://3.bp.blogspot.com/-QM-iDbzDDHA/WMyzyHEo0bI/AAAAAAAAkLg/xshMvTyQvmYvUQMzROiW4NOmuewyGoXfACK4B/s1600/churn-illustration.png)](https://3.bp.blogspot.com/-QM-iDbzDDHA/WMyzyHEo0bI/AAAAAAAAkLg/xshMvTyQvmYvUQMzROiW4NOmuewyGoXfACK4B/s1600/churn-illustration.png)

## Input Data

In the dataset, let us assume that the last timestamp was October 1,  

```
+---------------------+------------+----------+
|     InvoiceDate     | CustomerID | Quantity |
+---------------------+------------+----------+
| 2010-12-01 08:26:00 |   17850    |    6     |
| 2010-12-01 08:26:00 |   17850    |    6     |
| 2010-12-01 08:26:00 |   17850    |    8     |
| 2010-12-01 08:26:00 |   17850    |    6     |
| 2010-12-01 08:26:00 |   17850    |    6     |
| 2010-12-01 08:26:00 |   17850    |    2     |
| 2010-12-01 08:26:00 |   17850    |    6     |
| 2010-12-01 08:28:00 |   17850    |    6     |
| 2010-12-01 08:28:00 |   17850    |    6     |
| 2010-12-01 08:34:00 |   13047    |    32    |
| 2010-12-01 08:34:00 |   13047    |    6     |
| 2010-12-01 08:34:00 |   13047    |    6     |
| 2010-12-01 08:34:00 |   13047    |    8     |
| 2010-12-01 08:34:00 |   13047    |    6     |
| 2010-12-01 08:34:00 |   13047    |    6     |
| 2010-12-01 08:34:00 |   13047    |    3     |
| 2010-12-01 08:34:00 |   13047    |    2     |
| 2010-12-01 08:34:00 |   13047    |    3     |
| 2010-12-01 08:34:00 |   13047    |    3     |
| 2010-12-01 08:34:00 |   13047    |    4     |
+---------------------+------------+----------+
[532618 rows x 5 columns]
```


If the **churn\_period** is set to 1 month, a churn forecast predicts the probability that a user will have no activity for a 1 month period after **October 1, 2011**.


<script src="https://gist.github.com/duyet/034938444f10f466cc02013dd27100fd.js"></script>