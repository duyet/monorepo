import { BarChart } from '@/components/charts'
import { getWakaTimeActivity } from './wakatime-utils'

export async function WakaTimeActivity({
  days = 30,
}: {
  days?: number | 'all'
}) {
  const codingActivity = await getWakaTimeActivity(days)

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Coding Hours Trend</h3>
        <p className="text-xs text-muted-foreground">
          Daily programming activity
        </p>
      </div>
      <BarChart
        categories={['Coding Hours']}
        data={codingActivity}
        index="range.date"
      />
    </div>
  )
}
