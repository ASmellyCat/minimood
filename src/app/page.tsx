'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check user session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      const userEmail = data.session?.user.email ?? null

      setEmail(userEmail)
      setLoading(false)

      if (!userEmail) {
        router.push('/login')
      }
    }

    getSession()
  }, [])

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Navigation
  const goToMood = () => router.push('/mood')
  const goToInsights = () => router.push('/insights')

  if (loading) {
    return <p className="text-center mt-20">Checking session...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 relative px-4 py-4">
      {/* Header */}
      <div className="absolute top-4 right-4 text-right space-y-1">
        <p className="text-sm text-gray-600">
          Logged in as <strong>{email}</strong>
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center items-center min-h-screen space-y-10 pt-12">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome to MiniMood
        </h1>

        {/* Mood Logging + Insights Cards */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mood Logging */}
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={goToMood}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg font-semibold py-2 px-6 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
            >
              Log Your Mood
            </button>
            <img
              src="/images/mood-hero.png"
              alt="Mood Tracker"
              className="rounded-xl shadow-lg object-cover w-64"
            />
          </div>

          {/* Insights */}
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={goToInsights}
              className="bg-gradient-to-r from-teal-400 to-green-500 text-white text-lg font-semibold py-2 px-6 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
            >
              Track Emotions
            </button>
            <img
              src="/images/insight-hero.png"
              alt="Emotion Insights"
              className="rounded-xl shadow-lg object-cover w-64"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
