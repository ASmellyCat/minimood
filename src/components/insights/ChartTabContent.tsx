'use client'

import LineChartComponent from './LineChartComponent'
import KeywordBubbleChart from './KeywordBubbleChart'
import EmotionBarChart from './EmotionBarChart'
import { useState } from 'react'

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

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto space-y-16">
      <LineChartComponent moods={moods} range={range} />
      <KeywordBubbleChart range={range} />
      <EmotionBarChart moods={moods} range={range} setRange={setRange} />
    </section>
  )
}