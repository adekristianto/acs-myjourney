// src/services/history.js — Riwayat Jurnal (F1)
// Semua fungsi mengembalikan { data, error }, tidak pernah throw.
import { supabase } from '../supabaseClient'

// Kolom content bisa tersimpan sebagai teks JSON atau objek — samakan jadi objek
function parseContent(c) {
  if (c && typeof c === 'object') return c
  if (typeof c === 'string') {
    try { const o = JSON.parse(c); if (o && typeof o === 'object') return o } catch { /* teks biasa */ }
    return { note: c }
  }
  return {}
}
function normalize(row) {
  return row ? { ...row, content: parseContent(row.content), _contentIsString: typeof row.content === 'string' } : row
}

export async function getJournalHistory(jemaatId, { limit = 30, offset = 0, dimension = 'all' } = {}) {
  try {
    let q = supabase
      .from('journals')
      .select('id, dimension_type, content, tanggal, created_at')
      .eq('jemaat_id', jemaatId)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (dimension !== 'all') q = q.eq('dimension_type', dimension)
    const { data, error } = await q
    return { data: (data || []).map(normalize), error }
  } catch (error) {
    return { data: [], error }
  }
}

export async function updateJournalContent(journalId, content, asString = false) {
  try {
    const { data, error } = await supabase
      .from('journals')
      .update({ content: asString ? JSON.stringify(content) : content })   // tanggal sengaja TIDAK bisa diubah
      .eq('id', journalId)
      .select('id, dimension_type, content, tanggal, created_at')
      .maybeSingle()
    return { data: normalize(data), error }
  } catch (error) {
    return { data: null, error }
  }
}

// Ringkasan perjalanan untuk kartu "Perjalananmu" di Beranda
export async function getJourneyStats(jemaatId) {
  try {
    const { data, error } = await supabase
      .from('journals')
      .select('tanggal')
      .eq('jemaat_id', jemaatId)
    if (error) return { data: null, error }
    const days = new Set((data || []).map(r => r.tanggal))
    const first = [...days].sort()[0] || null
    return { data: { entries: (data || []).length, days: days.size, since: first }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
