export interface PostHogDataByPeriod {
  totalVisitors: number;
  totalViews: number;
  avgVisitorsPerPage: number;
  paths: Array<{ path: string; visitors: number }>;
  generatedAt: string;
}
