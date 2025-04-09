// app/api/cluster-keywords/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getKeywordScoresInRange, clusterKeywords } from '@/lib/cluster-keywords'

export async function POST(req: NextRequest) {
  try {
    const { range, userId } = await req.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const raw = await getKeywordScoresInRange(range, userId)
    const clustered = await clusterKeywords(raw)

    const result = clustered.map(({ keyword, scores }) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return {
        keyword,
        frequency: scores.length,
        averageScore: parseFloat(avg.toFixed(2)),
        x: Math.random() * 100,
        y: Math.random() * 100,
      }
    })

    return NextResponse.json({ keywords: result })
  } catch (err) {
    console.error('❌ cluster-keywords route error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
