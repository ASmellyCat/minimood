'use client'

import { useMemo, useState } from 'react'
import LineChartComponent from './LineChartComponent'
import KeywordBubbleChart from './KeywordBubbleChart'
import EmotionBarChart from './EmotionBarChart'
import dayjs from 'dayjs'

type Mood = {
  id: string
  mood_score: number
  created_at: string
  keywords?: string[]
  emotion_category?: string
}

type Props = {
  moods: Mood[]
}

export default function ChartTabContent({ moods }: Props) {
  const [range, setRange] = useState<'7' | '30' | '365' | 'all'>('30')

  const filteredMoods = useMemo(() => {
    if (range === 'all') return moods
    const days = parseInt(range, 10)
    const cutoff = dayjs().subtract(days, 'day')
    return moods.filter(m => dayjs(m.created_at).isAfter(cutoff))
  }, [moods, range])

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto space-y-16">
      <LineChartComponent moods={filteredMoods} range={range} />
      <KeywordBubbleChart range={range} />
      <EmotionBarChart moods={moods} range={range} setRange={setRange} />
    </section>
  )
}