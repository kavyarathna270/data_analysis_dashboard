import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { PageStat } from '../types'

interface Props { data: PageStat[] }

export const TopPagesChart = ({ data }: Props) => (
  <div className="bg-white rounded-2xl shadow p-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-4">TOP PAGES</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          dataKey="page"
          type="category"
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip />
        <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)