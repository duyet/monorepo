---
title: Why does Helm Charts interpret 0777 as 511?
date: '2023-04-15'
author: Duyet
category: Data
tags:
  - Kubernetes
slug: /2023/04/helm-charts-problem.html
thumbnail: https://i.imgur.com/HhcwrAw.png
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2023%2F04%2Fhelm-charts-problem.html
description: Why does Helm Charts interpret 0777 to 511? It took me quite some time to debug it.
---

It took me quite some time to debug it.

In my `values.yaml` file, I had a variable called `customScriptDefaultMode`, which was set to `0777`.

File: values.yaml

```yaml
customScriptDefaultMode: 0777
customScripts:
	hello.sh: |
		#!/bin/bash
		echo hello world
```

Then, in my templates, I tried to use that value for the defaultMode of a volume. Here's the code:

File: templates/deployment.yaml

```tpl
{{- if .Values.customScripts }}
- name: custom-scripts
  configMap:
    name: {{ include "airflow.fullname" . }}-custom-scripts
    defaultMode: {{ .Values.customScriptDefaultMode }}
{{- end }}
```

When I ran `helm template .` to render the template, I expected to see `0777`. However, what I got was `511`. Here's the relevant part of the output:

```yaml
---
volumes:
  - name: airflow-config
    configMap:
      name: airflow
  - name: custom-scripts
    configMap:
      name: airflow-custom-scripts
      defaultMode: 511
```

My expectation was:

```yaml
---
volumes:
  - name: airflow-config
    configMap:
      name: airflow
  - name: custom-scripts
    configMap:
      name: airflow-custom-scripts
      defaultMode: 0777
```

Naturally, I was confused and frustrated. I searched the internet for an explanation and found a [Stack Overflow post](https://stackoverflow.com/questions/33168329/why-does-yaml-interpret-0777-as-511) that shed some light on the issue. According to one of the answers, if an argument is a string and starts with `"0x"`, `"0b"`, or `"0"`, it is interpreted as a hexadecimal, binary, or octal string, respectively.

So, in my case, `"0777"` is being treated as an **octal string**. And since `"0777"` in **octal** is equivalent to `"511"` in **decimal**, that's what we get.

But here's the catch: if we put `0777` in **single quotes** (`'0777'`), it will be treated as a **string**, not a number. And that can cause issues because the `defaultMode` in Kubernetes specs must be a **number**.

```
ValidationError(Deployment.spec.template.spec.volumes[1].configMap.defaultMode): invalid type for io.k8s.api.core.v1.ConfigMapVolumeSource.defaultMode: got "string", expected "integer"
```

So, the correct way to set the `defaultMode` in Helm templates is to use double quotes (`"0777"`). This way, it will be treated as a **number**, not a string 🤯.

```yaml
# Wrong 🛑
customScriptDefaultMode: 0777
# Wrong 🛑
customScriptDefaultMode: '0777'
# Correct ✅
customScriptDefaultMode: "0777"
```

## References

- [https://stackoverflow.com/a/33168435](https://stackoverflow.com/a/33168435)
- [Template Function List > toDecimal](https://helm.sh/docs/chart_template_guide/function_list/#todecimal)
