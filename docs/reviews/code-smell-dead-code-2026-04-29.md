# Code Smell & Dead Code Review - 2026-04-29

Scope: recent changes in `duyet/monorepo` since the previous automation run at `2026-04-27T21:03:15Z`.

Recently changed files:

- `.github/workflows/data-sync-llm-timeline.yml`

## Findings Fixed

### Warning: repeated generated PR metadata in workflow shell

- File: `.github/workflows/data-sync-llm-timeline.yml:62`
- File: `.github/workflows/data-sync-llm-timeline.yml:71`
- File: `.github/workflows/data-sync-llm-timeline.yml:77`
- Finding: the LLM Timeline sync PR title was repeated in the commit message, existing-PR edit path, and new-PR create path. The PR body was also repeated across the edit and create paths. That makes future wording updates easy to apply inconsistently.
- Fix: moved the generated PR title and body into local shell variables and reused them in the commit, edit, and create commands.
- Confidence: confident.

## Dead Code Notes

No dead-code removals were made. The only post-run changed file is a GitHub Actions workflow, and no unused functions, variables, imports, or non-test code declarations were introduced there.

Search evidence:

- `git log --since='2026-04-27T21:03:15Z' --name-only` found only `.github/workflows/data-sync-llm-timeline.yml` after the last run.
- `rg -n "chore\\(llm-timeline\\): sync model data from Google Sheets \\+ Epoch AI|Automated LLM Timeline data sync from Google Sheets and Epoch AI" .github/workflows/data-sync-llm-timeline.yml` found five repeated metadata literals before the fix.
