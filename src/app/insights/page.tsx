'use client'

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { getUserMoods } from '@/lib/get-moods'
import { groupMoodsByYearMonth } from '@/lib/group-moods'
import { useRouter } from 'next/navigation'


type Mood = {
  id: string
  mood_text: string
  mood_score: number
  created_at: string
}

export default function InsightsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const [moods, setMoods] = useState<Mood[]>([])
  const [loading, setLoading] = useState(true)

  const recentMoods = moods.slice(0, 5)
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
      <h1 className="text-3xl font-semibold text-center pt-10 text-indigo-700 tracking-wide">
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


      <div className="flex justify-center mt-6">
        <Tabs defaultValue="chart" className="w-fit">
          <TabsList className="bg-white/80 backdrop-blur-md rounded-lg shadow-md p-1">
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
              🧠 AI Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <div className="text-center text-gray-500 mt-12">Chart coming soon...</div>
          </TabsContent>
          <TabsContent value="ai">
            <div className="text-center text-gray-500 mt-12">AI insights loading...</div>
          </TabsContent>
        </Tabs>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="left">
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            className="fixed top-6 left-6 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 shadow-lg rounded-lg transition"
            onMouseEnter={() => setDrawerOpen(true)}
          >
            📘 View Logs
          </Button>
        </DrawerTrigger>

        <DrawerContent className="p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <DrawerTitle className="text-lg text-indigo-700 mb-4 font-bold">
            Mood Journal Logs
          </DrawerTitle>

          <ScrollArea className="h-[80vh] pr-2 space-y-8">
            {/* ✅ Recently */}
            <section>
              <h2 className="font-semibold text-gray-800 mb-2">🕒 Recently</h2>
              <div className="space-y-3">
                {recentMoods.map((mood) => (
                  <div
                    key={mood.id}
                    className="bg-gray-100 p-3 rounded-md border border-gray-200 shadow-sm"
                  >
                    <p className="text-sm text-gray-700 truncate">{mood.mood_text}</p>
                    <p className="text-xs text-gray-500">
                      Score: {mood.mood_score} —{' '}
                      {new Date(mood.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ✅ Archives */}
            <section>
              <h2 className="font-semibold text-gray-800 mb-2">📂 Archives</h2>
              <div className="space-y-2">
                {Object.entries(groupedMoods).map(([year, months]) => (
                  <details key={year} className="border border-gray-300 rounded-md">
                    <summary className="cursor-pointer px-3 py-2 bg-gray-100 font-medium flex items-center justify-between">
                      {year} <ChevronDownIcon />
                    </summary>
                    <div className="pl-4 py-2 space-y-2">
                      {Object.entries(months).map(([month, logs]) => (
                        <details key={month} className="pl-2 border-l-2 border-gray-300">
                          <summary className="cursor-pointer py-1 text-sm font-medium text-gray-700">
                            {month}
                          </summary>
                          <div className="pl-4 space-y-1 text-sm text-gray-600">
                            {logs.map((log) => (
                              <div key={log.id}>
                                📅{' '}
                                {new Date(log.created_at).toLocaleDateString()} — "
                                {log.mood_text.slice(0, 30)}..." (Score:{' '}
                                {log.mood_score})
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
