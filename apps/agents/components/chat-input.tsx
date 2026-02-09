"use client";

import { useState, useRef, type KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

export interface ChatInputProps {
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  minLength = 1,
  maxLength = 4000,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length >= minLength && !isLoading && !disabled) {
      onSubmit(trimmed);
      setValue("");
      // Reset height after submission
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;
        const maxHeight = 200; // Max height in pixels
        textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      }
    }
  };

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const canSubmit = value.trim().length >= minLength && !isLoading && !disabled;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="relative"
    >
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "min-h-[48px] max-h-[200px] resize-none overflow-y-auto",
            "bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-offset-0",
            "shadow-sm",
            disabled && "opacity-50"
          )}
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "thin",
          }}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!canSubmit}
          className={cn(
            "h-11 w-11 shrink-0 rounded-full transition-all",
            "shadow-sm hover:shadow-md",
            canSubmit && "bg-primary hover:bg-primary/90",
            !canSubmit && "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Character count indicator */}
      {value.length > maxLength * 0.8 && (
        <div className="absolute -bottom-6 right-14 text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </div>
      )}
    </form>
  );
}

// Helper for className conditional
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
