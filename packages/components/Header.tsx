import { cn } from "@duyet/libs/utils";

import Menu from "./Menu";
import Container from "./Container";
import Logo from "./Logo";

interface HeaderProps {
  className?: string;
  shortText?: string;
  longText?: string;
}

export default function Header({
  className = "",
  shortText = "Duyệt",
  longText = "Tôi là Duyệt",
}: HeaderProps) {
  return (
    <header className={cn("py-10", className)}>
      <Container className="mb-0">
        <nav className="flex items-center space-x-6 flex-wrap justify-between">
          <Logo shortText={shortText} longText={longText} />
          <Menu />
        </nav>
      </Container>
    </header>
  );
}
