'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useRouter } from 'next/navigation'
import { analyzeMoodById } from '@/lib/analyze-and-update-moods'



export default function MoodPage() {
  const [moodText, setMoodText] = useState('')
  const [moodScore, setMoodScore] = useState(5)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    const { data: userData, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !userData?.user?.id) {
      setMessage('Failed to identify user')
      setLoading(false)
      return
    }


    const { data, error } = await supabase.from('mood').insert({
      user_id: userData.user?.id,
      mood_text: moodText,
      mood_score: moodScore
    }).select()

    if (error) {
      console.error('Insert error:', JSON.stringify(error, null, 2))
      setMessage('Failed to submit mood. Please try again.')
    } else {
      const newId = data[0].id
      await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: newId }),
      })
      setMessage('🎉 Mood submitted! Great job taking care of yourself.')
      setMoodText('')
      setMoodScore(5)

      setTimeout(() => {
        router.push('/')
      }, 1500)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-center text-indigo-700 tracking-wide">
          ✨ Log your mood ✨
        </h1>

        <div className="flex flex-col space-y-2">
          <label htmlFor="mood" className="text-sm font-medium text-violet-700">
            How are you feeling today?
          </label>
          <textarea
            id="mood"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="Write freely — no judgment here 💬"
            rows={6}
            className="w-full rounded-lg border border-gray-300 shadow-sm focus:ring-violet-400 focus:border-violet-400 text-gray-800 p-3 resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 mb-1 block">
            Mood score: <span className="font-semibold">{moodScore}</span>
          </label>
          <Slider
            min={1}
            max={10}
            step={1}
            defaultValue={[moodScore]}
            onValueChange={(val) => setMoodScore(val[0])}
            className="[&_[data-slot=slider-track]]:bg-purple-200 [&_[data-slot=slider-thumb]]:bg-purple-600"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium tracking-wide shadow-sm transition"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Mood'}
        </Button>

        {message && (
          <p className="text-center text-sm text-gray-700">{message}</p>
        )}

        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="w-full border border-purple-400 text-purple-700 hover:bg-purple-100"
        >
          Back to Home
        </Button>

      </div>
    </div>
  )
}
