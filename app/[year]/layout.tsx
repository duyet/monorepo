import React from 'react'

import Container from '../../components/Container'

type Props = {
  params: {
    year: number
  }
  children: React.ReactNode
}

export default function YearLayout({ children }: Props) {
  return <Container>{children}</Container>
}
