import Header from "@duyet/components/Header";
import type * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header shortText="Duyệt" />
      {children}
    </>
  );
}
