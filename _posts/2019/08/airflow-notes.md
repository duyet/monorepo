---
template: post
title: Airflow - một số ghi chép
date: "2019-08-27"
category: Data Engineer
tags:
- Airflow
- Data
- Data Engineer
slug: /2019/08/airflow-note.html
thumbnail: https://images.unsplash.com/photo-1548945357-bc51479af448?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80
description: Một số ghi chép, tips & tricks của mình trong quá trình sử dụng Apache Airflow.
fbCommentUrl: none
---

Một số ghi chép, tips & tricks của mình trong quá trình sử dụng Apache Airflow.

- Viết các functions (tasks) luôn cho mọi kết quả giống nhau với các input giống nhau (stateless).
    + Tránh sử dụng global variables, random values, hardware timers.
- Một số tính năng nên biết
    + `depends_on_past` sử dụng khi viết DAGs để chắc chắn mọi task instance trước đó đều success.
    + `LatestOnlyOperator` để skip một số bước phía sau nếu một số task bị trễ.
    + `BranchPythonOperator` cho phép rẽ nhánh workflow tùy vào điều kiện được định nghĩa.
- Sử dụng `airflow test <dag-id> <task-id> ...` để test task instance trên local khi code.
- [Sử dụng Docker Compose](https://blog.duyet.net/2019/08/airflow-docker-compose.html) để thiết lập môi trường local cho dễ.
- Để test DAG với scheduler, hãy set `schedule_interval=@once`, chạy thử, để chạy lại thì chỉ cần clear DagRuns trên UI hoặc bằng lệnh `airflow clear`
- Khi DAG đã được chạy, airflow chứa các task instance trong DB. Nếu bạn thay đổi `start_date` hoặc interval, scheduler có thể sẽ gặp lỗi. Nên đổi tên `dag_id` nếu muốn thay đổi `start_date` hoặc interval.
- Sử dụng Bitshift thay vì `set_upstream()` and `set_downstream()` để code dễ nhìn hơn, ví dụ
    ```python
    op1 >> op2
    # tương đương: op1.set_downstream(op2)

    op1 >> op2 >> op3 << op4
    # tương đương:
    #    op1.set_downstream(op2)
    #    op2.set_downstream(op3)
    #    op3.set_upstream(op4)

    op1 >> [op2, op3] >> op4
    # tương đương
    #    op1 >> op2
    #    op1 >> op3
    #    op2 >> op4
    #    op3 >> op4
    # hoặc tương đương
    #    op1.set_downstream([op2, op3])
    #    op2.set_downstream(op4)
    #    op3.set_downstream(op4)
    ```
- Sử dụng `Variables` để lưu trữ params của DAGs (`Admin` -> `Variables`)
    ```python
    from airflow.models import Variable
    foo = Variable.get("foo")
    bar = Variable.get("bar", deserialize_json=True)
    baz = Variable.get("baz", default_var=None)
    ```
    hoặc sử dụng variable trong jinja template:
    ```bash
    echo {{ var.value.<variable_name> }}
    ```
- [Sử dụng Slack để nhận thông báo lỗi](https://blog.duyet.net/2019/08/slack-alerts-in-airflow.html)
- Sử dụng **default arguments** để tránh lặp lại các tham số
    ```python
    default_args = {
        'owner': 'airflow',
        'depends_on_past': False,
        'params': { 'foo': 'baz' }
    }

    with DAG(dag_id='airflow', default_args=default_args):
        op1 = BigQueryOperator(task_id='query_1', sql='SELECT 1')
        op2 = BigQueryOperator(task_id='query_2', sql='SELECT 2')
        op1 >> op2
    ```
- Lưu password, token trong `Connections`
    ```python
    from airflow.hooks.base_hook import BaseHook
    aws_token = BaseHook.get_connection('aws_token').password
    ```
- Có thể generate DAG một cách tự động, ví dụ
    ```python
    def create_dag(id):
        dag = DAG(f'dag_job_{id}', default_args)
        op1 = BigQueryOperator(task_id='query_1', sql='SELECT 1', dag=dag)
        ...
        return dag

    for i in range(100):
        globals()[f'dag_job_{id}'] = create_dag(id)
    ```