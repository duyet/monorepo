import * as React from 'react';
import { Container } from '@duyet/components';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <div className="mb-10">{children}</div>
    </Container>
  );
}
