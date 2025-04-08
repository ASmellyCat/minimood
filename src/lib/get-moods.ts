import { supabase } from './supabase'

export async function getUserMoods() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('No user found')
  }

  const { data: moods, error } = await supabase
    .from('mood')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch moods')
  }

  return moods || []
}
