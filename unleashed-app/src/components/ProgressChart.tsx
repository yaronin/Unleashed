import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface ProgressChartProps {
  data: { date: string; reps?: number; duration_sec?: number }[]
  metric: 'reps' | 'duration_sec'
}

export function ProgressChart({ data, metric }: ProgressChartProps) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-slate-500">Log workouts to see trends</p>
  }

  const key = metric
  const label = metric === 'reps' ? 'Reps' : 'Seconds'

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Line type="monotone" dataKey={key} name={label} stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
