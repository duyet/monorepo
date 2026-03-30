export interface GithubUser {
  login: string;
  avatar_url: string;
}

export interface GithubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  archived: boolean;
  disabled: boolean;
  owner: GithubUser;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  size: number;
  private: boolean;
}
