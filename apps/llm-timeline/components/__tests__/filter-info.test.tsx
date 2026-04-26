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
    // SearchAutocomplete uses a dynamic placeholder based on view
    const elements = getAllByPlaceholderText(/Search models/);
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

  it("renders filter toggle button when onLicenseChange is provided", () => {
    const { getByText } = render(
      <FilterInfo {...filterInfoBaseProps} onLicenseChange={() => {}} />
    );
    // Filter toggle button should be present
    const filterButton = getByText("Filters");
    expect(filterButton).toBeDefined();
  });

  it("does not render license filter when onLicenseChange is absent", () => {
    const { container } = render(<FilterInfo {...filterInfoBaseProps} />);
    const selects = container.querySelectorAll("select");
    expect(selects.length).toBe(0);
  });

  it("shows comparison mode hint when comparisonMode=true", () => {
    const { getByText } = render(
      <FilterInfo
        {...filterInfoBaseProps}
        comparisonMode
        onToggleComparisonMode={() => {}}
      />
    );
    expect(getByText("Comparing")).toBeDefined();
  });

  it("does not show comparison mode hint when comparisonMode=false", () => {
    const { queryByText } = render(<FilterInfo {...filterInfoBaseProps} />);
    expect(queryByText("Compare")).toBeNull();
  });

  it("renders view mode toggle button", () => {
    const { getByText } = render(<FilterInfo {...filterInfoBaseProps} />);
    const btn = getByText("Full");
    expect(btn).toBeDefined();
  });
});
