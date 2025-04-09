// lib/analyze-and-update-moods.ts
import OpenAI from 'openai'
import { supabase } from './supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Step 1: Analyze a single mood entry by ID (uuid string)
export async function analyzeMoodById(id: string) {
  if (!id || typeof id !== 'string') {
    console.error('❌ Invalid ID provided to analyzeMoodById')
    return
  }

  const { data: mood, error: fetchError } = await supabase
    .from('mood')
    .select('id, mood_text, mood_score')
    .eq('id', id)
    .single()

  if (fetchError || !mood) {
    console.error('❌ Failed to fetch mood for analysis:', fetchError)
    return
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an AI assistant that performs two tasks:\n' +
          '1. Extract 1-3 meaningful English noun-based keywords from the diary entry.\n' +
          '2. Classify the entry into one of the following emotion categories:\n' +
          '- Excited\n- Satisfied\n- Sadness\n- Anger\n- Anxiety\n- Neutral\n\n' +
          'You are an AI assistant that returns only valid JSON. Respond **only** with a strict JSON object like this:\n' +
  '{\n  "keywords": ["keyword1", "keyword2"],\n  "emotion": "EmotionCategory"\n}'
      },
      {
        role: 'user',
        content: `Entry:\n"${mood.mood_text}"\n(Mood Score: ${mood.mood_score})`
      }
    ],
    temperature: 0.3,
  })

  const content = response.choices[0].message.content

  if (!content || typeof content !== 'string') {
    console.error('❌ GPT did not return a valid string.')
    return
  }

  let cleanContent = content.trim()

  if (!cleanContent.startsWith('{')) {
    const jsonStart = cleanContent.indexOf('{')
    if (jsonStart >= 0) {
      cleanContent = cleanContent.slice(jsonStart)
    }
  }

  try {
    const parsed = JSON.parse(content) as {
      keywords: string[]
      emotion: string
    }

    const { error: updateError } = await supabase
      .from('mood')
      .update({
        keywords: parsed.keywords,
        emotion_category: parsed.emotion,
      })
      .eq('id', id)

    if (updateError) {
      console.error('❌ Failed to update mood with analysis:', updateError)
    } else {
      console.log(`✅ Mood ${id} updated with analysis.`)
    }
  } catch (e) {
    console.error('❌ Failed to parse GPT response:', content)
  }
}
