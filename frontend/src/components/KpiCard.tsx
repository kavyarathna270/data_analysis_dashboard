interface Props {
  title: string
  value: number | string
  subtitle?: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
}

export const KpiCard = ({ title, value, subtitle, color }: Props) => (
  <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2">
    <div className={`w-10 h-10 rounded-xl ${colorMap[color]} opacity-80`} />
    <p className="text-sm text-gray-500 mt-2">{title}</p>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
  </div>
)