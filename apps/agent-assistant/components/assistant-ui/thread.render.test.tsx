// @vitest-environment happy-dom
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ThreadMessage } from "@assistant-ui/react";
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Thread } from "./thread";

/**
 * Golden-render guard for the thread.
 *
 * The thread is 14 components assembled from `@assistant-ui/react` primitives,
 * and until now nothing rendered it. Without a rendering proof the only way to
 * restructure it was to eyeball the result, which is why it stayed at 558 lines
 * holding four unrelated concerns.
 *
 * The goldens are committed HTML, not vitest inline snapshots, for two reasons:
 * they are reviewable in a diff (an inline snapshot is a JS string, so a
 * one-character class change shows up as one unreadable line), and they can be
 * regenerated with `UPDATE_GOLDEN=1 pnpm -C apps/agent-assistant test`.
 *
 * **This proves the component tree, not the data path.** The messages come from
 * `useExternalStoreRuntime` with hand-written fixtures, while the real app
 * drives the thread from a LangGraph adapter. So this guards the rendering
 * decisions — class names, structure, which `AuiIf` branch is chosen, the
 * order of the parts — and not the adapter.
 *
 * A golden only guards what it covers, so the two cases below are the two
 * distinct render paths: an empty thread takes the `AuiIf` branch that shows
 * the welcome and its suggestions, and a populated one does not. Adding a third
 * state is worth a third golden; a change that only shows up in a state not
 * listed here is not guarded.
 */

const goldenDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "__snapshots__",
  "thread-render"
);

/**
 * Fixed timestamps, not `new Date()`.
 *
 * Nothing in the thread's markup reads a timestamp today, but `createdAt` is a
 * required field and a live clock would make the golden fail the first time the
 * time of day crossed a minute boundary.
 */
const at = (s: number) => new Date(`2026-09-29T00:00:0${s}Z`);

/** A user turn, plus the assistant turn that answers it. */
function conversation(): ThreadMessage[] {
  return [
    {
      id: "m1",
      role: "user",
      createdAt: at(0),
      content: [{ type: "text", text: "refactor the thread" }],
      attachments: [],
      metadata: { custom: {} },
    },
    {
      id: "m2",
      role: "assistant",
      createdAt: at(1),
      content: [{ type: "text", text: "done" }],
      status: { type: "complete", reason: "stop" },
      metadata: {
        unstable_state: null,
        unstable_annotations: [],
        unstable_data: [],
        steps: [],
        custom: {},
      },
    },
  ];
}

const SUGGESTIONS = [
  { prompt: "Refactor the analytics queries" },
  { prompt: "Audit the release notes" },
  { prompt: "Explore the deploy pipeline" },
  { prompt: "Document the public API" },
  // No keyword match in `getSuggestionIcon`, so it takes the Sparkle default.
  // Keeps that fallback from going unrendered.
  { prompt: "Anything else" },
];

function renderThread(messages: ThreadMessage[], suggestions: SUGGESTION[]) {
  function Harness() {
    const runtime = useExternalStoreRuntime({
      messages,
      suggestions,
      // Required by `ExternalStoreAdapterBase`, and the one callback a render
      // golden cannot exercise: sending needs a real backend. Recording the
      // attempts would be dead weight until a test asserts on it.
      onNew: async () => {},
    });
    return (
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
      </AssistantRuntimeProvider>
    );
  }
  return render(<Harness />).container.innerHTML;
}

type SUGGESTION = { prompt: string };

/**
 * Compare against the committed golden, or rewrite it under `UPDATE_GOLDEN=1`.
 *
 * The rewrite is a full file write, not an append: a golden that only grows
 * accumulates the output of a bug that once ran and no longer reproduces.
 */
function expectGolden(name: string, html: string) {
  const path = join(goldenDir, `${name}.html`);
  if (process.env.UPDATE_GOLDEN === "1") {
    mkdirSync(goldenDir, { recursive: true });
    writeFileSync(path, html);
    return;
  }
  expect(html, "run with UPDATE_GOLDEN=1 to re-record").toBe(
    readFileSync(path, "utf8")
  );
}

describe("thread golden render", () => {
  it("empty thread shows the welcome and its suggestions", () => {
    expectGolden("empty", renderThread([], SUGGESTIONS));
  });

  it("populated thread shows the messages and hides the welcome", () => {
    expectGolden("conversation", renderThread(conversation(), []));
  });
});
