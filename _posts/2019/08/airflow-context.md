---
template: post
title: Airflow - "context" dictionary
date: "2019-08-09"
author: Van-Duyet Le
category: Data Engineer
tags:
- Data
- Python
- Data Engineer
- Airflow

thumbnail: https://4.bp.blogspot.com/-H9PlWKnP_Gc/XU2U4yVVQtI/AAAAAAABFVY/MZem1VyxGr8ORiZbRNx3Kno5C4nzJeeEgCK4BGAYYCw/s200/1_6jjSw8IqGbsPZp7L_43YyQ.png
slug: /2019/08/airflow-context.html
description: Biến `context` trong airflow là biến hay sử dụng trong Airflow (`PythonOperator` with a callable function), nhưng mình rất hay quên, note lại đây để dễ dàng tra cứu.
fbCommentUrl: none
---

Biến `context` trong airflow là biến hay sử dụng trong Airflow (`PythonOperator` with a callable function), nhưng mình rất hay quên, note lại đây để dễ dàng tra cứu.

```python
{
      'dag': task.dag,
      'ds': ds,
      'next_ds': next_ds,
      'next_ds_nodash': next_ds_nodash,
      'prev_ds': prev_ds,
      'prev_ds_nodash': prev_ds_nodash,
      'ds_nodash': ds_nodash,
      'ts': ts,
      'ts_nodash': ts_nodash,
      'ts_nodash_with_tz': ts_nodash_with_tz,
      'yesterday_ds': yesterday_ds,
      'yesterday_ds_nodash': yesterday_ds_nodash,
      'tomorrow_ds': tomorrow_ds,
      'tomorrow_ds_nodash': tomorrow_ds_nodash,
      'END_DATE': ds,
      'end_date': ds,
      'dag_run': dag_run,
      'run_id': run_id,
      'execution_date': self.execution_date,
      'prev_execution_date': prev_execution_date,
      'next_execution_date': next_execution_date,
      'latest_date': ds,
      'macros': macros,
      'params': params,
      'tables': tables,
      'task': task,
      'task_instance': self,
      'ti': self,
      'task_instance_key_str': ti_key_str,
      'conf': configuration,
      'test_mode': self.test_mode,
      'var': {
          'value': VariableAccessor(),
          'json': VariableJsonAccessor()
      },
      'inlets': task.inlets,
      'outlets': task.outlets,
}
```