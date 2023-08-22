import Link from 'next/link'
import Image from 'next/image'

import Menu from './Menu'
import Container from './Container'

export default function Header({ logo }: { logo: any }) {
  return (
    <header className="py-10">
      <Container className="mb-0">
        <nav className="flex items-center space-x-6 flex-wrap justify-between">
          <Link href="/" className="p-3 font-bold flex flex-row items-center">
            <Image src={logo} alt="Logo" width={45} height={45} />
            {/* show this on mobile, and hidden on screens 640px and wider */}
            <span className="ml-2 block sm:hidden">Duyệt</span>
            {/* hide this on mobile, and show on screens 640px and wider */}
            <span className="ml-2 hidden sm:block">Tôi là Duyệt</span>
          </Link>
          <Menu />
        </nav>
      </Container>
    </header>
  )
}
