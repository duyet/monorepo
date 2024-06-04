import { cn } from "@duyet/libs/utils";

import Menu from "./Menu";
import Container from "./Container";
import Logo from "./Logo";

interface HeaderProps {
  className?: string;
  shortText?: string;
  longText?: string;
  center?: boolean;
}

export default function Header({
  className,
  shortText = "Duyệt",
  longText = "Tôi là Duyệt",
  center = false,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "py-10",
        center ? "md:flex md:justify-center md:my-10" : "",
        className,
      )}
    >
      <Container className="mb-0">
        <nav
          className={cn(
            "flex items-center space-x-6 flex-wrap justify-between transition-all",
            center ? "md:flex-col md:gap-10" : "",
          )}
        >
          <Logo
            shortText={shortText}
            longText={longText}
            className={center ? "md:flex-col" : ""}
            logoClassName={center ? "md:w-40 md:h-40" : ""}
            textClassName={center ? "md:text-7xl md:mt-5" : ""}
          />
          <Menu />
        </nav>
      </Container>
    </header>
  );
}
