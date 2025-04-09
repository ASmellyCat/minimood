import { NextResponse } from 'next/server'
import { computeEmotionTrendPoints } from '@/lib/analytics/emotionTrend'
import { isCacheFresh } from '@/lib/cache/isCacheFresh'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { userId, range } = await req.json()
    if (!userId || !range) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const { data: cached } = await supabaseAdmin
      .from('emotion_trend_cache')
      .select('trend_points, updated_at')
      .eq('user_id', userId)
      .eq('range', range)
      .maybeSingle()

    if (cached && isCacheFresh(cached.updated_at)) {
      return NextResponse.json({ trend_points: cached.trend_points, from: 'cache' })
    }

    const { data: logs, error } = await supabaseAdmin
      .from('mood')
      .select('mood_score, created_at')
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to fetch mood logs: ${error.message}`)

    const trend_points = await computeEmotionTrendPoints(logs, range)

    await supabaseAdmin.from('emotion_trend_cache').upsert({
      user_id: userId,
      range,
      trend_points,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({ trend_points, from: 'computed' })
  } catch (err: any) {
    console.error('[emotion-trend-cache] ❌', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}