import Container from '@duyet/components/Container';
import Header from '@duyet/components/Header';
import * as React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="bg-gold dark:bg-gray-900">
        <Container className="mb-0">{children}</Container>
      </div>
    </>
  );
}
