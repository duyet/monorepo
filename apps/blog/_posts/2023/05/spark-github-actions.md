---
title: Running Spark in GitHub Actions
date: '2023-05-07'
author: Duyet
category: Data
tags:
  - Data
  - Data Engineering
  - Apache Spark
  - Github
slug: /2023/05/spark-github-actions.html
thumbnail: /media/2023/05/spark-github-actions/1.png
description: 'This post provides a quick and easy guide on how to run Apache Spark in GitHub Actions for testing purposes'
---

This is how to quick and easy guide on how to run Apache Spark in GitHub Actions for testing purposes.

Imagine that I start with an example PySpark `app.py` script that reads data from a JSON file and performs some basic queries.

```python
import sys

from pyspark.sql import SparkSession

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: spark-submit app.py <input>")
        sys.exit(1)

    input_file_path = sys.argv[1]

    spark = SparkSession.builder.appName("Spark").getOrCreate()
    df = spark.read.json(input_file_path)

    df.createOrReplaceTempView("df")

    spark.sql("SELECT * FROM df LIMIT 10").show()
    spark.sql("SELECT COUNT(*) FROM df").show()
    spark.sql("SELECT cn, COUNT(*) FROM df GROUP BY cn ORDER BY 2 DESC").show()
    spark.sql("SELECT cn, MAX(temp) AS max_temp FROM df GROUP BY cn ORDER BY 2 DESC").show()
```

In local, we can submit it via

```bash
spark-submit app.py <input>
```

To run this PySpark script in GitHub Actions,
I've create a workflow file named [`spark-submit.yaml`]
in the `.github/workflows/` directory. The [`spark-submit.yaml`] file defines the steps that
GitHub Actions should take to run the PySpark script using the `spark-submit` command.

File: .github/workflows/spark-submit.yaml

```yaml
name: Spark Submit

on:
  push:
    branches:
      - 'master'

jobs:
  spark-submit:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        python:
          - '3.10'
          - '3.11'
        spark:
          - 3.3.2
          - 3.4.0

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python }}

      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - uses: vemonet/setup-spark@v1
        with:
          spark-version: ${{ matrix.spark }}
          hadoop-version: '3'

      - run: spark-submit app.py data.json
```

Here is the result detail for each run in Github Actions:

![](/media/2023/05/spark-github-actions/2.png)

The [`spark-submit.yaml`] file also specifies the [matrix strategy] to test the PySpark script on multiple versions of Python and Spark. In this example, the PySpark script will be tested on:

- Python 3.10, Spark 3.3.2.
- Python 3.10, Spark 3.4.0.
- Python 3.11, Spark 3.3.2.
- Python 3.11, Spark 3.4.0.

![](/media/2023/05/spark-github-actions/1.png)

This is useful for ensuring that your PySpark script works correctly on different versions of Python and Spark.
Additionally, you can add Spark unit tests and run them via Github Actions to ensure that all tests pass before merging PRs.

That's it. You can find all code in my repo: <https://github.com/duyet/spark-in-github-actions>

# References

- [duyet/spark-in-github-actions](https://github.com/duyet/spark-in-github-actions)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Github Actions matrix strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

[matrix strategy]: https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs
[`spark-submit.yaml`]: https://github.com/duyet/spark-in-github-actions/blob/master/.github/workflows/spark-submit.yaml
