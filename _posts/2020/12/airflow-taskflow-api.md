---
template: post
title: Airflow 2.0 - Taskflow API
date: "2020-12-26"
author: Van-Duyet Le
category: Data Engineer
tags:
  - Airflow
  - Data Engineer
  - Airflow 2.0
thumbnail: https://1.bp.blogspot.com/-ON0KTUqotAs/X-chcnFmhtI/AAAAAAABzmA/-kBwGuYyCS44Q16FCHL23iio9WUm6Ux9wCLcBGAsYHQ/s0/duyet-airflow-taskflow-api.png
slug: /2020/12/airflow-taskflow-api.html
draft: false
description: Chú trọng vào việc đơn giản hóa và rõ ràng cách viết Airflow DAG, cách trao đổi thông tin giữa các tasks, Airflow 2.0 ra mắt Taskflow API cho phép viết đơn giản và gọn gàng hơn so với cách truyền thống, đặc biệt vào các pipelines sử dụng PythonOperators.
fbCommentUrl: none
---

Chú trọng vào việc đơn giản hóa và rõ ràng cách viết Airflow DAG, cách trao đổi thông tin giữa các tasks, Airflow 2.0 ra mắt Taskflow API cho phép viết đơn giản và gọn gàng hơn so với cách truyền thống, đặc biệt vào các pipelines sử dụng PythonOperators.

Sau đây là ví dụ khi sử dụng cách viết mới Taskflow API trong Airflow 2.0:

```python
import urllib.request, json 

from airflow.decorators import dag, task
from airflow.utils.dates import days_ago

default_args = { 'owner': 'me@duyet.net' }

@dag(default_args=default_args, schedule_interval=None, start_date=days_ago(2))
def taskflow_api_etl():
  """
  ### TaskFlow API ETL Documentation
  This is document for this DAG
  """
  data_source_url = 'https://data.duyet.net/_/orders/123.json'

  @task
  def extract():
    """
    #### Extract task
    This is document for this task - extract().
    A simple Extract task to get data ready for the rest of the data
    pipeline. In this case, getting data from remote data source url.
    """
    src = urllib.request.urlopen(data_source_url)
    data = json.loads(url.read().decode())
    
    return data

  @task(multiple_outputs=True)
  def transform(data: dict):
    """
    ### Transform task
    """
    total_order_value = 0
    order_keys = data.keys()

    for value in data.values():
      total_order_value += value

    return {
      "total_order_value": total_order_value,
      "order_keys": order_keys
    }

  @task()
  def load(total_order_value: float, order_keys: list):
    print("Total order value is: %.2f" % total_order_value)
    print("List of order keys: %s" % order_keys)

  order_data = extract()
  order_summary = transform(order_data)
  load(order_summary["total_order_value"], order_summary["order_keys"])

dag = taskflow_api_etl()
```

## 1. DAG

Đây là cách viết mới bằng cách sử dụng các Python decorators của Taskflow API: `@dag` và `@task`

Trong ví dụ trên, chúng ta sử dụng `@dag` decorator cho python function `taskflow_api_etl`, đây là **DAG ID**,
phần mô tả nằm trong docblockr sẽ hiển thị trên Airflow webserver.

```python
@dag(default_args=default_args, schedule_interval=None, start_date=days_ago(2))
def taskflow_api_etl():
  """
  ### TaskFlow API ETL Documentation
  This is document for this DAG
  """
```

DAG cũng hỗ trợ parameterize nếu bạn thêm tham số vào DAG function, tham số này sẽ được sử dụng khi trigger DAG manually. Xem thêm về [Passing Parameters when triggering dags](https://airflow.apache.org/docs/apache-airflow/stable/dag-run.html#dagrun-parameters).

```python
@dag
def example_dag(email: str = 'me@duyet.net'):
  ...
```

## 2. Tasks

Trong pipeline ở trên, ta có 3 tasks python function, sử dụng `@task` decorator. Tên của function dùng để đặt tên cho `task_id`. Cách viết mới này chỉ cần sử dụng `@task` thay vì định nghĩa python function rồi bỏ vào `PythonOperator`.

```python
@task
def extract():
  """
  #### Extract task
  This is document for this task - extract().
  A simple Extract task to get data ready for the rest of the data
  pipeline. In this case, getting data from remote data source url.
  """
  src = urllib.request.urlopen(data_source_url)
  data = json.loads(url.read().decode())
  
  return data
```

Outputs và inputs sẽ được gửi qua lại giữa các tasks sử dụng [XCom](https://airflow.apache.org/docs/apache-airflow/stable/concepts.html#concepts-xcom).
Output return từ function task, được sử dụng để làm input cho các tasks tiếp theo. Với cách này, input và output, mối quan hệ giữa các task sẽ tường minh hơn.

Sử dụng `@task(multiple_outputs=True)` để tách ra nhiều giá trị XCom nếu task task trả về một dictionaries, lists hoặc tuples. 

Ví dụ:

```python
@task(multiple_outputs=True)
def transform(data: dict):
  ...
  return {
    "total_order_value": total_order_value,
    "order_keys": order_keys
  }

output = transform(data)
print(output.total_order_value)
print(output.order_keys)
```

Nếu sử dụng typing `Dict` cho function return type thì `multiple_outputs` cũng tự động được set thành `True`.

```python
@task
def identity_dict(x: int, y: int) -> Dict[str, int]:
    return {"x": x, "y": y}
```

Nếu gọi decorated function nhiều lần trong 1 DAG, decorated function sẽ tự động generate ra các `task_id` mới.

```python
@dag()
def taskflow_api_etl():
  @task
  def extract(uid: str):
    # ...
    return data

  # This will generate an operator for each uid
  for uid in user_ids:
    extract(uid)
```

Ví dụ trên, DAG sẽ tạo ra các task ids sau: `[extract, extract__1, extract__2, ...]`.

## 3. Context

Để truy cập vào [context](https://blog.duyet.net/2019/08/airflow-context.html), bạn có thể sử dụng `get_current_context`.

```python
from airflow.operators.python import task, get_current_context
@task
def my_task():
    context = get_current_context()
    ti = context["ti"]
```

Gọi method này ngoài execution context sẽ raise error.

## 4. Airflow decorators vs Operator

Taskflow API decorators có thể được sử dụng kết hợp với các Operator truyền thống, như ví dụ dưới đây:

```python
# ...
with DAG('send_server_ip', default_args=default_args) as dag:
  get_ip = SimpleHttpOperator(task_id='get_ip', xcom_push=True)
  
  @task
  def prepare_email(raw_json: str) -> Dict[str, str]:
    external_ip = json.loads(raw_json)['origin']
    return {
      'subject':f'Server connected from {external_ip}',
      'body': f'External IP {external_ip}'
    }

  email_info = prepare_email(get_ip.output)
  send_email = EmailOperator(
      task_id='send_email',
      to='example@example.com',
      subject=email_info['subject'],
      html_content=email_info['body']
  )
```

```python
# ...
@dag
def send_server_ip(default_args=default_args):
  get_ip = SimpleHttpOperator(task_id='get_ip', xcom_push=True)

  @task
  def prepare_email(raw_json: str) -> Dict[str, str]:
    external_ip = json.loads(raw_json)['origin']
    return {
      'subject':f'Server connected from {external_ip}',
      'body': f'External IP {external_ip}'
    }

  email_info = prepare_email(get_ip.output)
  send_email = EmailOperator(
      task_id='send_email',
      to='example@example.com',
      subject=email_info['subject'],
      html_content=email_info['body']
  )

DAG = send_server_ip()
```

## Kết

Bây giờ bạn đã biết khi viết 1 DAG sử dụng Taskflow API trong Airflow 2.0 sẽ đơn giản và tường minh hơn như thế nào. Tham khảo thêm tại trang [Concepts](https://airflow.apache.org/docs/apache-airflow/stable/concepts.html#concepts) để xem các giải thích chi tiết về Airflow như DAGs, Tasks, Operators, ... cũng như [Python task decorator](https://airflow.apache.org/docs/apache-airflow/stable/concepts.html#concepts-task-decorator).