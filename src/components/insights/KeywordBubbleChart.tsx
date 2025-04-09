'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as d3 from 'd3'
import * as d3Force from 'd3-force'
import { useMockMode } from '@/lib/useMock'

const useMock = useMockMode()
console.log('[Mock Mode?]', useMock)


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const mockKeywords: KeywordData[] = [
  { keyword: 'project', frequency: 10, averageScore: 7.2 },
  { keyword: 'deadline', frequency: 6, averageScore: 3.5 },
  { keyword: 'family', frequency: 8, averageScore: 8.8 },
  { keyword: 'coffee', frequency: 4, averageScore: 6.2 },
  { keyword: 'rain', frequency: 5, averageScore: 4.4 },
]

type KeywordData = {
  keyword: string
  frequency: number
  averageScore: number
  created_at?: string
}

type PositionedKeyword = KeywordData & { x: number; y: number; r: number }

export default function KeywordBubbleChart() {
  const [range, setRange] = useState<'7' | '30' | '365' | 'all'>('30')
  const [data, setData] = useState<PositionedKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        let keywords: KeywordData[]
        if (useMock) {
          keywords = mockKeywords
        } else {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error || !user) throw new Error('User not authenticated')

          const res = await fetch('/api/cluster-keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ range, userId: user.id })
          })

          if (!res.ok) {
            const text = await res.text()
            throw new Error(`Server error: ${res.status} - ${text}`)
          }

          const raw = await res.json()
          keywords = raw.keywords || []
        }

        const maxFreq = Math.max(...keywords.map(k => k.frequency), 1)

        const nodes: PositionedKeyword[] = keywords.map(d => ({
          ...d,
          r: (d.frequency / maxFreq) * 60 + 30,
          x: Math.random() * 800,
          y: Math.random() * 500
        }))

        const simulation = d3Force.forceSimulation(nodes as any)
          .force('charge', d3Force.forceManyBody().strength(5))
          .force('center', d3Force.forceCenter(500, 300))
          .force('collision', d3Force.forceCollide().radius(d => (d as any).r + 4))
          .stop()

        for (let i = 0; i < 300; ++i) simulation.tick()

        setData(nodes)
      } catch (err) {
        console.error('❌ Failed to load clustered keywords:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [range, useMock])

  const colorScale = d3.scaleLinear<string>()
    .domain([0, 5, 10])
    .range(['#7b2cbf', '#cccccc', '#2b9348'])

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-8 shadow-inner relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-500 text-center w-full">Keyword-Emotion Bubble Map</h2>
        <div className="absolute right-8 top-6 flex gap-2">
          {['7', '30', '365', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition
                ${range === r ? 'bg-green-600 text-white' : 'bg-white/20 text-green-800 hover:bg-white/30'}`}
            >
              {r === 'all' ? 'All' : r === '365' ? '1 Year' : `${r} Days`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-8 mb-4 text-sm text-white">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: '#7b2cbf' }}></span>
          <span>😞 Low Mood</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: '#2b9348' }}></span>
          <span>😊 Positive Mood</span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center">Loading bubbles...</p>
      ) : (
        <svg ref={svgRef} viewBox="0 0 1000 600" className="w-full h-[600px]">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
            </filter>
            <style>
              {`
                .bubble:hover {
                  animation: jitter 0.5s 2 alternate ease-in-out;
                }
                @keyframes jitter {
                  0% { transform: translate(0px, 0px) rotate(0deg); }
                  25% { transform: translate(1.5px, -1px) rotate(-1deg); }
                  50% { transform: translate(-1px, 1.5px) rotate(1.5deg); }
                  75% { transform: translate(1px, -0.5px) rotate(-1deg); }
                  100% { transform: translate(-1.5px, 1px) rotate(0.5deg); }
                }
              `}
            </style>
          </defs>

          {data.map((d, i) => (
            <g key={i} className="bubble cursor-pointer" filter="url(#shadow)"
              onMouseEnter={() => setTooltip({ x: d.x, y: d.y, content: `${d.keyword} → ${d.averageScore.toFixed(1)}` })}
              onMouseLeave={() => setTooltip(null)}>
              <ellipse
                cx={d.x}
                cy={d.y}
                rx={d.r * 0.95}
                ry={d.r * 0.75}
                fill={colorScale(d.averageScore)}
                opacity={0.85}
              />
              <text
                x={d.x}
                y={d.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#fff"
                fontWeight={600}
                pointerEvents="none"
              >
                {d.keyword}
              </text>
            </g>
          ))}
        </svg>
      )}

      {tooltip && (
        <div
          className="absolute text-xs bg-white text-gray-800 px-3 py-1 rounded shadow border border-gray-200"
          style={{ top: tooltip.y, left: tooltip.x, transform: 'translate(-50%, -120%)' }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}
