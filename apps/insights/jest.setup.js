import '@testing-library/jest-dom'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock environment variables
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_DUYET_BLOG_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_DUYET_CV_URL = 'http://localhost:3002'
