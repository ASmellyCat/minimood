'use client'

import { useMemo } from 'react'
import dayjs from 'dayjs'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'

const EMOTION_COLORS: Record<string, string> = {
  Excited: '#f4a261',
  Satisfied: '#2a9d8f',
  Neutral: '#a8a8a8',
  Anxiety: '#6a4c93',
  Sadness: '#264653',
  Anger: '#e76f51',
}

export default function EmotionBarChart({
  moods,
  range,
  setRange
}: {
  moods: { emotion_category?: string; created_at?: string }[]
  range: string
  setRange: (r: '7' | '30' | '365' | 'all') => void
}) {
  const chartData = useMemo(() => {
    const now = dayjs()
    const filtered = moods.filter(({ created_at }) => {
      if (!created_at || range === 'all') return true
      const days = parseInt(range, 10)
      return dayjs(created_at).isAfter(now.subtract(days, 'day'))
    })

    const countMap: Record<string, number> = {}

    filtered.forEach(({ emotion_category }) => {
      if (!emotion_category) return
      countMap[emotion_category] = (countMap[emotion_category] || 0) + 1
    })

    const total = Object.values(countMap).reduce((a, b) => a + b, 0)
    const maxPercentage = Math.max(...Object.values(countMap).map(c => (c / total) * 100))

    return {
      data: Object.entries(countMap).map(([emotion, count]) => ({
        emotion,
        percentage: parseFloat(((count / total) * 100).toFixed(2))
      })),
      max: Math.ceil(maxPercentage / 10) * 10
    }
  }, [moods, range])

  const ranges = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '1 Year', value: '365' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-6 shadow-inner">
      <h2 className="text-2xl font-bold text-orange-500 mb-4 text-center">Emotion Category Frequency</h2>
      <div className="flex justify-center items-center mb-4 gap-2">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value as any)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition
              ${range === r.value ? 'bg-indigo-600 text-white' : 'bg-white/20 text-indigo-800 hover:bg-white/30'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData.data} layout="vertical">
          <XAxis
            type="number"
            domain={[0, chartData.max]}
            tickFormatter={(val) => `${val}%`}
            stroke="#333"
            tick={{ fill: '#222', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
          />
          <YAxis
            dataKey="emotion"
            type="category"
            width={100}
            stroke="#333"
            tick={{ fill: '#222', fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
          />
          <Tooltip formatter={(val: any) => `${val}%`} />
          <Bar dataKey="percentage" radius={[10, 10, 10, 10]}>
            {chartData.data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={EMOTION_COLORS[entry.emotion] || '#8884d8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
