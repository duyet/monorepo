export interface CloudflareDataByPeriod {
  totalRequests: number;
  totalPageviews: number;
  generatedAt: string;
  data: {
    viewer: {
      zones: Array<{
        httpRequests1dGroups: Array<{
          date: { date: string };
          sum: { pageViews: number; requests: number };
          uniq: { uniques: number };
        }>;
      }>;
    };
  };
}
