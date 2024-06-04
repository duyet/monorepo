import Container from '@duyet/components/Container';
import Header from '@duyet/components/Header';
import * as React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Container className="mb-16 md:mb-32">{children}</Container>
    </>
  );
}
