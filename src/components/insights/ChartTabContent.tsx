'use client' 

import LineChartComponent from './LineChartComponent'

type Mood = {
  id: string
  mood_score: number
  created_at: string
}

type Props = {
  moods: Mood[]
}

export default function ChartTabContent({ moods }: Props) {
  return (
    <section className="py-10 px-4 max-w-4xl mx-auto space-y-12">
      {/* Chart 1: Line Chart - Mood Score Trend */}
      <LineChartComponent moods={moods} />

      {/* Future charts can be added here, vertically stacked */}
      {/* <BarChartComponent moods={moods} /> */}
      {/* <RadarChartComponent moods={moods} /> */}
    </section>
  )
}