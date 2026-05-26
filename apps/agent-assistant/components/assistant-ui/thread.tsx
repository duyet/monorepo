import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  getMcpAppFromToolPart,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import {
  CaretDown,
  Code,
  Compass,
  Cpu,
  FileText,
  PaperPlaneTilt,
  Sparkle,
} from "@phosphor-icons/react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react";
import { type FC, useState } from "react";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import {
  ToolGroupContent,
  ToolGroupRoot,
  ToolGroupTrigger,
} from "@/components/assistant-ui/tool-group";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const getSuggestionIcon = (title: string) => {
  const t = title.toLowerCase();
  if (
    t.includes("code") ||
    t.includes("refactor") ||
    t.includes("write") ||
    t.includes("lint")
  ) {
    return <Code className="size-4 text-[color:var(--accent)]" />;
  }
  if (
    t.includes("audit") ||
    t.includes("explain") ||
    t.includes("readme") ||
    t.includes("document")
  ) {
    return <FileText className="size-4 text-[color:var(--accent)]" />;
  }
  if (t.includes("explore") || t.includes("search") || t.includes("find")) {
    return <Compass className="size-4 text-[color:var(--accent)]" />;
  }
  return <Sparkle className="size-4 text-[color:var(--accent)]" />;
};

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root flex flex-col justify-center items-start py-12 md:py-16 px-4 md:px-6 max-w-xl mx-auto w-full">
      <header className="fade-slide-up flex flex-col items-start text-left">
        <div className="text-[10px] uppercase tracking-widest font-mono text-[color:var(--accent)] mb-2 font-semibold">
          duyetbot v2
        </div>
        <h1
          className="font-serif text-4xl md:text-5xl tracking-tight text-[color:var(--foreground)] font-light leading-none"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Hello, Duyet.
        </h1>
        <p className="mt-3.5 text-xs text-[color:var(--muted-foreground)] max-w-md leading-relaxed font-sans">
          Your stateful personal engineering companion. Run codebase audits,
          sync metrics, and debug workflows in a clean, quiet, high-performance
          sandbox.
        </p>
      </header>

      <div className="w-full mt-10">
        <h2 className="text-[9px] uppercase tracking-wider font-mono text-[color:var(--muted-foreground)] mb-3 font-semibold">
          Suggested Actions
        </h2>
        <ThreadSuggestions />
      </div>
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions flex flex-col sm:flex-row sm:flex-wrap gap-3 pb-4 w-full">
      <ThreadPrimitive.Suggestions>
        {() => <ThreadSuggestionItem />}
      </ThreadPrimitive.Suggestions>
    </div>
  );
};

const ThreadSuggestionItem: FC = () => {
  const [title, setTitle] = useState("");
  return (
    <div className="aui-thread-welcome-suggestion-display fade-slide-up w-full sm:w-[calc(50%-0.375rem)]">
      <SuggestionPrimitive.Trigger send asChild>
        <button
          type="button"
          className="w-full text-left p-3.5 rounded-lg border border-[color:var(--hairline)] bg-[color:var(--background)] hover:border-[color:var(--accent)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col gap-2 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {getSuggestionIcon(title)}
            <SuggestionPrimitive.Title
              className="font-sans font-medium text-xs text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors"
              ref={(el) => {
                if (el?.textContent && el.textContent !== title) {
                  setTitle(el.textContent);
                }
              }}
            />
          </div>
          <SuggestionPrimitive.Description className="font-sans text-[10px] text-[color:var(--muted-foreground)] leading-snug empty:hidden line-clamp-2" />
        </button>
      </SuggestionPrimitive.Trigger>
    </div>
  );
};

const Composer: FC = () => {
  const [model, setModel] = useState("Claude 3.5 Sonnet");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const models = [
    { name: "Claude 3.5 Sonnet", desc: "Most intelligent model" },
    { name: "Gemini 1.5 Pro", desc: "Large context window" },
    { name: "GPT-4o", desc: "Fast & versatile" },
  ];

  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col pt-3 bg-transparent">
      <ComposerPrimitive.AttachmentDropzone asChild>
        <div
          data-slot="aui_composer-shell"
          className="flex w-full flex-col gap-2.5 p-3.5 bg-[color:var(--card)] border border-[color:var(--hairline)] rounded-xl transition-shadow focus-within:border-[color:var(--accent)]"
        >
          <ComposerAttachments />
          <ComposerPrimitive.Input
            placeholder="Message duyetbot…"
            className="aui-composer-input min-h-[4rem] w-full resize-none bg-transparent px-1.5 py-1 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted-foreground)] focus:placeholder:opacity-60"
            rows={1}
            autoFocus
            aria-label="Message input"
          />

          <div className="flex items-center justify-between border-t border-[color:var(--hairline)] pt-3 mt-1">
            {/* Model Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--faint)] transition-colors cursor-pointer"
              >
                <Cpu className="size-3.5 text-[color:var(--accent)]" />
                <span>{model}</span>
                <CaretDown className="size-3" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-1 z-40 w-48 rounded-lg border border-[color:var(--hairline)] bg-[color:var(--popover)] p-1 text-[11px]">
                    {models.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => {
                          setModel(m.name);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-md hover:bg-[color:var(--faint)] text-[color:var(--foreground)] transition-colors cursor-pointer flex flex-col"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="text-[9px] text-[color:var(--muted-foreground)]">
                          {m.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <ComposerAction />
          </div>
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative flex items-center gap-2">
      <ComposerAddAttachment />

      <AuiIf condition={(s) => !s.thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <button
            type="submit"
            className="aui-composer-send size-8 rounded-lg bg-[color:var(--accent)] text-white hover:opacity-95 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_2px_4px_rgba(204,120,92,0.2)]"
            aria-label="Send message"
          >
            <PaperPlaneTilt className="size-4 weight-fill" />
          </button>
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <button
            type="button"
            className="aui-composer-cancel size-8 rounded-lg bg-[color:var(--foreground)] text-[color:var(--background)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Stop generating"
          >
            <SquareIcon className="size-3 fill-current" />
          </button>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  // reserves space for action bar and compensates with `-mb` for consistent msg spacing
  // keeps hovered action bar from shifting layout (autohide doesn't support absolute positioning well)
  // for pt-[n] use -mb-[n + 6] & min-h-[n + 6] to preserve compensation
  const ACTION_BAR_PT = "pt-1.5";
  const ACTION_BAR_HEIGHT = `-mb-7.5 min-h-7.5 ${ACTION_BAR_PT}`;

  return (
    <MessagePrimitive.Root
      data-slot="aui_assistant-message-root"
      data-role="assistant"
      className="fade-in slide-in-from-bottom-1 relative animate-in duration-150 [contain-intrinsic-size:auto_300px] [content-visibility:auto]"
    >
      <div
        data-slot="aui_assistant-message-content"
        className="wrap-break-word px-2 text-foreground leading-relaxed"
      >
        <MessagePrimitive.GroupedParts
          groupBy={(part) => {
            if (part.type === "reasoning")
              return ["group-chainOfThought", "group-reasoning"];
            if (part.type === "tool-call") {
              if (getMcpAppFromToolPart(part)) return null;
              return ["group-chainOfThought", "group-tool"];
            }
            return null;
          }}
        >
          {({ part, children }) => {
            switch (part.type) {
              case "group-chainOfThought":
                return <div data-slot="aui_chain-of-thought">{children}</div>;
              case "group-reasoning": {
                const running = part.status.type === "running";
                return (
                  <ReasoningRoot defaultOpen={running}>
                    <ReasoningTrigger active={running} />
                    <ReasoningContent aria-busy={running}>
                      <ReasoningText>{children}</ReasoningText>
                    </ReasoningContent>
                  </ReasoningRoot>
                );
              }
              case "group-tool":
                return (
                  <ToolGroupRoot>
                    <ToolGroupTrigger
                      count={part.indices.length}
                      active={part.status.type === "running"}
                    />
                    <ToolGroupContent>{children}</ToolGroupContent>
                  </ToolGroupRoot>
                );
              case "text":
                return <MarkdownText />;
              case "reasoning":
                return <Reasoning {...part} />;
              case "tool-call":
                return part.toolUI ?? <ToolFallback {...part} />;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <MessageError />
      </div>

      <div
        data-slot="aui_assistant-message-footer"
        className={cn("ms-2 flex items-center", ACTION_BAR_HEIGHT)}
      >
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ms-1 flex gap-0.5 text-[color:var(--muted-foreground)]"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton
          tooltip="Copy"
          className="rounded-md transition-colors hover:bg-[color:var(--faint)] hover:text-[color:var(--foreground)]"
        >
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon className="text-[color:var(--accent)] transition-transform duration-[600ms] ease-out" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton
          tooltip="Refresh"
          className="rounded-md transition-colors hover:bg-[color:var(--faint)] hover:text-[color:var(--foreground)]"
        >
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton
            tooltip="More"
            className="rounded-md transition-colors hover:bg-[color:var(--faint)] hover:text-[color:var(--foreground)] data-[state=open]:bg-[color:var(--faint)]"
          >
            <MoreHorizontalIcon />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          className="aui-action-bar-more-content z-50 min-w-32 overflow-hidden rounded-md border border-[color:var(--hairline)] bg-[color:var(--popover)] p-1 text-[color:var(--popover-foreground)]"
        >
          <ActionBarPrimitive.ExportMarkdown asChild>
            <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[color:var(--faint)] focus:bg-[color:var(--faint)]">
              <DownloadIcon className="size-4" />
              Export as Markdown
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_user-message-root"
      className="fade-in slide-in-from-right-2 grid animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 duration-150 [contain-intrinsic-size:auto_60px] [content-visibility:auto] [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content wrap-break-word peer rounded-md bg-[color:var(--faint)] px-4 py-2.5 text-[color:var(--foreground)] empty:hidden">
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden rtl:translate-x-full">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker
        data-slot="aui_user-branch-picker"
        className="col-span-full col-start-1 row-start-3 -me-1 justify-end"
      />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_edit-composer-wrapper"
      className="flex flex-col px-2"
    >
      <ComposerPrimitive.Root className="aui-edit-composer-root ms-auto flex w-full max-w-[85%] flex-col rounded-md bg-[color:var(--faint)]">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-[color:var(--foreground)] text-sm outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root -ms-2 me-2 inline-flex items-center text-muted-foreground text-xs",
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
