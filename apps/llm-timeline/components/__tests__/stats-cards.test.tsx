import { mock } from "bun:test";

// Ensure router mock is registered before any component import
mock.module("@tanstack/react-router", () => ({
  useNavigate: () => () => {},
  useSearch: () => ({}),
  useParams: () => ({}),
  useRouter: () => ({
    navigate: () => {},
    history: { push: () => {}, replace: () => {} },
  }),
  Link: (props: Record<string, unknown>) => {
    const { children, to, ...rest } = props;
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    const React = require("react") as any;
    return React.createElement("a", { href: to, ...rest }, children);
  },
  createRootRoute: (opts: unknown) => opts,
  createFileRoute: () => (opts: unknown) => opts,
  Outlet: () => null,
  ScrollRestoration: () => null,
  redirect: (opts: unknown) => opts,
  notFound: () => new Error("not found"),
}));

import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../../test-setup";
import { StatsCards } from "../stats-cards";

afterEach(cleanup);

describe("StatsCards", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <StatsCards models={250} organizations={42} />
    );
    expect(container).toBeDefined();
  });

  it("renders model count", () => {
    const { getAllByText } = render(
      <StatsCards models={250} organizations={42} />
    );
    const elements = getAllByText("250");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders organization count", () => {
    const { getAllByText } = render(
      <StatsCards models={250} organizations={42} />
    );
    const elements = getAllByText("42");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders all 4 stat card labels", () => {
    const { getAllByText } = render(
      <StatsCards models={250} organizations={42} />
    );
    expect(getAllByText("Models").length).toBeGreaterThan(0);
    expect(getAllByText("Organizations").length).toBeGreaterThan(0);
    expect(getAllByText("Sources").length).toBeGreaterThan(0);
    expect(getAllByText("Years").length).toBeGreaterThan(0);
  });

  it("renders years covered as count", () => {
    const { getAllByText } = render(
      <StatsCards models={250} organizations={42} />
    );
    const elements = getAllByText("76");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders data points as dash when no sourceStats provided", () => {
    const { getAllByText } = render(
      <StatsCards models={250} organizations={42} />
    );
    const elements = getAllByText("—");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders data points count when sourceStats provided", () => {
    const { getAllByText } = render(
      <StatsCards
        models={250}
        organizations={42}
        sourceStats={{ curated: 771, epoch: 3156 }}
      />
    );
    // 771 + 3156 = 3927
    const elements = getAllByText("3,927");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("Models card links to /", () => {
    const { getAllByRole } = render(
      <StatsCards models={250} organizations={42} />
    );
    const links = getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/");
  });

  it("Organizations card links to /org", () => {
    const { getAllByRole } = render(
      <StatsCards models={250} organizations={42} />
    );
    const links = getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/org");
  });
});
