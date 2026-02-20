import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "flex-shrink-0",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full border-b",
        vertical: "h-full w-px border-l",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  orientation?: "horizontal" | "vertical"
}

function Separator({ className, orientation, ...props }: SeparatorProps) {
  return (
    <div
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
}

export { Separator }
