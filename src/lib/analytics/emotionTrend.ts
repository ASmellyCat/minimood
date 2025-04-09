export type TrendPoint = { date: string; score: number }

export async function computeEmotionTrendPoints(
  logs: { created_at?: string; mood_score?: number }[],
  range: string
): Promise<TrendPoint[]> {
  const now = new Date()
  const dateLimit = new Date()

  if (range !== 'all') {
    const days = parseInt(range, 10)
    dateLimit.setDate(now.getDate() - days)
  } else {
    dateLimit.setTime(0)
  }

  const filtered = logs.filter(log => {
    if (!log.created_at || log.mood_score == null) return false
    return new Date(log.created_at) >= dateLimit
  })

  const dailyMap: Record<string, number[]> = {}
  for (const log of filtered) {
    const d = new Date(log.created_at!)
    const key = d.toLocaleDateString('en-CA') // YYYY-MM-DD
    if (!dailyMap[key]) dailyMap[key] = []
    dailyMap[key].push(log.mood_score!)
  }

  return Object.entries(dailyMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, scores]) => ({
      date,
      score: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
    }))
}