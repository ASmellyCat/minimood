'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import AITabContent from '@/components/insights/AITabContent'
import ChartTabContent from '@/components/insights/ChartTabContent'
import LogDrawer from '@/components/insights/LogDrawer'

import { getUserMoods } from '@/lib/get-moods'
import { groupMoodsByYearMonth } from '@/lib/group-moods'

type Mood = {
  id: string
  mood_text: string
  mood_score: number
  created_at: string
}

export default function InsightsPage() {
  const router = useRouter()
  const [moods, setMoods] = useState<Mood[]>([])
  const [loading, setLoading] = useState(true)

  const groupedMoods = groupMoodsByYearMonth(moods)

  useEffect(() => {
    async function fetchData() {
      try {
        const allMoods = await getUserMoods()
        setMoods(allMoods)
      } catch (err) {
        console.error('Error loading moods:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative">
      <h1 className="text-4xl font-bold text-center pt-10 text-indigo-800 tracking-wide">
        Insights in Bloom 🌿
      </h1>

      <div className="absolute top-4 right-4 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Back to Home
        </Button>
      </div>

      <div className="flex justify-center mt-8">
        <Tabs defaultValue="chart" className="w-fit">
          <TabsList className="bg-white/80 backdrop-blur-md rounded-lg shadow p-1">
            <TabsTrigger
              value="chart"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md px-4 py-2"
            >
              📈 Chart View
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md px-4 py-2"
            >
              🧠 Insight of you
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <ChartTabContent moods={moods}/>
          </TabsContent>
          <TabsContent value="ai">
            <AITabContent />
          </TabsContent>
        </Tabs>
      </div>

      <LogDrawer moods={moods} groupedMoods={groupedMoods} />
    </div>
  )
}
