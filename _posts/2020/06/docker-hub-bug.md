---
template: post
title: Scheduling Python script in Airflow
date: "2020-06-24"
author: Van-Duyet Le
category: Data Engineer
tags:
- Data Engineer
- Airflow
- Python

thumbnail: https://images.unsplash.com/photo-1592928038511-20202bdad1fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80
slug: /2020/06/scheduling-python-script-in-airflow.html
description: To schedule a Python script or Python function in Airflow, we use `PythonOperator`.
fbCommentUrl: none
---

To schedule a Python script or Python function in Airflow, we use `PythonOperator`.

```python
from airflow import DAG
from airflow.operators.python_operator import PythonOperator

def my_python_function():
    # your code goes here
    print('Hello')

def my_python_function_with_context(**context):
    # For more detail about "context" object, 
    # please refer to https://blog.duyet.net/2019/08/airflow-context.html
    ds = context['ds']
    print(f'Dag run at {ds}')

dag = DAG('dag_id')
PythonOperator(dag=dag,
               task_id='my_python_function',
               python_callable=my_python_function)

PythonOperator(dag=dag,
               task_id='my_python_function_with_context',
               provide_context=True,
               python_callable=my_python_function_with_context)
```

# Passing in arguments

Use the `op_args` and `op_kwargs` arguments to pass additional arguments to the Python callable.

```python
from airflow import DAG
from airflow.operators.python_operator import PythonOperator

def my_python_function(ds, lucky_number, **kwargs):
    print(f'Dag run at {ds}')
    print(f'Random number is {lucky_number}')

dag = DAG('dag_id')
run_this = PythonOperator(dag=dag,
               task_id='my_python_function',
               provide_context=True,
               python_callable=my_python_function,
               op_kwargs={
                   'lucky_number': 99
               })
```

# References

- [http://airflow.apache.org/docs/stable/howto/operator/python.html](http://airflow.apache.org/docs/stable/howto/operator/python.html)
- [Airflow - "context" dictionary](https://blog.duyet.net/2019/08/airflow-context.html)