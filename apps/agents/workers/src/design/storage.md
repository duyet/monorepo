# Storage Decision

- Live conversation runtime state is held in `ChatAgent` Durable Object state.
- Mirror durable history and metadata in D1 tables: conversations, messages, tool_calls, approvals, sessions.
- On each completed turn, user/assistant messages are persisted to D1.
- Session map (`sessions`) supports user-to-session lookup and reconnect scenarios.
