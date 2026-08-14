import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { filterInfoBaseProps } from "../../test-fixtures";
import { FilterInfo } from "../filter-info";

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

  it("gives the search box an accessible name", () => {
    const { getAllByLabelText } = render(
      <FilterInfo {...filterInfoBaseProps} />
    );
    const named = getAllByLabelText("Search models and organizations");
    expect(named.length).toBeGreaterThan(0);
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

  it("reflects an enabled comparison mode on the switch", () => {
    const { getByRole } = render(
      <FilterInfo
        {...filterInfoBaseProps}
        comparisonMode
        onToggleComparisonMode={() => {}}
      />
    );
    expect(
      getByRole("switch", { name: "Comparison mode" }).getAttribute(
        "aria-checked"
      )
    ).toBe("true");
  });

  it("reflects a disabled comparison mode on the switch", () => {
    const { getByRole } = render(
      <FilterInfo
        {...filterInfoBaseProps}
        comparisonMode={false}
        onToggleComparisonMode={() => {}}
      />
    );
    expect(
      getByRole("switch", { name: "Comparison mode" }).getAttribute(
        "aria-checked"
      )
    ).toBe("false");
  });

  it("omits the comparison switch when no toggle handler is given", () => {
    const { queryByRole } = render(<FilterInfo {...filterInfoBaseProps} />);
    expect(queryByRole("switch", { name: "Comparison mode" })).toBeNull();
  });

  it("renders the compact-view switch, off by default", () => {
    const { getByRole } = render(<FilterInfo {...filterInfoBaseProps} />);
    expect(
      getByRole("switch", { name: "Compact view" }).getAttribute("aria-checked")
    ).toBe("false");
  });

  it("calls onToggleComparisonMode when the switch is clicked", () => {
    let toggled = false;
    const { getByRole } = render(
      <FilterInfo
        {...filterInfoBaseProps}
        comparisonMode={false}
        onToggleComparisonMode={() => {
          toggled = true;
        }}
      />
    );
    fireEvent.click(getByRole("switch", { name: "Comparison mode" }));
    expect(toggled).toBe(true);
  });
});
