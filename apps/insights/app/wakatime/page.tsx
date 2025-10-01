import { PageLayout, SectionLayout } from '@/components/layouts'
import type { PeriodDays } from '@/lib/periods'
import { DEFAULT_PERIOD, getPeriodDays } from '@/lib/periods'
import Image from 'next/image'
import { StaticCard } from '../../components/StaticCard'
import { WakaTimeActivity } from './activity'
import { WakaTimeLanguages } from './languages'
import { WakaTimeMetrics } from './metrics'

export const metadata = {
  title: 'WakaTime Coding Analytics @duyet',
  description:
    'Programming activity, language statistics, and coding insights from WakaTime',
}

// Static generation only
export const dynamic = 'force-static'

const STATIC_DAYS: PeriodDays = getPeriodDays(DEFAULT_PERIOD) as PeriodDays

export default function Wakatime() {
  return (
    <PageLayout
      title="Coding Analytics"
      description="Programming activity and language statistics from WakaTime"
      footer={
        <p className="text-xs text-muted-foreground">
          Data from WakaTime • Updated daily
        </p>
      }
    >
      <SectionLayout
        title="Coding Overview"
        description="Programming activity summary for the last 30 days"
      >
        <WakaTimeMetrics days={STATIC_DAYS} />
      </SectionLayout>

      <SectionLayout
        title="Daily Activity"
        description="Coding hours over the last 30 days"
      >
        <WakaTimeActivity days={STATIC_DAYS} />
      </SectionLayout>

      <SectionLayout
        title="Programming Languages"
        description="Language usage and distribution"
      >
        <WakaTimeLanguages days={STATIC_DAYS} />
      </SectionLayout>

      <SectionLayout
        title="Yearly Activity"
        description="Annual coding activity heatmap"
      >
        <div className="rounded-lg border bg-card p-4">
          <StaticCard
            extra={
              <Image
                alt="Wakatime Badge"
                className="mt-3"
                height={30}
                src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
                unoptimized
                width={200}
              />
            }
            source="WakaTime (Last Year)"
            title="Coding Activity Heatmap"
            url={{
              light:
                'https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg',
              dark: 'https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg',
            }}
          />
        </div>
      </SectionLayout>
    </PageLayout>
  )
}
