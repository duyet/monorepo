import { BarChart } from '@/components/charts'
import { getWakaTimeHourlyHeatmap } from './wakatime-utils'

export async function WakaTimeHourlyHeatmap() {
  const heatmapData = await getWakaTimeHourlyHeatmap()

  // Hide component completely if no data available
  if (!heatmapData || heatmapData.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-medium">Coding Activity by Day of Week</h3>
        <p className="text-xs text-muted-foreground">
          Weekly coding patterns based on last year of activity
        </p>
      </div>

      <div className="space-y-4">
        {/* Bar chart visualization */}
        <BarChart
          categories={['Hours']}
          data={heatmapData.map((item) => ({
            day: item.day,
            Hours: item.hours,
          }))}
          index="day"
        />

        {/* Heatmap-style grid visualization */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Activity Intensity
          </p>
          <div className="grid grid-cols-7 gap-2">
            {(() => {
              // Calculate maxHours once outside the map to avoid recalculation
              const maxHours = Math.max(...heatmapData.map((d) => d.hours))

              // Color scale function
              const getColorClass = (intensity: number) => {
                if (intensity >= 0.75) return 'bg-green-600 dark:bg-green-500'
                if (intensity >= 0.5) return 'bg-green-500 dark:bg-green-600'
                if (intensity >= 0.25) return 'bg-green-400 dark:bg-green-700'
                if (intensity > 0) return 'bg-green-300 dark:bg-green-800'
                return 'bg-gray-200 dark:bg-gray-800'
              }

              return heatmapData.map((item) => {
                // Calculate color intensity based on hours (normalized)
                const intensity = maxHours > 0 ? item.hours / maxHours : 0

                return (
                  <div
                    key={item.day}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`h-20 w-full rounded-md transition-colors ${getColorClass(intensity)}`}
                      title={`${item.day}: ${item.hours}h (${item.percent}%)`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.day.slice(0, 3)}
                    </span>
                    <span className="text-xs font-medium">{item.hours}h</span>
                  </div>
                )
              })
            })()}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-800" />
              <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="h-3 w-3 rounded-sm bg-green-500 dark:bg-green-600" />
              <div className="h-3 w-3 rounded-sm bg-green-600 dark:bg-green-500" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
