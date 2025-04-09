import { supabaseAdmin } from '../supabase-admin'
import dayjs from 'dayjs'

type MoodLog = {
  emotion_category?: string
  created_at?: string
}

export async function computeEmotionCategoryFreq(userId: string, range: '7' | '30' | '365' | 'all') {
  const now = dayjs()

  const { data: logs, error } = await supabaseAdmin
    .from('mood')
    .select('emotion_category, created_at')
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to fetch mood logs: ${error.message}`)


  const filtered = logs.filter(log => {
    if (!log.created_at || range === 'all') return true
    const days = parseInt(range, 10)
    return dayjs(log.created_at).isAfter(now.subtract(days, 'day'))
  })


  const category_freq: Record<string, number> = {}
  for (const { emotion_category } of filtered) {
    if (!emotion_category) continue
    category_freq[emotion_category] = (category_freq[emotion_category] || 0) + 1
  }

  return category_freq
}
