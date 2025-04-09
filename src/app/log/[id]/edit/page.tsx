'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'



export default function EditMoodPage() {
  const { id } = useParams()
  const router = useRouter()

  const [initialText, setInitialText] = useState('')
  const [initialScore, setInitialScore] = useState(5)

  const [moodText, setMoodText] = useState('')
  const [moodScore, setMoodScore] = useState(5)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchMood = async () => {
      const { data, error } = await supabase
        .from('mood')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setMoodText(data.mood_text)
        setMoodScore(data.mood_score)
        setInitialText(data.mood_text)
        setInitialScore(data.mood_score)
      } else {
        setMessage('Failed to load mood entry.')
      }
      setLoading(false)
    }

    fetchMood()
  }, [id])

  const handleUpdate = async () => {
    setLoading(true)
    setMessage('')

    const textUnchanged = moodText.trim() === initialText.trim()
    const scoreUnchanged = moodScore === initialScore

    if (textUnchanged && scoreUnchanged) {
      setMessage('No changes detected.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('mood')
      .update({
        mood_text: moodText,
        mood_score: moodScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setMessage('Update failed. Please try again.')
    } else {
      await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })      
      setMessage('Mood updated successfully 🎉')
      setTimeout(() => router.push(`/log/${id}`), 1200)
    }

    setLoading(false)
  }
  

  if (loading) return <p className="text-center mt-20">Loading mood entry...</p>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-indigo-700">Edit Mood Entry</h1>

        <div className="space-y-3">
          <label className="text-sm text-violet-700">Mood Text</label>
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-violet-400 focus:border-violet-400 text-gray-800 p-3 resize-none"
          />

          <label className="text-sm text-violet-700">
            Mood Score: <strong>{moodScore}</strong>
          </label>
          <Slider
            min={1}
            max={10}
            step={1}
            defaultValue={[moodScore]}
            onValueChange={(val) => setMoodScore(val[0])}
            className="[&_[data-slot=slider-track]]:bg-purple-200 [&_[data-slot=slider-thumb]]:bg-purple-600"
          />

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            {loading ? 'Updating...' : 'Update Mood'}
          </Button>

          {message && (
            <p className="text-center text-sm text-gray-600">{message}</p>
          )}
        </div>


        <Button
          onClick={() => router.push(`/log/${id}`)}
          variant="outline"
          className="w-full border border-purple-400 text-purple-700 hover:bg-purple-100"
        >
          Back to Entry
        </Button>
      </div>
    </div>
  )
}
