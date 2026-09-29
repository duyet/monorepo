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

function renderThread(
  messages: ThreadMessage[],
  suggestions: SUGGESTION[],
  isRunning?: boolean
) {
  function Harness() {
    const runtime = useExternalStoreRuntime({
      messages,
      suggestions,
      isRunning,
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
 * Replace the one thing in the markup that is genuinely random.
 *
 * While a thread is running, the runtime mounts a placeholder assistant message
 * with a **randomly generated id** — `y2n6Cls` on one run, `EFuVGnJ` on the
 * next. Nothing else in the output varies: three consecutive renders of the
 * running fixture differ on that attribute and nothing else, 6 characters wide.
 *
 * So the normalisation is deliberately narrow rather than a general scrub: it
 * only touches `data-message-id` values that are *not* ids this file supplied.
 * A general "replace anything that looks random" pass would also hide a real
 * change — a message losing its id, or a new random-looking attribute — which
 * is the failure mode that makes people distrust golden files and then delete
 * them.
 */
function normalise(html: string, knownIds: readonly string[]): string {
  const known = new Set(knownIds);
  return html.replace(/data-message-id="([^"]*)"/g, (match, id: string) =>
    known.has(id) ? match : 'data-message-id="<generated>"'
  );
}

/**
 * Compare against the committed golden, or rewrite it under `UPDATE_GOLDEN=1`.
 *
 * The rewrite is a full file write, not an append: a golden that only grows
 * accumulates the output of a bug that once ran and no longer reproduces.
 */
function expectGolden(
  name: string,
  html: string,
  knownIds: readonly string[] = []
) {
  const path = join(goldenDir, `${name}.html`);
  const actual = normalise(html, knownIds);
  if (process.env.UPDATE_GOLDEN === "1") {
    mkdirSync(goldenDir, { recursive: true });
    writeFileSync(path, actual);
    return;
  }
  expect(actual, "run with UPDATE_GOLDEN=1 to re-record").toBe(
    readFileSync(path, "utf8")
  );
}

describe("thread golden render", () => {
  it("empty thread shows the welcome and its suggestions", () => {
    expectGolden("empty", renderThread([], SUGGESTIONS));
  });

  it("populated thread shows the messages and hides the welcome", () => {
    expectGolden("conversation", renderThread(conversation(), []), [
      "m1",
      "m2",
    ]);
  });

  it("running thread swaps send for cancel", () => {
    // `isRunning` on the adapter is not enough on its own: the runtime ANDs it
    // with `lastMessage.role !== "assistant"`
    // (`_getEffectiveIsRunning` in external-store-thread-runtime-core.ts). Set
    // it on a thread whose last turn *is* an assistant message and the flag is
    // silently ignored, which is what made the first attempt at this fixture
    // render the idle composer and match the `conversation` golden exactly.
    //
    // A trailing user message with no reply is the shape that actually reaches
    // the running state, and it is the only way to cover the send/cancel swap
    // — `!s.thread.isRunning` and `s.thread.isRunning` both agree on every other
    // fixture, so mutating either one there changes nothing.
    expectGolden("running", renderThread([conversation()[0]], [], true), [
      "m1",
    ]);
  });
});

/**
 * What these goldens do not reach, recorded so a later reader does not assume
 * the whole thread is covered.
 *
 * Both gaps need an interaction, and driving them would mean reaching past the
 * public API:
 *
 * - **`EditComposer`.** `s.message.composer.isEditing` is set by `beginEdit`,
 *   which is on `ThreadRuntimeCore`, not on the public `ThreadRuntime`. A
 *   swapped order in `ThreadMessage`'s dispatch — the edit state losing to the
 *   role check — compiles, leaves no trace in the DOM, and is not caught.
 * - **The copied state of the assistant action bar.** `s.message.isCopied` only
 *   flips after a successful `ActionBarPrimitive.Copy` click.
 *
 * A third gap is narrower: the fixtures carry no branched message, so
 * `BranchPicker`'s `hideWhenSingleBranch` is only ever exercised in the state
 * where it renders nothing. Removing the prop is caught; changing what it
 * renders when a branch does exist is not.
 */
