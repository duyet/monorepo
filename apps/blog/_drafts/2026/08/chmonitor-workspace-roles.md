---
title: More ways to customize the chmonitor dashboard
date: 2026-08-19
author: Duyet
category: ClickHouse
tags:
  - ClickHouse
  - chmonitor
  - Dashboard
slug: /2026/08/chmonitor-workspace-roles
thumbnail: /media/2026/08/chmonitor-workspace-roles/nav-roles.png
description: "Workspace roles, hide/pin, and a new Tools menu so a DBA, SRE, and engineer do not have to share the same sidebar."
---

I got tired of one sidebar for every job. A DBA lives in tables, merges, and replication. An SRE wants health, disks, and running queries. An engineer wants SQL and insights. Same product, different noise.

So the dashboard now has workspace roles, in-place hide, pins, and a Tools group. All of it is local to this browser: Settings → Workspace → Navigation.

## Five ways to shape the sidebar

### 1. Pick a role

Full, DBA, Engineer, SRE, or Custom.

- **Full** — every page the host already allows. New pages stay visible.
- **DBA** — tables, queries, SQL tools, merges, replication, disks, cluster, keeper, security.
- **SRE** — overview, health, insights, SQL tools, replication, disks, errors, running queries.
- **Engineer** — overview, SQL/explorer, queries, insights. Less keeper, security, and ops.
- **Custom** — start from a role, then hide the extra pages. The tab only flips to Custom when you Hide or Show a leaf. Collapsing a parent does not count.

![Workspace roles in Settings → Navigation](/media/2026/08/chmonitor-workspace-roles/nav-roles.png)

Selecting a role leaves groups collapsed (Queries, Tables, Merges) so you can scan the tree. Expand only what you care about.

### 2. Hide a page in Settings

Same Navigation tree. Each leaf has Hide / Show. Hidden rows go dim. Search if the list is long. Footer About stays put — it is not hideable.

Restore is always Settings → Workspace → Navigation.

### 3. Hide from the sidebar

You do not have to open Settings first. Hover a leaf, click Hide next to Pin. The item disappears. A toast says where to get it back, with Undo and Open Navigation.

### 4. Pin and reorder

Favorites stay at the top. Drag to reorder. Pin is the same hover row as Hide.

### 5. Theme, units, layout

The rest of Settings is still local: appearance, units, layout. That is chrome, not the information architecture. The role + hide list is what changes which pages you see.

## The new Tools menu

Interactive utilities were scattered under Tables, Queries, Operations, and System. They now sit in **Tools**, last in MAIN (after PeerDB, before Others):

- SQL Console
- Data Explorer
- Explain
- Advisor (recommend only — it never applies DDL)
- Chart Builder
- Schema Compare
- Settings Diff

![Tools group at the bottom of MAIN](/media/2026/08/chmonitor-workspace-roles/tools-sidebar.png)

AI Agent stays its own top-level group. Postgres hosts do not see Tools (ClickHouse-family only).

Schema Compare and Settings Diff are the two I use when something drifted between nodes. One-host empty states and node-vs-node compare are still being tightened.

## What I did not do

- No second hide store. In-sidebar hide writes the same `hiddenMenuHrefs` as Settings.
- Advisor does not auto-run DDL. Copy the plan.
- [dash.chmonitor.dev](https://dash.chmonitor.dev) is the public demo, not your homelab.

Try it on [dash.chmonitor.dev](https://dash.chmonitor.dev) or your own image (`ghcr.io/chmonitor/chmonitor`). Docs: [docs.chmonitor.dev](https://docs.chmonitor.dev).
