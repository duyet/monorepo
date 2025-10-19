---
description: Creates a GPG/SSH signed git commit.
argument-hint: [commit message]
allowed-tools: Bash(git commit:*)
---
!git commit -S -m "$ARGUMENTS"
