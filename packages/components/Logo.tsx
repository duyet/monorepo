import { cn } from "@duyet/libs/utils";
import Image from "next/image";
import Link from "next/link";

import LOGO from "./logo.svg";

interface LogoProps {
  className?: string;
  logoClassName?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  className = "",
  logoClassName = "",
  width = 50,
  height = 50,
}: LogoProps) {
  const logoCls = cn(
    "flex items-center",
    "hover:opacity-80 transition-opacity",
    "cursor-pointer",
    "rounded-full",
    logoClassName
  );

  return (
    <Link
      href="/"
      className={cn("p-3 font-bold flex flex-row items-center", className)}
    >
      <Image
        src={LOGO}
        alt="Logo"
        width={width}
        height={height}
        className={logoCls}
      />
    </Link>
  );
}
