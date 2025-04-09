// ✅ /app/api/cluster-keywords/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getKeywordScoresInRange, clusterKeywords } from '@/lib/analytics/cluster-keywords'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isCacheFresh } from '@/lib/cache/isCacheFresh'

export async function POST(req: NextRequest) {
  try {
    const { range, userId } = await req.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }


    const { data: cached } = await supabaseAdmin
      .from('bubble_keywords_cache')
      .select('keywords_cluster, updated_at')
      .eq('user_id', userId)
      .eq('range', range)
      .maybeSingle()

    if (cached && isCacheFresh(cached.updated_at)) {
      return NextResponse.json({ keywords: cached.keywords_cluster, from: 'cache' })
    }

    const raw = await getKeywordScoresInRange(range, userId)
    const clustered = await clusterKeywords(raw)

    const result = clustered.map(({ keyword, scores }) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return {
        keyword,
        frequency: scores.length,
        averageScore: parseFloat(avg.toFixed(2))
      }
    })


    await supabaseAdmin.from('bubble_keywords_cache').upsert({
      user_id: userId,
      range,
      keywords_cluster: result,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({ keywords: result, from: 'computed' })
  } catch (err) {
    console.error('[cluster-keywords] ❌', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
