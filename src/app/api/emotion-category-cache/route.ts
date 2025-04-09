import { NextResponse } from 'next/server'
import { computeEmotionCategoryFreq } from '@/lib/analytics/emotionCategory'
import { isCacheFresh } from '@/lib/cache/isCacheFresh'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { userId, range } = await req.json()
    if (!userId || !range) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const { data: cached } = await supabaseAdmin
      .from('emotion_category_cache')
      .select('category_freq, updated_at')
      .eq('user_id', userId)
      .eq('range', range)
      .maybeSingle()

    if (cached && isCacheFresh(cached.updated_at)) {
      return NextResponse.json({ category_freq: cached.category_freq, from: 'cache' })
    }

    const category_freq = await computeEmotionCategoryFreq(userId, range)

    await supabaseAdmin.from('emotion_category_cache').upsert({
      user_id: userId,
      range,
      category_freq,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({ category_freq, from: 'computed' })
  } catch (err: any) {
    console.error('[emotion-category-cache] ❌', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}