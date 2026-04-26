import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../../test-setup";
import { Filters } from "../filters";

afterEach(cleanup);

const baseFilters = {
  search: "",
  license: "all" as const,
  type: "all" as const,
  org: "",
  source: "all" as const,
  domain: "all",
  params: "all",
};

describe("Filters", () => {
  it("shows total result context when resultCount is below totalCount", () => {
    const { getByText } = render(
      <Filters
        filters={{ ...baseFilters, license: "open" }}
        onFilterChange={() => {}}
        resultCount={42}
        totalCount={100}
      />
    );

    expect(getByText("of 100 total")).toBeDefined();
  });

  it("hides total result context when resultCount matches totalCount", () => {
    const { queryByText } = render(
      <Filters
        filters={baseFilters}
        onFilterChange={() => {}}
        resultCount={100}
        totalCount={100}
      />
    );

    expect(queryByText("of 100 total")).toBeNull();
  });

  it("keeps total result context hidden when only filter state changes", () => {
    const { queryByText } = render(
      <Filters
        filters={{ ...baseFilters, license: "open" }}
        onFilterChange={() => {}}
        resultCount={100}
        totalCount={100}
      />
    );

    expect(queryByText("of 100 total")).toBeNull();
  });
});
