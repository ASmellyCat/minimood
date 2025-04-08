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
import { getUserMoods } from '@/lib/get-moods'
import { groupMoodsByYearMonth } from '@/lib/group-moods'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Clock, Archive, CalendarDays } from 'lucide-react'

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
              className="fixed top-6 left-6 bg-blue-400 text-white hover:bg-emerald-500 px-5 py-2 shadow-lg rounded-lg transition"
              onMouseEnter={() => setDrawerOpen(true)}
            >
              View Logs
            </Button>
          </DrawerTrigger>


          <DrawerContent className="p-6 bg-white/95 backdrop-blur-md shadow-xl overflow-y-auto rounded-r-2xl">
            <DrawerTitle className="text-2xl font-bold text-indigo-700 mb-6">
              Mood Journal Logs
            </DrawerTitle>

            <ScrollArea className="h-[80vh] pr-2 space-y-10">
              {/* ✅ Recently */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-1 mb-2">
                  Recently
                </h2>
                <div className="space-y-3">
                  {recentMoods.map((mood) => (
                    <a
                      href={`/log/${mood.id}`}
                      key={mood.id}
                      className="block p-4 rounded-lg bg-gray-100 hover:bg-indigo-50 border border-gray-200 transition"
                    >
                      <p className="text-sm text-gray-800 font-medium line-clamp-2">
                        {mood.mood_text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Score: {mood.mood_score} ·{' '}
                        {new Date(mood.created_at).toLocaleDateString()}
                      </p>
                    </a>
                  ))}
                </div>
              </section>

              {/* ✅ Archives */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-1 mb-2">
                  Archives
                </h2>
                <div className="space-y-2">
                  {Object.entries(groupedMoods).map(([year, months]) => (
                    <details
                      key={year}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >
                      <summary className="bg-gray-50 px-4 py-2 font-medium text-gray-700 cursor-pointer">
                        {year}
                      </summary>
                      <div className="pl-3 py-2 space-y-2">
                        {Object.entries(months).map(([month, logs]) => (
                          <details
                            key={month}
                            className="pl-2 border-l-2 border-indigo-200"
                          >
                            <summary className="text-sm text-gray-700 font-semibold py-1 px-1">
                              {month}
                            </summary>
                            <div className="pl-4 space-y-1">
                              {logs.map((log) => (
                                <a
                                  key={log.id}
                                  href={`/log/${log.id}`}
                                  className="block text-sm text-gray-700 hover:text-indigo-600 transition line-clamp-1"
                                >
                                  <span className="font-semibold">
                                    {new Date(log.created_at).toLocaleDateString()}
                                  </span>{' '}
                                  · "{log.mood_text.slice(0, 40)}..." (Score: {log.mood_score})
                                </a>
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
