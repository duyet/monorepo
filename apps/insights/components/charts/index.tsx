// Export non-lazy versions for components that need direct access
export { AreaChart as AreaChartDirect } from "./AreaChart";
export { BarChart as BarChartDirect } from "./BarChart";
// Export other chart components (not lazy-loaded yet)
export { BarList } from "./BarList";
// Export CompactChart components for direct access (not lazy)
export {
  CompactAreaChart as CompactAreaChartDirect,
  CompactBarChart as CompactBarChartDirect,
  CompactLineChart as CompactLineChartDirect,
  CompactPieChart as CompactPieChartDirect,
  MiniSparkline as MiniSparklineDirect,
} from "./CompactChart";
export { DonutChart as DonutChartDirect } from "./DonutChart";
export { LanguageBarChart } from "./LanguageBarChart";
// Export lazy-loaded chart components for better performance
// These lazy versions automatically include loading states
export {
  AreaChart,
  BarChart,
  CompactAreaChart,
  CompactBarChart,
  CompactLineChart,
  CompactPieChart,
  DonutChart,
  MiniSparkline,
} from "./LazyCharts";
export { Legend } from "./legend";
export { TokenBarChart } from "./TokenBarChart";
