import Container from "@duyet/components/Container";
import Header from "@duyet/components/Header";
import type * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Container className="mb-10">{children}</Container>
    </>
  );
}
