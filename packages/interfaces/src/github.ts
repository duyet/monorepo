export interface GithubRepo {
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  archived: boolean;
  disabled: boolean;
}
