---
template: post
title: Gửi Slack Alerts trên Airflow
date: "2019-08-20"
category: Data Engineer
tags:
- Airflow
- Data
- Data Engineer
slug: /2019/08/slack-alerts-in-airflow.html
thumbnail: https://1.bp.blogspot.com/-jAfy6D8deHU/XVwQdvnubFI/AAAAAAABFzg/b3ASQC3mmtozUhAQPdBRa3mJGE-Cd23GgCLcBGAs/s1600/airflow-alert-slack.png
description: Slack là một công cụ khá phổ biến trong các Team, slack giúp tập hợp mọi thông tin về Slack (như Jira alert, ETL pipelines, CI/CD status, deployments, ...) một cách thống nhất và dễ dàng theo dõi. Bài viết này mình hướng dẫn gửi mọi báo lỗi của Airflow đến Slack.
fbCommentUrl: none
---

Slack là một công cụ khá phổ biến trong các Team, slack giúp tập hợp mọi thông tin về Slack (như Jira alert, ETL pipelines, CI/CD status, deployments, ...) một cách thống nhất và dễ dàng theo dõi. Bài viết này mình hướng dẫn gửi mọi báo lỗi của Airflow đến Slack.

# 1. Slack Incoming Webhooks và Airflow Connection

Truy cập Slack App Directory tìm Incoming Webhooks: `https://<workspace>.slack.com/apps/A0F7XDUAZ-incoming-webhooks`

![](https://1.bp.blogspot.com/-mskOJFO7b-8/XVwRLj7cHfI/AAAAAAABFzo/RL59VK0ntqE5tS4B_N2n_Fw9loUQ4nR4QCLcBGAs/s1600/Pasted_Image_8_20_19__10_25_PM.png)

Ở mục **Post to Channel** chọn Channel, sau đó bấm **Add Incoming Webhooks integration**

![](https://1.bp.blogspot.com/-YwSGP7SSxg4/XVwRuuixzcI/AAAAAAABFzw/ukZRvTux-g0AM6MVGJdwyvKDMqFpfDpLgCLcBGAs/s1600/Screen%2BShot%2B2019-08-20%2Bat%2B10.28.21%2BPM.png)

Sau đó bạn sẽ nhận được 1 URL có dạng:
https://hooks.slack.com/services/T00000000/B0000000/hssA66nupi72KAFy9ttv5fr2


![](https://1.bp.blogspot.com/-5wTS8VRYK4M/XVwSPb4dlTI/AAAAAAABFz8/mnADDTCj0eEAe-WsLN5yaCTWVPOlkefxgCLcBGAs/s1600/Pasted_Image_8_20_19__10_29_PM.png)

Vào **Airflow** > **Admin** >  **Connections** để thêm một connection mới

- Conn Id: `Slack`
- Conn Type: `HTTP`
- Host: `https://hooks.slack.com/services`
- Password: `/T00000000/B0000000/hssA66nupi72KAFy9ttv5fr2`

![](https://1.bp.blogspot.com/-zoKGhbURtjo/XVwVX5YOLTI/AAAAAAABF0I/3oitPGuOHwweJLli5Kjai8bC-Bbp7ighQCLcBGAs/s1600/Pasted_Image_8_20_19__10_43_PM.png)

# 2. Slack alert Utils

Tạo file utils chứa function alert, ví dụ: `/dags/utils/slack_alert.py`

```python
from airflow.hooks.base_hook import BaseHook
from airflow.contrib.operators.slack_webhook_operator import SlackWebhookOperator

SLACK_CONN_ID = 'slack'


def task_fail_slack_alert(context):
    slack_webhook_token = BaseHook.get_connection(SLACK_CONN_ID).password
    slack_msg = """
Task Failed. 
*DAG*: {dag_id} 
*Task*: {task}  
*Dag*: {dag} 
*Execution Time*: {exec_date}  
*Log Url*: {log_url} 
    """.format(
        dag_id=context.get('dag').dag_id,
        task=context.get('task_instance').task_id,
        dag=context.get('task_instance').dag_id,
        ti=context.get('task_instance'),
        exec_date=context.get('execution_date'),
        log_url=context.get('task_instance').log_url,
    )
    failed_alert = SlackWebhookOperator(
        task_id='slack_alert',
        http_conn_id=SLACK_CONN_ID,
        webhook_token=slack_webhook_token,
        message=slack_msg,
        username='airflow')
    return failed_alert.execute(context=context)
```

# 3. Config Slack alert cho từng DAG

Với mỗi DAG muốn alert, ta thêm thuộc tính `on_failure_callback` cho mỗi DAG. Ví dụ như dưới dây:

`example_dag.py`
```py
from airflow import DAG
...
from utils.slack_alert import task_fail_slack_alert


default_args = {
    **params['default_args'],
    'owner': DAG_OWNER,
    'on_failure_callback': task_fail_slack_alert,
    ...
}

dag = DAG('dag_id', default_args=default_args)

...
```

Kết quả:

![](https://1.bp.blogspot.com/-jAfy6D8deHU/XVwQdvnubFI/AAAAAAABFzg/b3ASQC3mmtozUhAQPdBRa3mJGE-Cd23GgCLcBGAs/s1600/airflow-alert-slack.png)

# Tham khảo
- https://medium.com/datareply/integrating-slack-alerts-in-airflow-c9dcd155105
- airflow.operators.slack\_operator: [https://airflow.apache.org/\_modules/airflow/operators/slack_operator.html](https://airflow.apache.org/\_modules/airflow/operators/slack_operator.html)

Chúc các bạn thành công.