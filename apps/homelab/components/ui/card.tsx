import {
  CardDescription,
  Card as SharedCard,
  CardContent as SharedCardContent,
  CardFooter as SharedCardFooter,
  CardHeader as SharedCardHeader,
  CardTitle as SharedCardTitle,
} from "@duyet/components/ui/card";
import { cn } from "@duyet/libs/utils";
import * as React from "react";

// Override Card with rounded corners and gray border
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCard
    ref={ref}
    className={cn(
      "shadow-none rounded-2xl border border-neutral-200 dark:border-neutral-700/50 dark:bg-neutral-800/80",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

// Use default CardHeader with padding
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCardHeader ref={ref} className={className} {...props} />
));
CardHeader.displayName = "CardHeader";

// Override CardTitle to make text smaller
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <SharedCardTitle
    ref={ref}
    className={`text-lg ${className || ""}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// Use default CardContent with padding
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCardContent ref={ref} className={className} {...props} />
));
CardContent.displayName = "CardContent";

// Use default CardFooter with padding
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCardFooter ref={ref} className={className} {...props} />
));
CardFooter.displayName = "CardFooter";

// Export overridden components and shared components
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
