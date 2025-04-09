import OpenAI from 'openai'
import { supabaseAdmin } from '../supabase-admin'
import { cosineSimilarity } from '@/utils/cosine'

export type KeywordScore = { keyword: string; scores: number[] }
export type ClusteredKeyword = { keyword: string; scores: number[] }

export async function getKeywordScoresInRange(
  range: string,
  userId: string
): Promise<KeywordScore[]> {
  let from = new Date()
  switch (range) {
    case '7': from.setDate(from.getDate() - 7); break
    case '30': from.setDate(from.getDate() - 30); break
    case '365': from.setFullYear(from.getFullYear() - 1); break
    case 'all': default: from = new Date('2000-01-01')
  }

  const { data, error } = await supabaseAdmin
    .from('mood')
    .select('keywords, mood_score')
    .eq('user_id', userId)
    .gte('created_at', from.toISOString())

  if (error) {
    console.error('❌ Supabase fetch error:', error)
    return []
  }

  const flattened: KeywordScore[] = []

  data?.forEach(entry => {
    if (!Array.isArray(entry.keywords)) return
    entry.keywords.forEach((k: string) => {
      const existing = flattened.find(f => f.keyword === k)
      if (existing) {
        existing.scores.push(entry.mood_score)
      } else {
        flattened.push({ keyword: k, scores: [entry.mood_score] })
      }
    })
  })

  return flattened
}

export async function clusterKeywords(
  keywords: KeywordScore[]
): Promise<ClusteredKeyword[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  const unique = Array.from(new Set(keywords.map(k => k.keyword)))
  const embeddings = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: unique,
  })

  const vectors = embeddings.data.map((e, i) => ({
    keyword: unique[i],
    embedding: e.embedding,
  }))

  const clusters: Record<string, {
    scores: number[]
    members: string[]
    embedding: number[]
  }> = {}

  for (const vec of vectors) {
    let found = false
    for (const center in clusters) {
      const sim = cosineSimilarity(vec.embedding, clusters[center].embedding)
      if (sim > 0.85) {
        const original = keywords.find(k => k.keyword === vec.keyword)
        if (original) {
          clusters[center].scores.push(...original.scores)
          clusters[center].members.push(vec.keyword)
        }
        found = true
        break
      }
    }

    if (!found) {
      const original = keywords.find(k => k.keyword === vec.keyword)
      if (original) {
        clusters[vec.keyword] = {
          embedding: vec.embedding,
          scores: original.scores,
          members: [vec.keyword],
        }
      }
    }
  }

  return Object.entries(clusters).map(([keyword, { scores }]) => ({
    keyword,
    scores,
  }))
}
