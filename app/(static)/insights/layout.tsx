import React from 'react'

type Props = {
  cloudflare: React.ReactNode
  wakatime: React.ReactNode
}

export default async function Layout({ cloudflare, wakatime }: Props) {
  return (
    <>
      {cloudflare}
      {wakatime}
    </>
  )
}
