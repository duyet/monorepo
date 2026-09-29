import {
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { CaretDown, Cpu, PaperPlaneTilt } from "@phosphor-icons/react";
import { SquareIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { ComposerAddAttachment, ComposerAttachments } from "./attachment";

/**
 * The message input, its model picker and send/cancel controls, plus the
 * inline editor a user message switches to.
 *
 * The model list is local component state, not thread state, so a selected
 * model does not survive a remount and is never sent to the backend. That is
 * the shipped behaviour, kept as-is: making it real is a feature, not a
 * refactor.
 */

export const Composer: FC = () => {
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

export const EditComposer: FC = () => {
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
