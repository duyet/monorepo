import type React from "react";

import { cn } from "@duyet/libs/utils";

type ContainerProps = {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10",
        className
      )}
    >
      {children}
    </div>
  );
}
