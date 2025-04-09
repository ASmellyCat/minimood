// app/api/insight-summary-cache/route.ts
import { NextResponse } from 'next/server'
import { generateInsightSummaryFull } from '@/lib/analytics/generateInsightSummaryFull'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const { summary, from } = await generateInsightSummaryFull(userId)
    return NextResponse.json({ summary, from })
  } catch (err: any) {
    console.error('[insight-summary-cache] ❌', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
