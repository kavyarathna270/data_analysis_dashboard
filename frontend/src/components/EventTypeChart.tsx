import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { EventTypeStat } from '../types'

interface Props {
  data: EventTypeStat[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff']

export const EventTypeChart = ({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">
          EVENTS BY TYPE
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
          No data yet
        </div>
      </div>
    )
  }

  const coloredData = data.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        EVENTS BY TYPE
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={coloredData}
            dataKey="count"
            nameKey="eventType"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(entry) =>
              `${entry.eventType} ${((entry.percent ?? 0) * 100).toFixed(0)}%`
            }
          />
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}