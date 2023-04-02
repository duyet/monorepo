import Link from 'next/link'

import Container from '../components/Container'

export default function Header() {
  return (
    <header className="py-10">
      <Container>
        <nav className="flex space-x-6">
          <Link href="/" className='border rounded p-3 drop-shadow-2xl'>Tôi là Duyệt</Link>
          <Link href="/about" className='p-3'>About</Link>
          <Link href="/archives" className='p-3'>Archives</Link>
        </nav>
      </Container>
    </header>
  )
}
