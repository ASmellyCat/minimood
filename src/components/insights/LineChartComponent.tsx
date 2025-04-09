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
import { useMemo, useState } from 'react'

type Mood = {
  id: string
  mood_score: number
  created_at: string
}

type Props = {
  moods: Mood[]
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) // e.g., Apr 2025
}

// Group moods by YYYY-MM or biweekly key
function groupMoods(moods: Mood[], granularity: 'daily' | 'biweekly' | 'monthly') {
  const groups: Record<string, number[]> = {}

  moods.forEach((mood) => {
    const date = new Date(mood.created_at)
    let key: string

    if (granularity === 'daily') {
      key = date.toLocaleDateString()
    } else if (granularity === 'biweekly') {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const half = date.getDate() <= 15 ? '1' : '2'
      key = `${year}-${month < 10 ? '0' + month : month}-${half}`
    } else {
      key = formatDateLabel(date)
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(mood.mood_score)
  })

  const sorted = Object.entries(groups).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())

  return sorted.map(([label, scores]) => ({
    date: label,
    score: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
  }))
}

export default function LineChartComponent({ moods = [] }: Props) {
  const [range, setRange] = useState<'7' | '30' | '365' | 'all'>('30')

  const chartData = useMemo(() => {
    if (!moods.length) return []

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const allValid = moods.filter((m) => new Date(m.created_at) <= today)
    const firstDate = new Date(Math.min(...allValid.map((m) => new Date(m.created_at).getTime())))

    let filtered = [...allValid]

    const now = new Date()
    const dateLimit = new Date()

    if (range !== 'all') {
      const days = parseInt(range)
      dateLimit.setDate(now.getDate() - days)
      filtered = allValid.filter((m) => new Date(m.created_at) >= dateLimit)
    }

    const spanDays = (now.getTime() - (range === 'all' ? firstDate.getTime() : dateLimit.getTime())) / (1000 * 60 * 60 * 24)

    const granularity =
      spanDays <= 30 ? 'daily' :
      spanDays <= 365 ? 'biweekly' : 'monthly'

    return groupMoods(filtered, granularity)
  }, [moods, range])

  const ranges = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '1 Year', value: '365' },
    { label: 'All', value: 'all' },
  ]

  const emojiTicks = [
    { value: 0, label: '😢' },
    { value: 2.5, label: '☹️' },
    { value: 5, label: '😐' },
    { value: 7.5, label: '🙂' },
    { value: 10, label: '😄' },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-extrabold text-orange-600 tracking-tight">
          Mood Trend ({range === 'all' ? 'All Time' : `Last ${range} Days`})
        </h2>
        <div className="flex gap-2 flex-wrap">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value as any)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition
                ${
                  range === r.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/20 text-orange-700 hover:bg-white/30'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          No mood data available for this range.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#555' }}
              interval="preserveStartEnd"
              angle={-30}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 10]}
              ticks={emojiTicks.map((t) => t.value)}
              tickFormatter={(val) => {
                const found = emojiTicks.find((t) => t.value === val)
                return found ? found.label : val
              }}
              tick={{ fontSize: 16 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', borderRadius: 8 }}
              formatter={(value: any) => [`Score: ${value}`, '']}
              labelStyle={{ color: '#888' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
