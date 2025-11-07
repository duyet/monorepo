import * as React from "react";

import {
  Card as SharedCard,
  CardHeader as SharedCardHeader,
  CardContent as SharedCardContent,
  CardFooter as SharedCardFooter,
  CardTitle,
  CardDescription,
} from "@duyet/components/ui/card";

// Override Card to remove shadow
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCard
    ref={ref}
    className={`shadow-none p-0 ${className || ""}`}
    {...props}
  />
));
Card.displayName = "Card";

// Override CardHeader to remove padding
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCardHeader
    ref={ref}
    className={`p-0 ${className || ""}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// Override CardContent to remove padding
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCardContent
    ref={ref}
    className={`p-0 ${className || ""}`}
    {...props}
  />
));
CardContent.displayName = "CardContent";

// Override CardFooter to remove padding
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SharedCardFooter
    ref={ref}
    className={`p-0 ${className || ""}`}
    {...props}
  />
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
