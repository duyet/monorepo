declare namespace NodeJS {
  export interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_AUTH0_DOMAIN: string;
    readonly NEXT_PUBLIC_AUTH0_CLIENT_ID: string;
    readonly NEXT_PUBLIC_BASE_URL: string;
    readonly NEXT_PUBLIC_DUYET_BLOG_URL: string;
    readonly NEXT_PUBLIC_DUYET_INSIGHTS_URL: string;
    readonly NEXT_PUBLIC_DUYET_CV_URL: string;
  }
}
