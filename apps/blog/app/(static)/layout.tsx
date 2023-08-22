import * as React from 'react'
import { Container } from '@duyet/components'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Container className="mb-20">{children}</Container>
}
