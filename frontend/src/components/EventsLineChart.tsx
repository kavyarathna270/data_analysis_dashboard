import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { DayStat } from '../types'

interface Props { data: DayStat[] }

export const EventsLineChart = ({ data }: Props) => (
  <div className="bg-white rounded-2xl shadow p-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-4">
      EVENTS OVER TIME
    </h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)} // show MM-DD only
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)