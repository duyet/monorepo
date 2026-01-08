# AI Code Percentage Analyzer - Work Plan

## Overview
Create a single-page application that tracks and displays the percentage of code written by AI versus humans across all GitHub repositories over time.

## Vision
- **Big bold percentage** at center of page showing current AI code percentage
- **Simple line charts** showing the changing dominance of AI vs human code over time
- **Clean, minimal UI** inspired by modern analytics dashboards

## Phase 1: Research & Design (Completed)

### 1.1 Architecture Analysis
✅ Reviewed existing infrastructure:
- **data-sync app**: Has BaseSyncer pattern, ClickHouse integration, existing GitHub syncer
- **insights app**: Uses Recharts, has ClickHouse client, SWR for data fetching
- **AI usage data**: Already exists in insights app (from ccusage-import)
- **GitHub syncer**: Already fetches contribution data

### 1.2 AI Detection Research

Based on research and best practices, AI-authored code can be detected through:

**Primary Methods:**
1. **Co-author signatures** in commit messages
   - Pattern: `Co-authored-by: bot-name <bot@users.noreply.github.com>`
   - GitHub Apps like Copilot, GitHub Actions, dependabot use this format
   - Most reliable for tracking AI/bot contributions

2. **Author email domains**
   - GitHub bots: `*@users.noreply.github.com`
   - AI services: `*@claude.ai`, `*@openai.com`, etc.
   - Third-party bots: specific patterns

3. **Commit message patterns**
   - Contains `[bot]`, `[auto]`, `[ci]` prefixes
   - AI-generated commit signatures
   - Automated tool markers

**Challenges & Limitations:**
- GitHub REST/GraphQL API doesn't provide explicit "AI-authored" field
- Humans using AI assistants may not be tagged
- Co-author signatures only present for explicit collaborations
- Some AI tools don't add co-author tags
- **Conclusion**: This will track "AI/bot co-authored code" as a proxy metric

**Recommended Detection Heuristics:**
```typescript
isAICode = (
  commit.hasCoAuthor || 
  commit.authorEmail.endsWith('@users.noreply.github.com') ||
  commit.message.includes('[bot]') ||
  commit.message.includes('[auto]')
)
```

### 1.3 Data Model Design

**ClickHouse Table Schema:**
```sql
CREATE TABLE monorepo_ai_code_percentage (
  date Date,
  username String,
  total_commits UInt32,
  human_commits UInt32,
  ai_commits UInt32,
  total_lines_added UInt64,
  human_lines_added UInt64,
  ai_lines_added UInt64,
  ai_percentage Float32,  -- (ai_lines_added / total_lines_added) * 100
  
  -- Metadata
  repo_count UInt32,
  sync_version UInt32 DEFAULT 1,
  is_deleted UInt8 DEFAULT 0,
  synced_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date, username)
PARTITION BY toYYYYMM(date)
TTL date + INTERVAL 2 YEAR;
```

**Data Calculation Logic:**
1. Fetch all commits from repositories (paginated)
2. For each commit, determine if AI-authored using heuristics
3. Calculate lines added/deleted per commit
4. Aggregate daily totals
5. Calculate percentage: `(ai_lines_added / total_lines_added) * 100`

### 1.4 UI/UX Design

**Page Structure:**
```
Header
├─ Title: "AI Code Usage"
└─ Subtitle: "Percentage of code written by AI across all repositories"

Main Display (Center)
├─ Giant Percentage: "42.3%"
│   ├─ "AI-written code" label
│   └─ "↑ 2.1% from last month" delta
└─ Secondary metrics
    ├─ Total lines analyzed: 1.2M
    ├─ AI lines: 508K
    └─ Human lines: 692K

Charts Section
├─ Line Chart: AI vs Human Code Over Time
│   ├─ X-axis: Date (last 365 days, customizable)
│   ├─ Y-axis: Lines of code
│   └─ Two lines: AI (purple), Human (blue)
└─ Trend Chart: AI Percentage Trend
    ├─ X-axis: Date
    ├─ Y-axis: Percentage (0-100%)
    └─ Single line with trend annotation

Footer
└─ "Last sync: [timestamp]" | "Method: Co-author & email detection"
```

**Color Scheme:**
- AI: Purple/Gradient (evocative of "magic" AI)
- Human: Blue/Teal (evocative of "natural" human)
- Background: Clean, minimal white/light gray
- Text: Dark gray for readability

**Interactivity:**
- Time range selector: 30d, 90d, 6m, 1y, all time
- Hover tooltips on charts
- Smooth animations on data load
- Responsive design (mobile-friendly)

## Phase 2: Implementation Plan

### 2.1 Backend - Data Sync Job

**File: `apps/data-sync/src/syncers/ai-code-percentage.syncer.ts`**

Tasks:
1. Extend `BaseSyncer` class
2. Implement `fetchFromApi()`:
   - Use GitHub GraphQL API to fetch repositories
   - For each repo, fetch commits (paginated)
   - Include: sha, message, author email, additions, deletions
3. Implement `transform()`:
   - Apply AI detection heuristics
   - Group by date (YYYY-MM-DD)
   - Calculate totals per date
4. Implement `getTableName()`: return "monorepo_ai_code_percentage"

**API Endpoints Used:**
- GitHub GraphQL: `user.repositories` (with commits)
- Pagination: Handle large repo sets (100+ repos)

**Performance Considerations:**
- Cache GitHub API responses
- Process in batches (100 repos at a time)
- Use incremental sync (fetch only commits since last sync date)

**Configuration:**
- Add to `apps/data-sync/src/config/sources.config.ts`:
```typescript
ai-code-percentage: {
  name: 'ai-code-percentage',
  enabled: true,
  schedule: '0 4 * * *', // Daily at 4am
  description: 'AI vs human code percentage analysis',
}
```

### 2.2 Database Migration

**File: `apps/data-sync/migrations/004_ai_code_percentage.sql`**

Create migration file with:
- UP: CREATE TABLE statement (see schema above)
- DOWN: DROP TABLE statement

**Run migration:**
```bash
cd apps/data-sync
bun run migrate:up
```

### 2.3 Backend - Data Querying

**File: `apps/data-sync/src/syncers/ai-code-percentage.syncer.ts`**

Add query helper functions (can be in insights app):
```typescript
// In apps/insights/lib/ai-code-percentage.ts or similar
export async function getAICodePercentage(days = 30) {
  const dateCondition = days === 'all' ? '' : `WHERE date > today() - INTERVAL ${days} DAY`;
  
  const query = `
    SELECT
      date,
      ai_percentage,
      total_lines_added,
      human_lines_added,
      ai_lines_added,
      total_commits,
      human_commits,
      ai_commits
    FROM monorepo_ai_code_percentage
    ${dateCondition}
    ORDER BY date ASC
  `;
  
  return await executeClickHouseQueryLegacy(query);
}

export async function getCurrentAICodePercentage() {
  const query = `
    SELECT
      ai_percentage,
      total_lines_added,
      human_lines_added,
      ai_lines_added
    FROM monorepo_ai_code_percentage
    ORDER BY date DESC
    LIMIT 1
  `;
  
  const results = await executeClickHouseQueryLegacy(query);
  return results[0] || null;
}
```

### 2.4 Frontend - Components

**Option A: Add to Insights App** (Recommended)

Create new page: `apps/insights/app/ai-percentage/page.tsx`

**Components to create:**

1. **`AIPercentageHero.tsx`**
   - Big percentage display
   - Delta indicator (vs last period)
   - Secondary metrics grid

2. **`AIPercentageChart.tsx`**
   - Use existing `AreaChart` component
   - Dual-line chart (AI vs Human)
   - Time range selector

3. **`AIPercentageTrend.tsx`**
   - Single line chart showing percentage over time
   - Trend annotation

**File Structure:**
```
apps/insights/app/ai-percentage/
├── page.tsx              # Main page
├── components/
│   ├── AIPercentageHero.tsx
│   ├── AIPercentageChart.tsx
│   └── AIPercentageTrend.tsx
├── utils/
│   └── queries.ts         # ClickHouse query functions
└── types.ts              # TypeScript types
```

**Option B: Separate App**

Create new app: `apps/ai-percentage/`

Pros:
- Simpler, focused domain
- Can use simpler UI patterns
- Easier to deploy independently

Cons:
- Duplicate infrastructure (ClickHouse client, etc.)
- Not consistent with existing apps
- More maintenance overhead

**Recommendation**: Use Option A (integrate into insights app)

### 2.5 Frontend - Data Fetching

Use SWR pattern (consistent with insights app):

```typescript
// apps/insights/app/ai-percentage/components/AIPercentageHero.tsx
import useSWR from 'swr';
import { getCurrentAICodePercentage } from '../utils/queries';

export function AIPercentageHero() {
  const { data, error, isLoading } = useSWR('ai-percentage-current', () => getCurrentAICodePercentage());
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  
  return (
    <div className="text-center py-12">
      <div className="text-8xl font-bold text-purple-600">
        {data.ai_percentage.toFixed(1)}%
      </div>
      <div className="text-xl text-muted-foreground mt-2">
        Code written by AI
      </div>
    </div>
  );
}
```

### 2.6 Styling & Animations

**CSS Requirements:**
- Use Tailwind CSS (already configured)
- Smooth transitions for percentage updates
- Gradient colors for AI visualization
- Responsive grid layouts
- Dark mode support (already in insights)

**Animations:**
- Fade-in on page load
- Number counting animation for percentage
- Smooth line chart transitions (Recharts handles this)
- Hover effects on metric cards

## Phase 3: Testing & Validation

### 3.1 Backend Testing

**Unit Tests:**
- AI detection heuristics
- Data transformation logic
- Date aggregation
- Percentage calculation

**Integration Tests:**
- ClickHouse insert operations
- GitHub API integration
- End-to-end sync job

**Test Data:**
- Create test commits with various signatures
- Verify detection accuracy
- Check edge cases (no data, 100% AI, 0% AI)

### 3.2 Frontend Testing

**Component Tests:**
- Render with loading state
- Render with error state
- Render with data
- Responsive design (mobile, tablet, desktop)

**E2E Tests:**
- Load page, verify data displays
- Change time range, verify chart updates
- Verify percentage calculation accuracy

### 3.3 Performance Testing

- ClickHouse query performance (< 1s)
- Page load time (< 2s)
- Chart rendering performance (smooth with 365+ data points)
- GitHub API rate limit handling

## Phase 4: Deployment & Monitoring

### 4.1 Deployment Checklist

- [ ] Sync job deployed (cron scheduled)
- [ ] Database migration applied
- [ ] Frontend code deployed to Vercel/Cloudflare
- [ ] Environment variables configured
- [ ] DNS records updated (ai-percentage.duyet.net)

### 4.2 Monitoring

**Metrics to track:**
- Sync job success/failure rate
- GitHub API quota usage
- ClickHouse query latency
- Page load times
- Error rates (ClickHouse connection, API failures)

**Alerts:**
- Sync job fails 3 consecutive times
- GitHub API rate limit reached
- ClickHouse query timeout
- Page error rate > 5%

## Phase 5: Iteration & Improvements

### 5.1 Future Enhancements

**Improved AI Detection:**
- Use GitHub Copilot metadata (if available via API)
- Analyze commit message patterns with ML
- Integrate with Claude Code usage data (cross-reference)

**Additional Visualizations:**
- Repository-level breakdown (which repos have highest AI %)
- Language-specific AI usage (Python vs TypeScript vs Rust)
- Time-of-day analysis (do humans code at different times than AI?)

**User Features:**
- Export data as CSV/JSON
- Shareable snapshots (e.g., "42.3% AI on Jan 8, 2026")
- Compare with other developers (anonymous benchmarking)

### 5.2 Known Limitations

**Metric Scope:**
- Tracks "AI/bot co-authored code", not "AI-assisted code"
- May undercount AI usage (AI assistants without co-authors)
- May overcount (some bot commits are automated, not AI)
- Doesn't account for AI-generated code copied/pasted by humans

**Accuracy Considerations:**
- Heuristic-based detection, not ground truth
- GitHub API limitations
- Co-author signatures are opt-in
- Email domain patterns may have false positives/negatives

## Estimated Timeline

- **Phase 1** (Research & Design): ✅ COMPLETED
- **Phase 2** (Implementation): 2-3 days
  - Backend sync job: 1 day
  - Migration & queries: 0.5 day
  - Frontend components: 1-1.5 days
- **Phase 3** (Testing): 1 day
- **Phase 4** (Deployment): 0.5 day
- **Phase 5** (Documentation): 0.5 day

**Total**: 4-5 days of focused development

## Technical Stack Summary

- **Backend**: TypeScript, Bun, ClickHouse
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Recharts
- **API**: GitHub GraphQL API
- **Data Storage**: ClickHouse (ReplacingMergeTree)
- **State Management**: SWR
- **Styling**: Tailwind CSS + custom animations
- **Testing**: Bun Test + Jest

## Questions for User

1. **App location**: Integrate into insights app or create separate `apps/ai-percentage`?
2. **Domain name**: Confirm `ai-percentage.duyet.net` or prefer `ai-usage.duyet.net`?
3. **Time range defaults**: Default to 30 days or 90 days?
4. **Detection accuracy**: Is "co-authored code" acceptable, or should we try more advanced detection?
5. **Frequency**: Daily sync ok, or need more frequent updates?

