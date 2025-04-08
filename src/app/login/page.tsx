'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  // Local state to store user email input and feedback message
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  /**
   * Sends a magic link to the user's email using Supabase Auth.
   * Displays success or failure messages accordingly.
   */
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage('Login failed. Try again.')
    } else {
      setMessage('Check your email for the magic link ✨')

      // Optional: Auto-redirect after a short delay (UX improvement)
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Login container */}
      <div className="w-full max-w-[320px] space-y-4">
        <h1 className="text-xl font-bold text-center text-black">
          Login to MiniMood
        </h1>

        {/* Email input field */}
        <input
          type="email"
          className="w-full px-3 py-2 border rounded placeholder-gray-700 text-black"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Send Magic Link
        </button>

        {/* Optional feedback message */}
        {message && (
          <p className="text-sm text-center text-gray-500">{message}</p>
        )}
      </div>
    </div>
  )
}
