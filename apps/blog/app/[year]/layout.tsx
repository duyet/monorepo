import Container from '@duyet/components/Container';
import React from 'react';

interface YearLayoutProps {
  params: {
    year: number;
  };
  children: React.ReactNode;
}

export default function YearLayout({ children }: YearLayoutProps) {
  return <Container>{children}</Container>;
}
