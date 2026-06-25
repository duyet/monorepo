# agentOS Pi Example

A minimal end-to-end example using [agentOS](https://agentos-sdk.dev/) (`@rivet-dev/agentos-core`) with the Pi coding agent.

## What it does

1. Boots a lightweight agentOS VM (~6 ms cold start) with `Pi` + `common` software
2. Creates a Pi agent session
3. Sends a prompt: _"Write a hello world script to /home/agentos/hello.js"_
4. Streams all session events (tool calls, messages, etc.)
5. Reads back the file the agent created
6. Closes the session and disposes the VM

## Run

```bash
npm install
ANTHROPIC_API_KEY=sk-... node index.mjs
```

## Key concepts

| Concept | Description |
|---|---|
| `AgentOs.create()` | Boots a VM in-process — no containers, no cold starts |
| `vm.createSession("pi")` | Starts a Pi coding agent session |
| `vm.onSessionEvent()` | Streams real-time events (tool calls, text, errors) |
| `vm.prompt()` | Sends a prompt and waits for the agent to complete |
| `vm.readFile()` | Reads a file from the VM's isolated filesystem |
| `vm.dispose()` | Tears down the VM and frees memory |

## Links

- [agentOS docs](https://agentos-sdk.dev/docs)
- [Pi agent docs](https://agentos-sdk.dev/docs/agents/pi)
- [Quickstart](https://agentos-sdk.dev/docs/quickstart)
- [GitHub](https://github.com/rivet-dev/agent-os)
- [Discord](https://rivet.dev/discord)
