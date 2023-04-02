---
template: post
title: "grant-rs: Manage Redshift/Postgres Privileges GitOps Style"
date: "2022-02-24"
author: Van-Duyet Le
category: Data
tags:
  - Rust
  - Redshift
  - Data Engineer
slug: /2022/02/grant-redshift-gitops.html
thumbnail: https://i.imgur.com/ooGg2k5.png
draft: false
fbCommentUrl: none
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2022%2F02%2Fgrant-redshift-gitops.html
description: The grant project aims to manage Postgres and Redshift database roles and privileges in GitOps style. Grant is the culmination of my learning of Rust for data engineering tools. 

---

# **What is GitOps?**

According [Gitlab](https://about.gitlab.com/topics/gitops/), GitOps is an operational framework that takes DevOps best practices used for application development such as version control, collaboration, compliance, and CI/CD, and applies them to infrastructure automation.

GitOps requires the system's desired state to be stored in version control such that anyone can view the entire audit trail of changes.

Mostly data engineers have to deal with different workflows. Like most DevOps, GitOps workflows help my Data Engineering team manage most Cloud infrastructure and configuration. We manage Kafka topics, and Kafka connects via YAML configuration; manage Kubernetes deployments via FluxCD specs. Everything happens automatically via git merge.

# grant-rs

[The grant](https://github.com/duyet/grant-rs) project aims to manage Postgres and Redshift database roles and privileges in GitOps style. Grant is the culmination of my learning of Rust for data engineering tools.

Currently, grant will help you manage the list of users, their passwords, and manage access to the database, schema, tables, and functions. The benefits of grants will be obvious if you have hundreds or thousands of schemas and tables to manage.

Everything will be managed visually through YAML files in a Git repo. Any changes will be saved through Git's version management system, making it easy to view history and rollback. Management will also be more accessible because you can easily change, grant and remove access through Git pull requests.


![](https://i.imgur.com/ooGg2k5.png)


## Cli Installation

You can install the `grant` cli via Rust cargo:

```bash
$ cargo install grant
```

or Homebrew:

```bash
$ brew tap duyet/tap
$ brew install grant
```

## Usage

You can find the most information about usage at Github project page https://github.com/duyet/grant-rs

To use the `grant` cli tool on your local machine:

```bash
$ grant --help

grant 0.0.1-beta.3
Manage database roles and privileges in GitOps style

USAGE:
    grant <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

SUBCOMMANDS:
    apply       Apply a configuration to a redshift by file name. Yaml format are accepted
    gen         Generate sample configuration file
    gen-pass    Generate random password
    help        Prints this message or the help of the given subcommand(s)
    inspect     Inspect current database cluster with connection info from configuration file
    validate    Validate a configuration file or a target directory that contains configuration files
```

## ****Generate new project structure****

This will generate the new Postgres/Redshift IaC managed by `grant`. You can make it in anyway.

```bash
$ grant gen --target ./<database name>
```

For example, because there are many databases to manage, I will structure my Git repo like this:

```bash
$ grant gen --target ./db_stg
# Creating path: "./db_stg"
# Generated: "./db_stg/config.yml"

$ grant gen --target ./db_prod 
# Creating path: "./db_prod"
# Generated: "./db_prod/config.yml"

$ tree .
.
├── db_prd
│   └── config.yml
└── db_stg
    └── config.yml
```

Let see the structure of yaml files:

```bash
$ cat db_prd/config.yaml
---
connection:
  type: postgres
  url: "postgres://postgres:postgres@localhost:5432/postgres"
roles: []
users: []
```

There are three parts:

### `connection`

This is the root connection string, and need to have the admin privileges to create/update other users and manage their permissions. The `url` also support env variables to securing the password, for example, `postgres://postgres:${DB_PASSWORD}@localhost:5432/postgres`

### `roles[]`

`roles[]` will contains the list of roles, each role will have

- `name` the virtual role name
- `grants[]` list of grant statement for the role type.
- `type` the role type level, the `type` should be `database`, `schema` or `table`

Let see the example below

```yaml
roles:
  - name: role_database_level
    type: database
    grants:
      - CREATE
      - TEMP
    databases:
      - postgres

  - name: role_schema_level
    type: schema
    grants:
      - CREATE
    databases:
      - postgres
    schemas:
      - public
  - name: role_all_schema
    type: table
    grants:
      - SELECT
      - INSERT
      - UPDATE
    databases:
      - postgres
    schemas:
      - public
    tables:
      - ALL # include all table
      - +public_table # can add `+` to mark included tables (public.public_table)
      - -secret_table # add `-` to exclude this table (public.secret_table)
      - -schema2.table # exclude schema2.table
```

### `users[]`

The list of users and associate roles. Each user may contain a password which is in plaintext or hashed by `grant gen-pass` 

```bash
$ grant gen-pass -u duyet
Generated password: z25bZbH8gNu8IQOFQ2AV8iVn(CwLP0Bs
Generated MD5 (user: duyet): md58c3f16b4d7f5908d22b975af5d1e04d1

Hint: https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_USER.html
```

Suppose the `update_password` flag is available and turns to true. In that case, the user password will be updated to `password` if the account is already existing in the database.

```yaml
users:
  - name: duyet
    password: ahihi123456 # password in plaintext
    roles:
      - role_database_level
      - role_all_schema
      - role_schema_level
  - name: duyet2
    password: md58c3f16b4d7f5908d22b975af5d1e04d1 # support md5 style: grant gen-pass -u duyet2
    update_password: true
		roles:
      - role_database_level
      - role_all_schema
      - role_schema_level
```

## Apply configuration to cluster

Final, to apply all these configurations to the cluster, using the `grant apply`

```bash
$ grant apply -f ./db_prd/config.yaml

[2021-12-06T14:37:03Z INFO  grant::connection] Connected to database: postgres://postgres@localhost:5432/postgres
[2021-12-06T14:37:03Z INFO  grant::apply] Summary:
    ┌────────────┬────────────────────────────┐
    │ User       │ Action                     │
    │ ---        │ ---                        │
    │ duyet      │ no action (already exists) │
    │ duyet2     │ no action (already exists) │
    └────────────┴────────────────────────────┘
[2021-12-12T13:48:22Z INFO  grant::apply] Success: GRANT CREATE, TEMP ON DATABASE postgres TO duyet;
[2021-12-12T13:48:22Z INFO  grant::apply] Success: GRANT CREATE ON SCHEMA public TO duyet;
[2021-12-12T13:48:22Z INFO  grant::apply] Success: GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO duyet;
[2021-12-12T13:48:22Z INFO  grant::apply] Success: GRANT CREATE, TEMP ON DATABASE postgres TO duyet2;
[2021-12-12T13:48:22Z INFO  grant::apply] Success: GRANT CREATE ON SCHEMA public TO duyet2;
[2021-12-12T13:48:22Z INFO  grant::apply] Success: GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO duyet2;
[2021-12-12T13:48:22Z INFO  grant::apply] Summary:
    ┌────────┬─────────────────────┬──────────────────────┬─────────┐
    │ User   │ Role Name           │ Detail               │ Status  │
    │ ---    │ ---                 │ ---                  │ ---     │
    │ duyet  │ role_database_level │ database["postgres"] │ updated │
    │ duyet  │ role_schema_level   │ schema["public"]     │ updated │
    │ duyet  │ role_table_level    │ table["ALL"]         │ updated │
    │ duyet2 │ role_database_level │ database["postgres"] │ updated │
    │ duyet2 │ role_schema_level   │ schema["public"]     │ updated │
    │ duyet2 │ role_table_level    │ table["ALL"]         │ updated │
    └────────┴─────────────────────┴──────────────────────┴─────────┘
```

## Generate random password

Grant can help to generate a new random password

```bash
$ grant gen-pass
# Generated password: #vuFUc&Gcn83qVebrR&p)yWqllz*hKo3

$ grant gen-pass --length 10
# Generated password: MZE3ciFvlY

$ grant gen-pass --no-special
# Generated password: sWEtH8goI9DMbbJsgwKeflnjOwKDZ5HC

$ grant gen-pass --no-special --username duyet
# Generated password: qJyi4LhqqDvHxTs3bQbKIzAi9cW1ka2l
# Generated MD5 (user: duyet): md5cc1856d93686016731d8816ced4c6661
```

## Apply to CI/CD

`grant` support `--dryrun` apply mode. You can run the grant dry run on pull requests for reviewing and without it on PRs merged. 

```bash
# on pull requests
$ grant apply -f ./ --dryrun

# on pull request merged
$ grant apply -f ./
```

# Summary & references

This project is still in the early stages of development, you can find the checklist and public roadmap on the Github Repo page. I greatly appreciate if you have any ideas or make a PR to this project.

References:

- [https://about.gitlab.com/topics/gitops/](https://about.gitlab.com/topics/gitops/)
- [https://github.com/duyet/grant-rs](https://github.com/duyet/grant-rs)
