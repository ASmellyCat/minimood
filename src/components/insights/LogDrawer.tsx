// components/insights/LogDrawer.tsx
'use client'

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

type Mood = {
  id: string
  mood_text: string
  mood_score: number
  created_at: string
}

type Props = {
  moods: Mood[]
  groupedMoods: Record<string, Record<string, Mood[]>>
}

export default function LogDrawer({ moods, groupedMoods }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const recentMoods = moods.slice(0, 5)

  return (
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
  )
}
