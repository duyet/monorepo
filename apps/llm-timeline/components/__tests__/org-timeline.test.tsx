import { afterEach, cleanup, describe, expect, it, render } from "../../test-setup";
import { testModel, testModel2 } from "../../test-fixtures";
import { OrgTimeline } from "../org-timeline";

afterEach(cleanup);

describe("OrgTimeline", () => {
  it("renders empty state when no orgs provided", () => {
    const { getByText } = render(
      <OrgTimeline modelsByOrg={new Map()} />
    );
    expect(
      getByText("No models found matching your filters.")
    ).toBeDefined();
  });

  it("renders without crashing with data", () => {
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    const { container } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(container).toBeDefined();
  });

  it("renders org name in header", () => {
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    const { getAllByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    // Org name appears in both the aria-hidden large heading and the visible header
    expect(getAllByText("OpenAI").length).toBeGreaterThan(0);
  });

  it("renders model count label for org", () => {
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    const { getAllByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    const elements = getAllByText("1 model");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders plural model count for org with multiple models", () => {
    const anotherModel = { ...testModel, name: "GPT-3.5" };
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel, anotherModel]);
    const { getAllByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    const elements = getAllByText("2 models");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders model cards for each org", () => {
    const modelsByOrg = new Map<string, (typeof testModel | typeof testModel2)[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    modelsByOrg.set("Anthropic", [testModel2]);
    const { getAllByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(getAllByText("GPT-4").length).toBeGreaterThan(0);
    expect(getAllByText("Claude 2").length).toBeGreaterThan(0);
  });

  it("renders multiple orgs in order", () => {
    const modelsByOrg = new Map<string, (typeof testModel | typeof testModel2)[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    modelsByOrg.set("Anthropic", [testModel2]);
    const { getAllByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(getAllByText("OpenAI").length).toBeGreaterThan(0);
    expect(getAllByText("Anthropic").length).toBeGreaterThan(0);
  });
});
