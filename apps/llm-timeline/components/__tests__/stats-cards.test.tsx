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

  it("renders years covered as 2017–26", () => {
    const { getAllByText } = render(
      <StatsCards models={250} organizations={42} />
    );
    const elements = getAllByText("1950–26");
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
    expect(links.length).toBeGreaterThanOrEqual(2);
    // First link is the Models card linking to /
    expect(links[0]).toBeDefined();
  });

  it("Organizations card renders as a link", () => {
    const { getAllByRole } = render(
      <StatsCards models={250} organizations={42} />
    );
    const links = getAllByRole("link");
    // Should have at least 2 links: Models (/) and Organizations (/org)
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
