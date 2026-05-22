import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  type LangChainMessage,
  unstable_createLangGraphStream,
  useLangGraphRuntime,
} from "@assistant-ui/react-langgraph";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import { createClient } from "@/lib/chatApi";

export const Route = createFileRoute("/")({
  component: AssistantPage,
});

const ASSISTANT_ID = "agent";

function AssistantPage() {
  const client = useMemo(() => createClient(), []);
  const stream = useMemo(
    () =>
      unstable_createLangGraphStream({
        client,
        assistantId: ASSISTANT_ID,
      }),
    [client]
  );

  const runtime = useLangGraphRuntime({
    unstable_allowCancellation: true,
    stream,
    create: async () => {
      const { thread_id } = await client.threads.create();
      return { externalId: thread_id };
    },
    load: async (externalId) => {
      const state = await client.threads.getState<{
        messages: LangChainMessage[];
      }>(externalId);
      return {
        messages: state.values.messages || [],
        interrupts: state.tasks?.[0]?.interrupts || [],
      };
    },
  });

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          duyetbot
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your personal, stateful engineering assistant.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-[600px] overflow-hidden flex flex-col">
        <AssistantRuntimeProvider runtime={runtime}>
          <Thread />
        </AssistantRuntimeProvider>
      </div>
    </div>
  );
}
