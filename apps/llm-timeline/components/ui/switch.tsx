import { cn } from "@duyet/libs/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react";

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-[var(--rd-border-2)] transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rd-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rd-bg)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=unchecked]:bg-[var(--rd-surface-2)]",
      "data-[state=checked]:border-[var(--rd-accent)] data-[state=checked]:bg-[var(--rd-accent)]",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-3.5 w-3.5 rounded-full bg-[var(--rd-bg)] ring-1 ring-[var(--rd-border-2)] transition-transform",
        "data-[state=unchecked]:translate-x-[3px] data-[state=checked]:translate-x-[19px]",
        "data-[state=checked]:ring-transparent"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
