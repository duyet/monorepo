import { getWakaTimeActivity } from './wakatime-utils'
import { BarChart } from '@/components/charts'

export async function WakaTimeActivity() {
  const codingActivity = await getWakaTimeActivity()

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Coding Hours Trend</h3>
        <p className="text-xs text-muted-foreground">Daily programming activity</p>
      </div>
      <BarChart
        categories={['Coding Hours']}
        data={codingActivity}
        index="range.date"
      />
    </div>
  )
}