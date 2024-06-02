# Duyet Insights

- **Live: https://insights.duyet.net**
- **Live: https://duyet-insights.vercel.app**

## Deployment

If you would like to deploy your own instance of the blog, follow these instructions:

### `1` Clone the repository:

```bash
git clone https://github.com/duyet/monorepo.git

```

### `2` Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

or clone from Vercel deploy

```bash
vercel env pull .env.local
```

### `5` Configuring Cloudflare

Follow this to create Cloudflare API key:
https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/api-key-auth/

- `NEXT_PUBLIC_CLOUDFLARE_API_KEY`: Cloudflare API Key
- `NEXT_PUBLIC_CLOUDFLARE_ZONE_ID`: Cloudflare Zone, see https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/find-account-and-zone-ids/

## Deploy Your Local Project

To deploy your local project to Vercel, push it to GitHub/GitLab/Bitbucket
and [import to Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=upstash-roadmap).

**Important**: When you import your project on Vercel, make sure to click on **Environment Variables** and set them to
match your `.env.local` file.
