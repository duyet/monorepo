import { expect, test } from "bun:test";
import {
  PERIODS,
  DEFAULT_PERIOD,
  getPeriodConfig,
  getPeriodDays,
  isPeriodValue,
  getAllPeriodValues,
  generatePeriodStaticParams,
  uiConfig,
} from "./src/ui.config";

test("PERIODS contains all expected periods", () => {
  expect(PERIODS).toHaveLength(4);
  expect(PERIODS[0].value).toBe("7");
  expect(PERIODS[1].value).toBe("30");
  expect(PERIODS[2].value).toBe("365");
  expect(PERIODS[3].value).toBe("all");
});

test("PERIODS has correct labels and days", () => {
  expect(PERIODS[0]).toEqual({
    value: "7",
    label: "7 days",
    days: 7,
    description: "Last week",
  });

  expect(PERIODS[1]).toEqual({
    value: "30",
    label: "30 days",
    days: 30,
    description: "Last month",
  });

  expect(PERIODS[2]).toEqual({
    value: "365",
    label: "12 months",
    days: 365,
    description: "Last year",
  });

  expect(PERIODS[3]).toEqual({
    value: "all",
    label: "All",
    days: "all",
    description: "All time",
  });
});

test("DEFAULT_PERIOD is 30", () => {
  expect(DEFAULT_PERIOD).toBe("30");
});

test("getPeriodConfig() returns correct period by value", () => {
  const period7 = getPeriodConfig("7");
  expect(period7.value).toBe("7");
  expect(period7.label).toBe("7 days");
  expect(period7.days).toBe(7);

  const period30 = getPeriodConfig("30");
  expect(period30.value).toBe("30");
  expect(period30.label).toBe("30 days");
  expect(period30.days).toBe(30);

  const period365 = getPeriodConfig("365");
  expect(period365.value).toBe("365");
  expect(period365.label).toBe("12 months");
  expect(period365.days).toBe(365);

  const periodAll = getPeriodConfig("all");
  expect(periodAll.value).toBe("all");
  expect(periodAll.label).toBe("All");
  expect(periodAll.days).toBe("all");
});

test("getPeriodConfig() returns default for invalid value", () => {
  const period = getPeriodConfig("invalid");
  expect(period.value).toBe("30");
  expect(period.label).toBe("30 days");
  expect(period.days).toBe(30);
});

test("getPeriodDays() returns correct days", () => {
  expect(getPeriodDays("7")).toBe(7);
  expect(getPeriodDays("30")).toBe(30);
  expect(getPeriodDays("365")).toBe(365);
  expect(getPeriodDays("all")).toBe("all");
});

test("isPeriodValue() validates period values", () => {
  expect(isPeriodValue("7")).toBe(true);
  expect(isPeriodValue("30")).toBe(true);
  expect(isPeriodValue("365")).toBe(true);
  expect(isPeriodValue("all")).toBe(true);
  expect(isPeriodValue("invalid")).toBe(false);
  expect(isPeriodValue("")).toBe(false);
});

test("getAllPeriodValues() returns all period values", () => {
  const values = getAllPeriodValues();
  expect(values).toEqual(["7", "30", "365", "all"]);
});

test("generatePeriodStaticParams() generates correct params", () => {
  const params = generatePeriodStaticParams();

  expect(params).toHaveLength(4);
  expect(params[0]).toEqual({ period: "7" });
  expect(params[1]).toEqual({ period: "30" });
  expect(params[2]).toEqual({ period: "365" });
  expect(params[3]).toEqual({ period: "all" });
});

test("uiConfig has correct structure", () => {
  expect(uiConfig.periods.values).toBe(PERIODS);
  expect(uiConfig.periods.default).toBe(DEFAULT_PERIOD);
  expect(uiConfig.periods.helpers.getPeriodConfig).toBe(getPeriodConfig);
  expect(uiConfig.periods.helpers.getPeriodDays).toBe(getPeriodDays);
  expect(uiConfig.periods.helpers.isPeriodValue).toBe(isPeriodValue);
  expect(uiConfig.periods.helpers.getAllPeriodValues).toBe(getAllPeriodValues);
  expect(uiConfig.periods.helpers.generatePeriodStaticParams).toBe(
    generatePeriodStaticParams
  );
});

test("uiConfig has correct theme configuration", () => {
  expect(uiConfig.theme.default).toBe("system");
  expect(uiConfig.theme.colors.light.background).toBe("#ffffff");
  expect(uiConfig.theme.colors.light.foreground).toBe("#000000");
  expect(uiConfig.theme.colors.dark.background).toBe("#000000");
  expect(uiConfig.theme.colors.dark.foreground).toBe("#ffffff");
  expect(uiConfig.theme.transition.duration).toBe("1000ms");
  expect(uiConfig.theme.transition.easing).toBe("ease-in-out");
});

test("uiConfig has correct navigation configuration", () => {
  const nav = uiConfig.navigation.insights;
  expect(nav).toHaveLength(5);
  expect(nav[0].label).toBe("Overview");
  expect(nav[0].href).toBe("/");
  expect(nav[1].label).toBe("GitHub");
  expect(nav[2].label).toBe("Blog");
  expect(nav[3].label).toBe("WakaTime");
  expect(nav[4].label).toBe("AI Usage");
});

test("uiConfig has correct static configuration", () => {
  expect(uiConfig.static.revalidate).toBe(3600);
  expect(uiConfig.static.dynamic).toBe("force-static");
});

test("uiConfig has correct layout configuration", () => {
  expect(uiConfig.layout.container.maxWidth).toBe("1200px");
  expect(uiConfig.layout.container.padding.mobile).toBe("1rem");
  expect(uiConfig.layout.container.padding.desktop).toBe("2rem");
  expect(uiConfig.layout.spacing.section).toBe("2rem");
  expect(uiConfig.layout.spacing.component).toBe("1rem");
});

test("uiConfig has correct animation configuration", () => {
  expect(uiConfig.animation.duration.fast).toBe(150);
  expect(uiConfig.animation.duration.normal).toBe(300);
  expect(uiConfig.animation.duration.slow).toBe(500);
  expect(uiConfig.animation.easing.ease).toBe("ease");
  expect(uiConfig.animation.easing.easeIn).toBe("ease-in");
  expect(uiConfig.animation.easing.easeOut).toBe("ease-out");
  expect(uiConfig.animation.easing.easeInOut).toBe("ease-in-out");
});
