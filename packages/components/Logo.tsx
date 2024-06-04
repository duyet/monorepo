import { cn } from "@duyet/libs/utils";
import Link from "next/link";
import Image from "next/image";

import LOGO from "./logo.svg";

interface LogoProps {
  className?: string;
  textClassName?: string;
  logoClassName?: string;
  shortText?: string;
  longText?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  className = "",
  textClassName = "",
  logoClassName = "",
  shortText,
  longText,
  width = 50,
  height = 50,
}: LogoProps) {
  const logoCls = cn(
    "flex items-center",
    "hover:opacity-80 transition-opacity",
    "cursor-pointer",
    "rounded-full",
    logoClassName,
  );
  const textCls = cn("ml-2 font-bold text-lg", textClassName);

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
      {shortText && (
        <span className={cn(textCls, "block sm:hidden")}>{shortText}</span>
      )}
      {longText && (
        <span className={cn(textCls, "hidden sm:block")}>{longText}</span>
      )}
    </Link>
  );
}
