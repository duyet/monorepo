import { filterInfoBaseProps } from "../../test-fixtures";
import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../../test-setup";
import { FilterInfo } from "../filter-info";

afterEach(cleanup);

describe("FilterInfo", () => {
  it("renders without crashing", () => {
    const { container } = render(<FilterInfo {...filterInfoBaseProps} />);
    expect(container).toBeDefined();
  });

  it("renders search input with placeholder", () => {
    const { getAllByPlaceholderText } = render(
      <FilterInfo {...filterInfoBaseProps} />
    );
    const elements = getAllByPlaceholderText("Search models...");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders result count", () => {
    const { getAllByText } = render(<FilterInfo {...filterInfoBaseProps} />);
    const elements = getAllByText("42");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders 'models' label for models view", () => {
    const { getAllByText } = render(<FilterInfo {...filterInfoBaseProps} />);
    const elements = getAllByText("models");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders 'organizations' label for organizations view", () => {
    const { getAllByText } = render(
      <FilterInfo
        {...filterInfoBaseProps}
        view="organizations"
        resultCount={10}
      />
    );
    const elements = getAllByText("organizations");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders license select when onLicenseChange is provided", () => {
    const { getByRole } = render(
      <FilterInfo {...filterInfoBaseProps} onLicenseChange={() => {}} />
    );
    expect(getByRole("combobox")).toBeDefined();
  });

  it("does not render license select when onLicenseChange is absent", () => {
    const { queryByRole } = render(<FilterInfo {...filterInfoBaseProps} />);
    expect(queryByRole("combobox")).toBeNull();
  });

  it("shows comparison mode hint when comparisonMode=true", () => {
    const { getByText } = render(
      <FilterInfo
        {...filterInfoBaseProps}
        comparisonMode
        onToggleComparisonMode={() => {}}
      />
    );
    expect(getByText(/Comparison mode/)).toBeDefined();
  });

  it("does not show comparison mode hint when comparisonMode=false", () => {
    const { queryByText } = render(<FilterInfo {...filterInfoBaseProps} />);
    expect(queryByText(/Comparison mode/)).toBeNull();
  });

  it("renders lite mode toggle button", () => {
    const { getByRole } = render(<FilterInfo {...filterInfoBaseProps} />);
    const btn = getByRole("button", { name: "Toggle lite mode" });
    expect(btn).toBeDefined();
  });
});
