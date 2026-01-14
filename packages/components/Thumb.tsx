import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import Image from "next/image";

export type Props = {
  posts: Post[];
  grid?: boolean;
};

export function Thumb({
  url,
  alt,
  width = 800,
  height = 300,
  unoptimized,
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

  if (url.startsWith("http://")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} className="mt-4" alt={alt} />;
  }

  return (
    <Image
      src={url}
      className={cn("mt-4", className)}
      width={width}
      height={height}
      alt={alt || ""}
      unoptimized={unoptimized}
    />
  );
}
