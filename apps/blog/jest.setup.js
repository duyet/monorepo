require("@testing-library/jest-dom");

// Polyfill Response and Request for Next.js route handlers
global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.init = init || {};
    this.status = init?.status || 200;
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async text() {
    return this.body;
  }

  async json() {
    return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
  }
};

global.Request = class Request {
  constructor(url, init) {
    this.url = url;
    this.init = init || {};
  }
};

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock Next.js image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    const { eslint, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} />;
  },
}));

// Mock Next.js link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => {
    return <a href={href}>{children}</a>;
  },
}));

// Set test environment variables
process.env.NEXT_PUBLIC_DUYET_BLOG_URL = "https://blog.duyet.net";
process.env.NODE_ENV = "test";
