import type { ChatStatus } from "ai";
import {
  ArrowClockwise as RefreshCw,
  Check as CheckIcon,
  GlobeHemisphereWest as GlobeIcon,
  Sparkle as SparkleIcon,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { chatModels } from "@/lib/ai/models";
import type { ChatMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmitMessage: (message: PromptInputMessage) => void | Promise<void>;
  onSuggestionSelect: (suggestion: string) => void | Promise<void>;
  status: ChatStatus;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  modelId: string;
  onModelChange: (value: string) => void;
  isLoading: boolean;
  canSubmit: boolean;
  hasAssistantResponse: boolean;
  stop: () => void;
  reload: () => void;
  error: Error | null;
}

const QUICK_SUGGESTIONS = [
  "Search blog posts about ClickHouse",
  "Tell me about Duyet's work experience",
  "What has Duyet been working on recently?",
  "Show me the contact form analytics",
];

const PROVIDER_LABELS: Record<string, string> = {
  cloudflare: "Cloudflare",
};

const PROVIDER_LOGOS: Record<string, string> = {
  cloudflare: "cloudflare-workers-ai",
};

function getProviderLabel(provider: string): string {
  return (
    PROVIDER_LABELS[provider] ??
    provider
      .split(/[-_]/g)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function getProviderLogo(provider: string): string {
  return PROVIDER_LOGOS[provider] ?? provider;
}

function getErrorMessage(error: Error): string {
  const message = error.message.trim();

  try {
    const parsed = JSON.parse(message);
    return parsed.message || parsed.error || "An error occurred";
  } catch {
    return message || "An error occurred. Please try again.";
  }
}

function PromptInputAttachmentsDisplay() {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-wrap gap-2">
      {attachments.files.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/90 px-2.5 py-1.5 text-xs"
        >
          <span className="max-w-[220px] truncate text-foreground">
            {attachment.filename || "Attachment"}
          </span>
          <button
            type="button"
            aria-label={`Remove ${attachment.filename || "attachment"}`}
            className="rounded text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => {
              attachments.remove(attachment.id);
            }}
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function PromptInputSubmitControl({
  canSubmit,
  status,
  stop,
}: {
  canSubmit: boolean;
  status: ChatStatus;
  stop: () => void;
}) {
  const attachments = usePromptInputAttachments();
  const hasAttachments = attachments.files.length > 0;
  const isStreaming = status === "submitted" || status === "streaming";
  const disabled = !isStreaming && !canSubmit && !hasAttachments;

  return (
    <PromptInputSubmit
      className={cn(status === "ready" && "bg-foreground")}
      disabled={disabled}
      onStop={stop}
      status={status}
    />
  );
}

export function ChatInput({
  input,
  setInput,
  onSubmitMessage,
  onSuggestionSelect,
  status,
  mode,
  onModeChange,
  modelId,
  onModelChange,
  isLoading,
  canSubmit,
  hasAssistantResponse,
  stop,
  reload,
  error,
}: ChatInputProps) {
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const selectedModel = useMemo(
    () => chatModels.find((model) => model.id === modelId) ?? chatModels[0],
    [modelId]
  );

  const modelGroups = useMemo(() => {
    const groups = new Map<string, typeof chatModels>();

    for (const model of chatModels) {
      const providerLabel = getProviderLabel(model.provider);
      const existing = groups.get(providerLabel);
      if (existing) {
        existing.push(model);
      } else {
        groups.set(providerLabel, [model]);
      }
    }

    return [...groups.entries()];
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-0 w-full px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8 sm:px-8">
      <div className="mx-auto max-w-[720px] space-y-2">
        <Suggestions className="px-0">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              disabled={isLoading}
              onClick={(value) => {
                void onSuggestionSelect(value);
              }}
              className="bg-white"
            />
          ))}
        </Suggestions>

        <div className="pointer-events-auto rounded-xl bg-white p-2">
          <PromptInput
            accept="image/png,image/jpeg"
            globalDrop
            multiple
            onSubmit={onSubmitMessage}
          >
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                className="min-h-[44px] max-h-[170px] px-3 py-2.5 text-sm font-medium"
                disabled={isLoading}
                onChange={(event) => {
                  setInput(event.target.value);
                }}
                placeholder="Ask anything"
                value={input}
              />
            </PromptInputBody>

            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger
                    aria-label="Attachment actions"
                  />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <PromptInputButton
                  onClick={() => {
                    onModeChange(mode === "agent" ? "fast" : "agent");
                  }}
                  tooltip={
                    mode === "agent"
                      ? "Agent mode enabled"
                      : "Fast mode enabled"
                  }
                  variant={mode === "agent" ? "default" : "ghost"}
                >
                  {mode === "agent" ? (
                    <SparkleIcon className="size-4" />
                  ) : (
                    <GlobeIcon className="size-4" />
                  )}
                  <span>{mode === "agent" ? "Agent" : "Fast"}</span>
                </PromptInputButton>

                {hasAssistantResponse && input.length === 0 && (
                  <PromptInputButton
                    onClick={() => {
                      reload();
                    }}
                    tooltip="Regenerate"
                    variant="ghost"
                  >
                    <RefreshCw className="size-4" />
                  </PromptInputButton>
                )}

                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton>
                      <ModelSelectorLogo
                        provider={getProviderLogo(selectedModel.provider)}
                      />
                      <ModelSelectorName className="max-w-[180px]">
                        {selectedModel.name}
                      </ModelSelectorName>
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {modelGroups.map(([provider, models]) => (
                        <ModelSelectorGroup heading={provider} key={provider}>
                          {models.map((model) => (
                            <ModelSelectorItem
                              key={model.id}
                              onSelect={() => {
                                onModelChange(model.id);
                                setModelSelectorOpen(false);
                              }}
                              value={model.id}
                            >
                              <ModelSelectorLogo
                                provider={getProviderLogo(model.provider)}
                              />
                              <ModelSelectorName>{model.name}</ModelSelectorName>
                              {modelId === model.id ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <span className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>

              <PromptInputSubmitControl
                canSubmit={canSubmit}
                status={status}
                stop={stop}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <Warning className="h-4 w-4" />
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
