export interface CommitActivity extends Record<string, unknown> {
  date: string;
  commits: number;
  week: number;
}

export interface CommitStats {
  totalCommits: number;
  avgCommitsPerWeek: number;
  mostActiveDay: string;
  commitHistory: CommitActivity[];
}

export interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: {
    commits?: unknown[];
  };
}
