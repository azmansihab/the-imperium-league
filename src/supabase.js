import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && key)
export const supabase = supabaseConfigured ? createClient(url, key) : null

export async function saveResearch(answers, meta = {}) {
  if (!supabaseConfigured) {
    await new Promise(resolve => setTimeout(resolve, 280))
    return { mode: 'local-demo' }
  }
  const { data, error } = await supabase
    .from('research_responses')
    .insert({
      answers,
      source: meta.source || 'direct',
      user_agent: navigator.userAgent,
    })
    .select('id')
    .single()
  if (error) throw error
  return data
}
