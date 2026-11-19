// src/services/devotion.js — pengaturan Morning Devotion. Mengembalikan { data, error }, tidak pernah throw.
import { supabase } from '../supabaseClient'

const safe = async (fn) => { try { return await fn() } catch (error) { return { data: null, error } } }

export const getDevotion = () => safe(async () => {
  const { data, error } = await supabase.from('devotion_settings').select('zoom_url, series, passage, passage_date, updated_at').eq('id', 1).maybeSingle()
  return { data, error }
})

export const saveDevotion = ({ zoom_url, series, passage, passage_date }, userId) => safe(async () => {
  const row = { id: 1, zoom_url: (zoom_url || '').trim(), series: (series || '').trim(), passage: (passage || '').trim(),
    passage_date: passage_date || null, updated_at: new Date().toISOString(), updated_by: userId || null }
  const { data, error } = await supabase.from('devotion_settings').upsert(row, { onConflict: 'id' }).select().maybeSingle()
  return { data, error }
})
