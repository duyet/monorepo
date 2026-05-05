# Pattern Decision

We keep pattern behavior composable and lightweight in v1:

- Sequential (default)
- Routing
- Parallel
- Orchestrator
- Evaluator

`detectPattern()` classifies user intent and injects a matching system hint into the model turn.
This aligns with Anthropic pattern guidance while keeping runtime overhead low.
