import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";

export type Props = {
  posts: Post[];
  grid?: boolean;
};

export function Thumb({
  url,
  alt,
  width = 800,
  height = 300,
  className,
}: {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
  className?: string;
}) {
  if (!url) return null;

  return (
    <img
      src={url}
      className={cn("mt-4", className)}
      width={width}
      height={height}
      alt={alt || ""}
    />
  );
}
