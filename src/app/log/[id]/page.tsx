'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

type Mood = {
  id: string
  mood_text: string
  mood_score: number
  created_at: string
  updated_at?: string
}

export default function MoodDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [mood, setMood] = useState<Mood | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchMood = async () => {
      const { data, error } = await supabase
        .from('mood')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to load mood.')
      } else {
        setMood(data)
      }
      setLoading(false)
    }

    fetchMood()
  }, [id])

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this entry?')
    if (!confirmed) return

    const { error } = await supabase.from('mood').delete().eq('id', id)
    if (!error) {
      router.push('/insights')
    } else {
      alert('Failed to delete.')
    }
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>
  if (error || !mood) return <p className="text-center text-red-600 mt-20">{error}</p>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4 py-8">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-indigo-700 text-center tracking-wide">
          Mood Reflection
        </h1>

        <p className="text-gray-800 whitespace-pre-line leading-relaxed text-base">
          {mood.mood_text}
        </p>

        <div className="space-y-1">
          <p className="text-sm text-gray-700 font-medium">How you felt that day:</p>
          <div className="w-full bg-purple-100 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${(mood.mood_score / 10) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Mood Score: {mood.mood_score} / 10</p>
        </div>

        <div className="text-sm text-gray-500 space-y-1 pt-4 border-t border-gray-200">
          <p>
            <strong>First logged:</strong>{' '}
            {new Date(mood.created_at).toLocaleString()}
          </p>
          {mood.updated_at && (
            <p className="text-sm text-gray-500">
              <strong>Last edited:</strong> {new Date(mood.updated_at).toLocaleString()}
            </p>
          )}

        </div>

        <div className="flex justify-between pt-6">
          <Button
            onClick={() => router.push('/insights')}
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/log/${id}/edit`)}
              className="bg-violet-400 hover:bg-violet-700 text-white"
            >
              Edit
            </Button>
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                <Button className="bg-red-700 hover:bg-red-500 text-white">
                  Delete
                </Button>
              </AlertDialog.Trigger>

              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
                <AlertDialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-[90%] max-w-sm p-6 space-y-4">
                  <AlertDialog.Title className="text-lg font-semibold text-gray-800">
                    Delete Entry?
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-gray-600">
                    This action cannot be undone. Are you sure you want to delete this mood log?
                  </AlertDialog.Description>
                  <div className="flex justify-end gap-3 pt-4">
                    <AlertDialog.Cancel asChild>
                      <Button variant="outline">Cancel</Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <Button
                        onClick={async () => {
                          const { error } = await supabase.from('mood').delete().eq('id', id)
                          if (!error) {
                            router.push('/insights')
                          } else {
                            alert('Failed to delete.')
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Yes, Delete
                      </Button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </div>
        </div>
      </div>
    </div>
  )
}
