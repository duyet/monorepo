import { testModel } from "../../test-fixtures";
import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../../test-setup";
import { ModelCard } from "../model-card";

afterEach(cleanup);

describe("ModelCard", () => {
  it("renders full mode without crashing", () => {
    const { container } = render(<ModelCard model={testModel} />);
    expect(container).toBeDefined();
  });

  it("renders model name and org in full mode", () => {
    const { getByText } = render(<ModelCard model={testModel} />);
    expect(getByText("GPT-4")).toBeDefined();
    expect(getByText("OpenAI")).toBeDefined();
  });

  it("renders description in full mode", () => {
    const { getByText } = render(<ModelCard model={testModel} />);
    expect(getByText("A large multimodal model")).toBeDefined();
  });

  it("renders type and license badges in full mode", () => {
    const { getAllByText } = render(<ModelCard model={testModel} />);
    // type badge appears in full card badges section
    expect(getAllByText("model").length).toBeGreaterThan(0);
    expect(getAllByText("closed").length).toBeGreaterThan(0);
  });

  it("renders lite mode without crashing", () => {
    const { container } = render(<ModelCard model={testModel} lite />);
    expect(container).toBeDefined();
  });

  it("renders model name in lite mode", () => {
    const { getAllByText } = render(<ModelCard model={testModel} lite />);
    const elements = getAllByText("GPT-4");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders selection button with correct aria-label when isSelectable=true", () => {
    const { getByRole } = render(
      <ModelCard model={testModel} isSelectable isSelected={false} />
    );
    const btn = getByRole("button", {
      name: "Select GPT-4 for comparison",
    });
    expect(btn).toBeDefined();
  });

  it("renders deselect aria-label when isSelected=true", () => {
    const { getByRole } = render(
      <ModelCard model={testModel} isSelectable isSelected />
    );
    const btn = getByRole("button", { name: "Deselect GPT-4" });
    expect(btn).toBeDefined();
  });
});
