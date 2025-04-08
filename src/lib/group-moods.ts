type Mood = {
    id: string
    mood_text: string
    mood_score: number
    created_at: string
  }
  
  export function groupMoodsByYearMonth(moods: Mood[]) {
    const grouped: Record<string, Record<string, Mood[]>> = {}
  
    moods.forEach((mood) => {
      const date = new Date(mood.created_at)
      const year = date.getFullYear().toString()
      const month = date.toLocaleString('default', { month: 'long' })
      
      if (!grouped[year]) grouped[year] = {}
      if (!grouped[year][month]) grouped[year][month] = []
  
      grouped[year][month].push(mood)
    })
  
    return grouped
  }
  