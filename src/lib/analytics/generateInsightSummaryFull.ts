// lib/analytics/generateInsightSummaryFull.ts
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isCacheFresh } from '@/lib/cache/isCacheFresh'
import { generateInsightSummary } from './insightSummary'

const RANGES = ['7', '30', '365']

export async function generateInsightSummaryFull(userId: string) {
  const range = 'all'

  // Step 1: Check if we already have recent summary
  const { data: cached } = await supabaseAdmin
    .from('insight_summary_cache')
    .select('ai_summary_text, updated_at')
    .eq('user_id', userId)
    .eq('range', range)
    .maybeSingle()

  if (cached && isCacheFresh(cached.updated_at)) {
    return { summary: cached.ai_summary_text, from: 'cache' as const }
  }

  // Step 2: Ensure all 3x3 caches exist and are fresh
  const sources = {
    bubble_keywords_cache: {} as Record<string, any>,
    emotion_trend_cache: {} as Record<string, any>,
    emotion_category_cache: {} as Record<string, any>,
  }

  for (const r of RANGES) {
    for (const table of Object.keys(sources)) {
      const { data } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .eq('range', r)
        .maybeSingle()

      if (!data || !isCacheFresh(data.updated_at)) {
        // Call route to generate it
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/${table.replace('_cache', '-cache')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, range: r }),
        })
      }
    }
  }

  // Step 3: After all data is ready, fetch for all ranges
  for (const r of RANGES) {
    const [b, t, c] = await Promise.all([
      supabaseAdmin
        .from('bubble_keywords_cache')
        .select('keywords_cluster')
        .eq('user_id', userId).eq('range', r).maybeSingle(),
      supabaseAdmin
        .from('emotion_trend_cache')
        .select('trend_points')
        .eq('user_id', userId).eq('range', r).maybeSingle(),
      supabaseAdmin
        .from('emotion_category_cache')
        .select('category_freq')
        .eq('user_id', userId).eq('range', r).maybeSingle()
    ])

    sources.bubble_keywords_cache[r] = b?.data?.keywords_cluster || []
    sources.emotion_trend_cache[r] = t?.data?.trend_points || []
    sources.emotion_category_cache[r] = c?.data?.category_freq || {}
  }

  const summary = await generateInsightSummary(userId, {
    bubbles: sources.bubble_keywords_cache,
    trends: sources.emotion_trend_cache,
    categories: sources.emotion_category_cache
  })

  await supabaseAdmin.from('insight_summary_cache').upsert({
    user_id: userId,
    range,
    ai_summary_text: summary,
    updated_at: new Date().toISOString()
  })

  return { summary, from: 'generated' as const }
}
