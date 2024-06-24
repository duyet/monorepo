export interface GithubUser {
  login: string;
  avatar_url: string;
}

export interface GithubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  archived: boolean;
  disabled: boolean;
  owner: GithubUser;
}
