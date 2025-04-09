import OpenAI from 'openai'

type InsightData = {
  bubbles: Record<string, any>
  trends: Record<string, any>
  categories: Record<string, any>
}

export async function generateInsightSummary(
  userId: string,
  data: InsightData
) {
  const { bubbles, trends, categories } = data

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  const prompt = `
You are an AI emotional wellness assistant helping the user reflect on their recent emotional state.
You are analyzing data from multiple time ranges (7 days, 30 days, 1 year).

Please return THREE sections:
1. [Analysis]: Describe emotional patterns, mood swings, or keyword-related issues.
2. [Suggestion]: Recommend something helpful (like books, habits, films) based on their emotional patterns and keyword context.
3. [Encouragement]: Offer a warm, personal encouragement based on their trends and resilience.

Use user's original keyword language (e.g., if the keywords are in Chinese, reply in Chinese).

===[Keyword Clusters by Range]===
${JSON.stringify(bubbles, null, 2)}

===[Trend Points by Range]===
${JSON.stringify(trends, null, 2)}

===[Emotion Category Frequencies by Range]===
${JSON.stringify(categories, null, 2)}
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a warm and emotionally intelligent assistant who helps users reflect on their mood logs.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  })

  const raw = completion.choices[0].message.content || ''
  const parts = raw.split(/\[([A-Za-z]+)\]/g).map(p => p.trim())

  const extract = (label: string): string =>
    parts[parts.findIndex(p => p.toLowerCase() === label.toLowerCase()) + 1] || ''

  return {
    analysis: extract('Analysis'),
    suggestion: extract('Suggestion'),
    encouragement: extract('Encouragement'),
  }
}
