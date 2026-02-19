import Container from "@duyet/components/Container";
import Header from "@duyet/components/Header";
import type React from "react";

interface YearLayoutProps {
  params: Promise<{
    year: string;
  }>;
  children: React.ReactNode | React.ReactNode[];
}

export default function YearLayout({ children }: YearLayoutProps) {
  return (
    <>
      <Header />
      <Container>{children}</Container>
    </>
  );
}
