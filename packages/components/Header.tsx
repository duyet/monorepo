import { cn } from "@duyet/libs/utils";
import Link from "next/link";
import Image from "next/image";

import Menu from "./Menu";
import Container from "./Container";

import LOGO from "./logo.svg";

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
          <Link href="/" className="p-3 font-bold flex flex-row items-center">
            <Image src={LOGO} alt="Logo" width={45} height={45} />
            {/* show this on mobile, and hidden on screens 640px and wider */}
            <span className="ml-2 block sm:hidden">{shortText}</span>
            {/* hide this on mobile, and show on screens 640px and wider */}
            <span className="ml-2 hidden sm:block">{longText}</span>
          </Link>
          <Menu />
        </nav>
      </Container>
    </header>
  );
}
