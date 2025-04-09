'use client'

import { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'

const EMOTION_COLORS: Record<string, string> = {
  Excited: '#f59e0b',
  Satisfied: '#10b981',
  Neutral: '#6b7280',
  Anxiety: '#6366f1',
  Sadness: '#3b82f6',
  Anger: '#ef4444',
}

export default function EmotionBarChart({
  moods,
  range,
  setRange
}: {
  moods: { emotion_category?: string }[]
  range: string
  setRange: (r: '7' | '30' | '365' | 'all') => void
}) {
  const chartData = useMemo(() => {
    const countMap: Record<string, number> = {}

    moods.forEach(({ emotion_category }) => {
      if (!emotion_category) return
      countMap[emotion_category] = (countMap[emotion_category] || 0) + 1
    })

    const total = Object.values(countMap).reduce((a, b) => a + b, 0)

    return Object.entries(countMap).map(([emotion, count]) => ({
      emotion,
      percentage: parseFloat(((count / total) * 100).toFixed(2))
    }))
  }, [moods])

  const ranges = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '1 Year', value: '365' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
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
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
          <YAxis dataKey="emotion" type="category" width={100} />
          <Tooltip formatter={(val: any) => `${val}%`} />
          <Legend />
          <Bar dataKey="percentage" isAnimationActive fill="#6366f1">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion] || '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}