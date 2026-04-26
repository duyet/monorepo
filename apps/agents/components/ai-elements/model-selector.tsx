import type { ComponentProps, ReactNode } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export type ModelSelectorProps = React.ComponentProps<
  typeof PopoverPrimitive.Root
>;

export const ModelSelector = (props: ModelSelectorProps) => (
  <Popover {...props} />
);

export type ModelSelectorTriggerProps = ComponentProps<typeof PopoverTrigger>;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => (
  <PopoverTrigger {...props} />
);

export type ModelSelectorContentProps = ComponentProps<
  typeof PopoverContent
> & {
  title?: ReactNode;
};

export const ModelSelectorContent = ({
  className,
  children,
  title: _title,
  ...props
}: ModelSelectorContentProps) => (
  <PopoverContent
    align="start"
    className={cn("w-[280px] p-0 rounded-xl", className)}
    side="top"
    sideOffset={8}
    {...props}
  >
    <Command className="**:data-[slot=command-input-wrapper]:h-auto">
      {children}
    </Command>
  </PopoverContent>
);

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModelSelectorInput = ({
  className,
  ...props
}: ModelSelectorInputProps) => (
  <CommandInput
    className={cn("h-auto py-2.5 text-[13px]", className)}
    {...props}
  />
);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = ({
  className,
  ...props
}: ModelSelectorListProps) => (
  <CommandList className={cn("max-h-[280px]", className)} {...props} />
);

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = (props: ModelSelectorEmptyProps) => (
  <CommandEmpty {...props} />
);

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = (props: ModelSelectorGroupProps) => (
  <CommandGroup {...props} />
);

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = ({
  className,
  ...props
}: ModelSelectorItemProps) => (
  <CommandItem
    className={cn("w-full text-[13px] rounded-lg", className)}
    {...props}
  />
);

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = (props: ModelSelectorShortcutProps) => (
  <CommandShortcut {...props} />
);

export type ModelSelectorSeparatorProps = ComponentProps<
  typeof CommandSeparator
>;

export const ModelSelectorSeparator = (props: ModelSelectorSeparatorProps) => (
  <CommandSeparator {...props} />
);

export type ModelSelectorLogoProps = Omit<
  ComponentProps<"img">,
  "src" | "alt"
> & {
  provider:
    | "anthropic"
    | "openai"
    | "google"
    | "xai"
    | "mistral"
    | "deepseek"
    | "groq"
    | "cloudflare-workers-ai"
    | "openrouter"
    | "togetherai"
    | "fireworks-ai"
    | "amazon-bedrock"
    | "azure"
    | "nvidia"
    | "cerebras"
    | "perplexity"
    | "huggingface"
    | "llama"
    | "google-vertex"
    | (string & {});
};

export const ModelSelectorLogo = ({
  provider,
  className,
  ...props
}: ModelSelectorLogoProps) => (
  <img
    {...props}
    alt={`${provider} logo`}
    className={cn("size-4 dark:invert", className)}
    height={16}
    src={`https://models.dev/logos/${provider}.svg`}
    width={16}
  />
);

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

export const ModelSelectorLogoGroup = ({
  className,
  ...props
}: ModelSelectorLogoGroupProps) => (
  <div
    className={cn(
      "flex shrink-0 items-center -space-x-1 [&>img]:rounded-full [&>img]:p-px [&>img]:ring-1 [&>img]:ring-border/30",
      className
    )}
    {...props}
  />
);

export type ModelSelectorNameProps = ComponentProps<"span">;

export const ModelSelectorName = ({
  className,
  ...props
}: ModelSelectorNameProps) => (
  <span className={cn("flex-1 truncate text-left", className)} {...props} />
);
