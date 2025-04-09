// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { analyzeMoodById } from '@/lib/analyze-and-update-moods'

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing ID' }, { status: 400 })
    }

    await analyzeMoodById(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error analyzing mood:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
