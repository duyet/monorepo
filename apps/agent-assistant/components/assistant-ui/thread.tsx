import { AuiIf, ThreadPrimitive, useAuiState } from "@assistant-ui/react";
import { ArrowDownIcon } from "lucide-react";
import type { FC } from "react";
import { Composer, EditComposer } from "./thread-composer";
import { AssistantMessage, UserMessage } from "./thread-messages";
import { ThreadWelcome } from "./thread-welcome";
import { TooltipIconButton } from "./tooltip-icon-button";

/**
 * The thread shell: the scrollable viewport, the welcome-or-messages choice,
 * and the pinned composer footer.
 *
 * The three concerns that used to live alongside it — the welcome state, the
 * composer, and the message renderers — are in `thread-welcome.tsx`,
 * `thread-composer.tsx` and `thread-messages.tsx`. `thread.render.test.tsx`
 * holds the goldens that make that split provable; it renders both branches,
 * an empty thread and a populated one, because a change that only shows up in
 * one of them is not guarded.
 */
export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
      style={{
        ["--thread-max-width" as string]: "44rem",
        ["--composer-radius" as string]: "24px",
        ["--composer-padding" as string]: "10px",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        data-slot="aui_thread-viewport"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth"
      >
        <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-16 md:pt-14">
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <ThreadWelcome />
          </AuiIf>

          <div
            data-slot="aui_message-group"
            className="mb-10 flex flex-col gap-y-8 empty:hidden"
          >
            <ThreadPrimitive.Messages>
              {() => <ThreadMessage />}
            </ThreadPrimitive.Messages>
          </div>

          <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mt-auto flex flex-col gap-4 overflow-visible rounded-t-(--composer-radius) bg-background pb-4 md:pb-6">
            <ThreadScrollToBottom />
            <Composer />
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

/**
 * Routes a message to its renderer.
 *
 * The order matters: `isEditing` wins over the role, so a user message being
 * edited shows the inline composer rather than the rendered turn. Swapping the
 * two checks would make the edit state unreachable in the UI while still
 * compiling — and neither golden below catches it, because reaching the edit
 * state needs a click.
 */
const ThreadMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);

  if (isEditing) return <EditComposer />;
  if (role === "user") return <UserMessage />;
  return <AssistantMessage />;
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 right-4 z-10 rounded-full p-2 border border-[color:var(--hairline)] bg-[color:var(--background)] text-[color:var(--muted-foreground)] transition-[transform,opacity,color] duration-150 ease-out hover:text-[color:var(--foreground)] disabled:invisible disabled:scale-90 disabled:opacity-0"
      >
        <ArrowDownIcon className="size-4" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};
