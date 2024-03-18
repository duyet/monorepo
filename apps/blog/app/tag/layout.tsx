import Container from '@duyet/components/Container';
import * as React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Container className="mb-10">{children}</Container>;
}
