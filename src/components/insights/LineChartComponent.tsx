'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type Props = {
  range: '7' | '30' | '365' | 'all'
  setRange: (r: '7' | '30' | '365' | 'all') => void
}

type TrendPoint = {
  date: string
  score: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const emojiTicks = [
  { value: 0, label: '😢' },
  { value: 2.5, label: '☹️' },
  { value: 5, label: '😐' },
  { value: 7.5, label: '🙂' },
  { value: 10, label: '😄' },
]

export default function LineChartComponent({ range, setRange }: Props) {
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true)
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return

      const res = await fetch('/api/emotion-trend-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, range })
      })

      const json = await res.json()
      if (res.ok && json.trend_points) {
        setData(json.trend_points)
      }

      setLoading(false)
    }

    fetchTrend()
  }, [range])

  const ranges: { label: string; value: '7' | '30' | '365' | 'all' }[] = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '1 Year', value: '365' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className="bg-white rounded-xl px-6 py-6 shadow-md w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-orange-600 tracking-tight">
          Mood Trend ({range === 'all' ? 'All Time' : `Last ${range} Days`})
        </h2>
        <div className="flex gap-2 flex-wrap">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition
                ${
                  range === r.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading || data.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          {loading ? 'Loading mood trend...' : 'No mood data available for this range.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#444' }}
              angle={-30}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 10]}
              ticks={emojiTicks.map((t) => t.value)}
              tickFormatter={(val) => emojiTicks.find(t => t.value === val)?.label || val}
              tick={{ fontSize: 16 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', borderRadius: 8 }}
              formatter={(val: number) => [`Score: ${val}`, '']}
              labelStyle={{ color: '#888' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
