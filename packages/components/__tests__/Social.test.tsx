import Social from "../Social";
import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../test-setup";

afterEach(cleanup);

const mockProfile = {
  personal: {
    name: "Test User",
    email: "test@example.com",
    title: "Developer",
  },
  social: {
    github: "https://github.com/testuser",
    twitter: "https://twitter.com/testuser",
    linkedin: "https://linkedin.com/in/testuser",
    unsplash: "",
    tiktok: "",
    medium: "",
    devto: "",
  },
} as Parameters<typeof Social>[0]["profile"];

describe("Social", () => {
  it("renders without crashing", () => {
    const { container } = render(<Social profile={mockProfile} />);
    expect(container).toBeDefined();
  });

  it("renders only social links that have URLs", () => {
    const { container } = render(<Social profile={mockProfile} />);
    const links = container.querySelectorAll("a");
    // Only github, twitter, linkedin have URLs
    expect(links.length).toBe(3);
  });

  it("renders correct href for each social link", () => {
    const { container } = render(<Social profile={mockProfile} />);
    const links = container.querySelectorAll("a");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://github.com/testuser");
    expect(hrefs).toContain("https://twitter.com/testuser");
    expect(hrefs).toContain("https://linkedin.com/in/testuser");
  });

  it("opens links in new tab with security attributes", () => {
    const { container } = render(<Social profile={mockProfile} />);
    const links = container.querySelectorAll("a");
    for (const link of links) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("renders aria-labels for accessibility", () => {
    const { container } = render(<Social profile={mockProfile} />);
    const links = container.querySelectorAll("a");
    const labels = Array.from(links).map((a) => a.getAttribute("aria-label"));
    expect(labels).toContain("GitHub");
    expect(labels).toContain("Twitter");
    expect(labels).toContain("LinkedIn");
  });

  it("renders no links when profile has no social URLs", () => {
    const emptyProfile = {
      ...mockProfile,
      social: {
        github: "",
        twitter: "",
        linkedin: "",
        unsplash: "",
        tiktok: "",
        medium: "",
        devto: "",
      },
    } as Parameters<typeof Social>[0]["profile"];
    const { container } = render(<Social profile={emptyProfile} />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(0);
  });

  it("applies custom className", () => {
    const { container } = render(
      <Social profile={mockProfile} className="my-class" />
    );
    const div = container.firstElementChild;
    expect(div?.className).toContain("my-class");
    expect(div?.className).toContain("flex");
  });
});
