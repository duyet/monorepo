import {
  CardDescription,
  Card as SharedCard,
  CardContent as SharedCardContent,
  CardFooter as SharedCardFooter,
  CardHeader as SharedCardHeader,
  CardTitle as SharedCardTitle,
} from "@duyet/components/ui/card";
import * as React from "react";

// Override Card with warm Claude cream/beige background
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCard
    ref={ref}
    className={`shadow-none rounded-2xl border border-claude-tan/40 bg-claude-cream dark:border-neutral-700/50 dark:bg-neutral-800/80 ${className || ""}`}
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
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
