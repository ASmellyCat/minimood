// types/supabase.ts
export type Database = {
    public: {
      Tables: {
        mood: {
          Row: {
            id: string
            mood_text: string
            mood_score: number
            keywords: string[] | null
            emotion_category: string | null
            created_at: string
            user_id: string
          }
          Insert: {
            mood_text: string
            mood_score: number
            keywords?: string[] | null
            emotion_category?: string | null
            created_at?: string
            user_id: string
          }
          Update: {
            mood_text?: string
            mood_score?: number
            keywords?: string[] | null
            emotion_category?: string | null
            created_at?: string
            user_id?: string
          }
        }
      }
    }
  }
  