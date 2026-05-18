"use client";

import { cn } from "@duyet/libs/utils";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const toggleGroupClasses = cn(
  "p-[3px] w-fit flex rounded-full border border-[var(--hairline)]",
  "dark:border-white/15"
);

const toggleGroupItemClasses = cn(
  "h-8 w-8 flex items-center rounded-full justify-center transition",
  "text-[var(--muted-foreground,var(--muted))] hover:text-[var(--foreground)]",
  "data-[state=on]:bg-[var(--surface-card)] data-[state=on]:text-[var(--foreground)]",
  "dark:data-[state=on]:bg-white/15 dark:data-[state=on]:text-[var(--on-dark)]"
);

const iconProps = {
  className: cn("w-4 h-4"),
  strokeWidth: 1,
  size: 16,
};

/**
 * ThemeToggle component - allows switching between light, dark, and system themes
 *
 * Uses next-themes for theme persistence and Radix UI for accessible toggle buttons.
 * Handles hydration mismatch by waiting for client-side mount.
 *
 * @example
 * ```tsx
 * import { ThemeToggle } from '@duyet/components'
 *
 * <ThemeToggle />
 * ```
 */
export default function ThemeToggle() {
  // Avoid hydration mismatch
  // https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const onChange = (value: string) => {
    if (value) setTheme(value);
  };

  return (
    <ToggleGroup.Root
      className={toggleGroupClasses}
      type="single"
      aria-label="Theme"
      onValueChange={onChange}
      value={theme}
    >
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value="light"
        aria-label="Light"
      >
        <Sun {...iconProps} />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value="system"
        aria-label="System"
      >
        <Monitor {...iconProps} />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value="dark"
        aria-label="Dark"
      >
        <Moon {...iconProps} />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
