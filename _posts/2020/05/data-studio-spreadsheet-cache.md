---
template: post
title: "Data Studio: Connecting BigQuery and Google Sheets to help with hefty data analysis"
date: "2020-05-01"
author: Van-Duyet Le
category: Data Engineer
tags:
- Data Engineer
- Visualization
- Data Studio

thumbnail: https://1.bp.blogspot.com/-tL8SgFMEaQU/XqwoFKV6DxI/AAAAAAABWeM/jCbFEFQ8rkUIndBbUppJt7xuG5gajTJawCK4BGAYYCw/s1200/caching-with-spreadsheet.png
slug: /2020/05/data-studio-caching-with-spreadsheet.html
draft: false
description: Normally, with BigQuery as a data source of Data Studio, users (of Data Studio Dashboard) might end up generating a lot of queries on your behalf — and that means you can end up with a huge BigQuery bill. It’s taken so long to refresh data when you change something in development mode. How to solve this problem with Spreadsheet, for free?
fbCommentUrl: none
---

Normally, with BigQuery as a data source of Data Studio, it’s should be:

![](/media/2020/data-studio-spreadsheet/data-studio-bigquery.svg)

The problems:

- Users (of Data Studio Dashboard) might end up generating a lot of queries on your behalf — and that means you can end up with a huge BigQuery bill.
- It’s taken so long to refresh data when you change something in development mode.
- The easiest way to avoid pushing new queries from Data Studio into BigQuery is to materialize the results of your queries into Data Studio. But right now that feature is still in development, and it will be subject to certain limitations — so we also shared some other options to create an inexpensive layer between Data Studio and BigQuery.

# Google Sheets as a Caching layer

With the Sheets data connector for BigQuery, you can cache the calculated data for Data Studio. Then, use Data Studio connects to that sheet to reduce the time load and avoid pushing queries to BigQuery, and Spreadsheet is free.

![](/media/2020/data-studio-spreadsheet/caching-with-spreadsheet.png)

# Sheets data connector for BigQuery

1. Google Sheets

    ![](/media/2020/data-studio-spreadsheet/howto-step-1.png)

2. Choose Billing Project

    ![](/media/2020/data-studio-spreadsheet/howto-step-2.png)

3. Write a Query

    ![](/media/2020/data-studio-spreadsheet/howto-step-3.png)

4. Refresh Manually

    ![](/media/2020/data-studio-spreadsheet/howto-step-4.png)

5. Schedule automatic updates: You'll be able to use tools like [Apps Script](https://developers.google.com/apps-script/) and [the macro recorder](https://www.blog.google/products/g-suite/think-macro-record-actions-google-sheets-skip-repetitive-work/) to schedule automatic updates to the connected BigQuery data.

Good luck!

# References

 - [Analyze hefty data sets with BigQuery and Google Sheets](https://gsuiteupdates.googleblog.com/2019/01/bigquery-google-sheets-analyze-data.html)
 - [Think macro: record actions in Google Sheets to skip repetitive work](https://www.blog.google/products/g-suite/think-macro-record-actions-google-sheets-skip-repetitive-work/)
 - [Connect Data Studio to BigQuery tables.](https://support.google.com/datastudio/answer/6370296)