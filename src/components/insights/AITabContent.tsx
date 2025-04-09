'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Summary = {
  analysis: string
  suggestion: string
  encouragement: string
}

export default function AIInsightBlock() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        setError('Not logged in')
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/insight-summary-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })

        const json = await res.json()

        if (!res.ok) throw new Error(json.error || 'Unknown error')
        if (!json.summary) throw new Error('No summary found')

        setSummary(json.summary)
      } catch (err: any) {
        console.error('[AIInsightBlock] ❌', err)
        setError(err.message || 'Failed to fetch summary')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-500 text-sm">Loading AI analysis...</p>
  }

  if (error) {
    return <p className="text-center text-red-500 text-sm">Error: {error}</p>
  }

  if (!summary) {
    return <p className="text-center text-gray-400 text-sm">No analysis data available.</p>
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      <InsightCard label="analysis" content={summary.analysis} />
      <InsightCard label="suggestion" content={summary.suggestion} />
      <InsightCard label="encouragement" content={summary.encouragement} />
    </div>
  )
}

function InsightCard({ label, content }: { label: string; content: string }) {
  const titleMap: Record<string, string> = {
    analysis: 'Reflections from Within',
    suggestion: 'A Gentle Nudge for You',
    encouragement: 'A Whisper of Encouragement',
  }

  return (
    <div
      className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 
      text-gray-800 dark:text-gray-200 shadow-xl hover:shadow-2xl 
      transition-all duration-300 animate-floating hover:animate-none"
    >
      <h3
        className="text-2xl font-semibold mb-3 tracking-wide text-orange-500"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {titleMap[label]}
      </h3>
      <p
        className="text-[18px] leading-8 text-gray-700 dark:text-gray-100"
        style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}
      >
        {content}
      </p>
    </div>
  )
}
