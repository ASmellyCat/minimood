'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type EmotionBarChartProps = {
  moods: {
    id: string
    mood_score: number
    created_at: string
    keywords?: string[]
    emotion_category?: string
  }[]
  range: '7' | '30' | '365' | 'all'
  setRange: React.Dispatch<React.SetStateAction<'7' | '30' | '365' | 'all'>>
}


type EmotionData = {
  emotion: string
  percentage: number
}

const EMOTION_COLORS: Record<string, string> = {
  Excited: '#f4a261',
  Satisfied: '#2a9d8f',
  Neutral: '#a8a8a8',
  Anxiety: '#6a4c93',
  Sadness: '#264653',
  Anger: '#e76f51',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EmotionBarChart({ moods, range, setRange }: EmotionBarChartProps) {
  const [data, setData] = useState<EmotionData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return

      const res = await fetch('/api/emotion-category-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, range }),
      })

      const json = await res.json()
      if (res.ok && json.category_freq) {
        const total = Object.values(json.category_freq).reduce((a: number, b: number) => a + b, 0)
        const parsed = Object.entries(json.category_freq).map(([emotion, count]) => ({
          emotion,
          percentage: parseFloat(((count / total) * 100).toFixed(2)),
        }))
        setData(parsed)
      }

      setLoading(false)
    }

    fetchData()
  }, [range])

  const max = Math.ceil(Math.max(...data.map(d => d.percentage), 10) / 10) * 10

  const ranges: { label: string; value: '7' | '30' | '365' | 'all' }[] = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '1 Year', value: '365' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className="bg-white rounded-xl px-6 py-6 shadow-md w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-600 mb-4 text-center">
        Emotion Category Frequency
      </h2>

      <div className="flex justify-center items-center mb-4 gap-2">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition
              ${range === r.value ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading || data.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          {loading ? 'Loading emotion data...' : 'No emotion data available.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} layout="vertical">
            <XAxis
              type="number"
              domain={[0, max]}
              tickFormatter={(val) => `${val}%`}
              tick={{ fontSize: 12, fill: '#333' }}
            />
            <YAxis
              type="category"
              dataKey="emotion"
              width={100}
              tick={{ fontSize: 13, fill: '#222', fontWeight: 500 }}
            />
            <Tooltip
              formatter={(value: number | string) => `${value}%`}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Bar dataKey="percentage" radius={[10, 10, 10, 10]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={EMOTION_COLORS[entry.emotion] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
