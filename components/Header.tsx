import Link from 'next/link'
import Image from 'next/image'

import Container from '../components/Container'
import Logo from '../public/duyet-notion.svg'

export default function Header() {
  return (
    <header className='py-10'>
      <Container>
        <nav className='flex items-center space-x-6'>
          <Link href='/' className='p-3 font-bold flex flex-row items-center'>
            <Image src={Logo} alt='Logo' width={45} height={45} />
            Tôi là Duyệt
          </Link>
          <Link href='/about' className='p-3'>
            About
          </Link>
          <Link href='/archives' className='p-3'>
            Archives
          </Link>
        </nav>
      </Container>
    </header>
  )
}
