import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[background-color,color,border-color,transform,opacity] duration-150 ease-out outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-1 aria-invalid:ring-[color:var(--destructive)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:color-mix(in_oklch,var(--primary)_92%,transparent)]",
        destructive:
          "bg-[color:var(--destructive)] text-white hover:opacity-90",
        outline:
          "border border-[color:var(--hairline)] bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--faint)]",
        secondary:
          "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:color-mix(in_oklch,var(--secondary)_70%,transparent)]",
        ghost:
          "bg-transparent hover:bg-[color:var(--faint)] hover:text-[color:var(--foreground)]",
        link: "text-[color:var(--foreground)] underline-offset-4 decoration-[color:var(--accent)] hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
