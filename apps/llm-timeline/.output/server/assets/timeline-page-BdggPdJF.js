import { jsx } from "react/jsx-runtime";
import { S as StaticView } from "./static-view-BKcu-o28.js";
import { m as models, g as getSlug } from "./router-8qeuaoTQ.js";
import { c as filterModels, b as getStats } from "./utils-DRorGYoO.js";
function TimelinePage({
  view = "models",
  license = "all",
  year,
  orgSlug,
  liteMode = false
}) {
  const baseFilters = {
    search: "",
    license,
    type: "all",
    org: "",
    source: "all",
    domain: "all",
    params: "all"
  };
  let filtered = filterModels(models, baseFilters);
  if (year) {
    filtered = filtered.filter(
      (model) => new Date(model.date).getFullYear() === year
    );
  }
  let orgName;
  if (orgSlug) {
    const orgs = Array.from(new Set(models.map((m) => m.org)));
    const matchedOrg = orgs.find((org) => getSlug(org) === orgSlug);
    if (matchedOrg) {
      orgName = matchedOrg;
      filtered = filtered.filter((model) => model.org === matchedOrg);
    }
  }
  const statsResult = getStats(filtered);
  const stats = {
    models: statsResult.models,
    organizations: statsResult.organizations
  };
  return /* @__PURE__ */ jsx(
    StaticView,
    {
      models: filtered,
      stats,
      view,
      license,
      year,
      org: orgName,
      liteMode
    }
  );
}
export {
  TimelinePage as T
};
