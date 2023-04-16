import cn from 'classnames'
import Link from 'next/link'
import { ReactNode, ReactElement } from 'react'

import Container from './Container'
import ThemeToggle from './ThemeToggle'

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const classes =
    'text-sm text-[#666666] dark:text-[#888888] no-underline betterhover:hover:text-gray-700 betterhover:hover:dark:text-white transition'

  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        className={classes}
        target='_blank'
        rel='noopener noreferrer'
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}

function FooterHeader({ children }: { children: ReactNode }) {
  return <h3 className='text-sm text-black dark:text-white'>{children}</h3>
}

const navigation = {
  general: [
    { name: 'Blog Archives', href: '/archives' },
    { name: 'Substack', href: 'https://duyet.substack.com' },
    {
      name: 'Rust Tiếng Việt (Book)',
      href: 'https://rust-tieng-viet.github.io/?utm_source=blog&utm_medium=footer&utm_campaign=rust_tieng_viet',
    },
    { name: 'Status', href: 'https://github.com/duyet/uptime' },
    { name: 'pageview.js', href: 'https://pageview.duyet.net' },
    { name: 'Statistics', href: '/stats' },
  ],
  profile: [
    { name: 'Github', href: 'https://github.com/duyet' },
    { name: 'Linkedin', href: 'https://linkedin.com/in/duyet' },
    { name: 'Resume (PDF)', href: 'https://cv.duyet.net' },
    { name: 'Projects', href: 'https://github.com/duyet?tab=repositories' },
  ],
}

export function FooterContent() {
  return (
    <Container>
      <div aria-labelledby='footer-heading'>
        <h2 id='footer-heading' className='sr-only'>
          Footer
        </h2>
        <div className='w-full py-8 mx-auto'>
          <div className='xl:grid xl:grid-cols-3 xl:gap-8'>
            <div className='grid grid-cols-1 gap-8 xl:col-span-2'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 md:gap-8'>
                <div className='mt-12 md:!mt-0'>
                  <FooterHeader>Resources</FooterHeader>
                  <ul role='list' className='mt-4 space-y-1.5 list-none ml-0'>
                    {navigation.general.map((item) => (
                      <li key={item.name}>
                        <FooterLink href={item.href}>{item.name}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='mt-12 md:!mt-0'>
                  <FooterHeader>Profile</FooterHeader>
                  <ul role='list' className='mt-4 space-y-1.5 list-none ml-0'>
                    {navigation.profile.map((item) => (
                      <li key={item.name}>
                        <FooterLink href={item.href}>{item.name}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className='mt-12 xl:!mt-0'>
              <FooterHeader>Open to Work</FooterHeader>
              <p className='mt-4 text-sm text-gray-600 dark:text-[#888888]'>
                me@duyet.net
              </p>
              <div className='mt-5'>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className='pt-8 mt-8 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='mt-4 text-xs text-gray-500 dark:text-[#888888]'>
                &copy; {new Date().getFullYear()} duyet.net the Data Engineer
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default function Footer({ menu }: { menu?: boolean }): ReactElement {
  return (
    <footer className='bg-[#FAFAFA] pb-[env(safe-area-inset-bottom)] relative dark:bg-slate-900'>
      <div
        className={cn(
          'mx-auto max-w-[90rem] py-2 px-4 flex gap-2',
          menu ? 'flex' : 'hidden'
        )}
      ></div>
      <hr className='dark:border-neutral-800' />
      <div
        className={cn(
          'mx-auto max-w-[90rem] py-12 flex justify-center md:justify-center text-black dark:text-white',
          'pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)]'
        )}
      >
        <FooterContent />
      </div>
    </footer>
  )
}
