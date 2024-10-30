import * as React from 'react'

import Container from '@duyet/components/Container'
import Header from '@duyet/components/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Container className="mb-10">{children}</Container>
    </>
  )
}
