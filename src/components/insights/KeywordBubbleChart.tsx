'use client'

import { useEffect, useState } from 'react'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip } from 'recharts'
import * as d3 from 'd3'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

type KeywordData = {
  keyword: string
  frequency: number
  averageScore: number
  x: number
  y: number
}

export default function KeywordBubbleChart({ range }: { range: string }) {
  const [data, setData] = useState<KeywordData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
  
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
  
        if (error || !user) {
          throw new Error('User not authenticated')
        }
  
        const res = await fetch('/api/cluster-keywords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range,
            userId: user.id, // 👈 VERY IMPORTANT
          }),
        })
  
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Server error: ${res.status} - ${text}`)
        }
  
        const result = await res.json()
        setData(result.keywords || [])
      } catch (err) {
        console.error('❌ Failed to load clustered keywords:', err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [range])
  

  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([10, 1])
  const maxFreq = Math.max(...data.map(d => d.frequency), 1)

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-6">
      <h2 className="text-xl font-semibold text-indigo-700 mb-4">Keyword-Emotion Bubble Map</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading bubbles...</p>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart>
            <XAxis dataKey="x" type="number" hide />
            <YAxis dataKey="y" type="number" hide />
            <Tooltip
              formatter={(val, name, props) => [`Emotion Avg: ${props.payload.averageScore.toFixed(1)}`, props.payload.keyword]}
              contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '8px' }}
            />
            <Scatter
              data={data}
              shape={({ cx, cy, payload }) => {
                const radius = (payload.frequency / maxFreq) * 40 + 12
                const fillColor = colorScale(payload.averageScore)

                return (
                  <g>
                    <circle cx={cx} cy={cy} r={radius} fill={fillColor} opacity={0.7} />
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#fff">
                      {payload.keyword}
                    </text>
                  </g>
                )
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}