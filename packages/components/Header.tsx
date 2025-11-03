import Link from "next/link";
import { cn } from "@duyet/libs/utils";

import Menu, { type NavigationItem } from "./Menu";
import Container from "./Container";
import Logo from "./Logo";

interface HeaderProps {
  logo?: boolean;
  shortText?: string;
  longText?: string;
  center?: boolean;
  navigationItems?: NavigationItem[];
  className?: string;
  containerClassName?: string;
}

export default function Header({
  logo = true,
  shortText = "Duyệt",
  longText = "Tôi là Duyệt",
  center = false,
  navigationItems,
  className,
  containerClassName,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "py-10",
        center ? "md:flex md:justify-center md:my-10" : "",
        className,
      )}
    >
      <Container className={cn("mb-0", containerClassName)}>
        <nav
          className={cn(
            "flex items-center space-x-6 flex-wrap justify-between transition-all gap-4",
            center && "md:flex-col md:gap-10",
          )}
        >
          <div className={cn("flex flex-row items-center")}>
            {logo && (
              <Logo
                className={center ? "md:flex-col" : ""}
                logoClassName={center ? "md:w-40 md:h-40" : ""}
              />
            )}

            <Link
              href="/"
              className={cn(
                "font-serif text-2xl font-normal text-neutral-900",
                className,
              )}
            >
              {shortText && (
                <span className="block sm:hidden">
                  {shortText}
                </span>
              )}
              {longText && (
                <span
                  className={cn(
                    "hidden sm:block",
                    center && "md:text-7xl md:mt-5",
                  )}
                >
                  {longText}
                </span>
              )}
            </Link>
          </div>

          <Menu navigationItems={navigationItems} />
        </nav>
      </Container>
    </header>
  );
}
