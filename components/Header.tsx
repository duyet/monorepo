import Link from 'next/link'
import Image from 'next/image'

import Container from '../components/Container'
import Logo from '../public/duyet-notion.svg'

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Statistics', href: '/stats' },
  { name: 'Archives', href: '/archives' },
]

export default function Header() {
  return (
    <header className='py-10'>
      <Container>
        <nav className='flex items-center space-x-6 flex flex-wrap'>
          <Link href='/' className='p-3 font-bold flex flex-row items-center'>
            <Image src={Logo} alt='Logo' width={45} height={45} />
            Duyệt
          </Link>

          <div className='flex flex-row gap-5 flex-wrap'>
            {navigation.map(({ name, href }) => (
              <Link key={name} href={href}>
                {name}
              </Link>
            ))}
          </div>
        </nav>
      </Container>
    </header>
  )
}
