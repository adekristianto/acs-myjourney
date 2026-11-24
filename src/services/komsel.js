// src/services/komsel.js — Absensi Komsel. Semua fungsi mengembalikan { data, error }.
import { supabase } from '../supabaseClient'
const safe = async (fn) => { try { return await fn() } catch (error) { return { data: null, error } } }

export const getMembers = (komsel) => safe(async () => {
  const { data, error } = await supabase.rpc('komsel_members', { k: komsel })
  return { data: data || [], error }
})

// Pertemuan terakhir (terbaru dulu) + kehadirannya
export const getMeetings = (komsel, limit = 8) => safe(async () => {
  const { data: meets, error } = await supabase.from('komsel_pertemuan').select('*')
    .eq('komsel', komsel).order('tanggal', { ascending: false }).limit(limit)
  if (error) return { data: [], error }
  const ids = (meets || []).map(m => m.id)
  let hadir = []
  if (ids.length) {
    const r = await supabase.from('komsel_hadir').select('pertemuan_id, jemaat_id, hadir').in('pertemuan_id', ids)
    if (r.error) return { data: [], error: r.error }
    hadir = r.data || []
  }
  return { data: (meets || []).map(m => ({ ...m, hadir: hadir.filter(h => h.pertemuan_id === m.id) })), error: null }
})

export const saveMeeting = ({ komsel, tanggal, jumlah_tamu, catatan, dicatat_oleh, hadirMap }) => safe(async () => {
  const { data: meet, error } = await supabase.from('komsel_pertemuan')
    .upsert({ komsel, tanggal, jumlah_tamu: Number(jumlah_tamu) || 0, catatan, dicatat_oleh, updated_at: new Date().toISOString() },
      { onConflict: 'komsel,tanggal' })
    .select().maybeSingle()
  if (error || !meet) return { data: null, error: error || new Error('no row') }
  const rows = Object.entries(hadirMap).map(([jemaat_id, hadir]) => ({ pertemuan_id: meet.id, jemaat_id, hadir: !!hadir }))
  if (rows.length) {
    const r = await supabase.from('komsel_hadir').upsert(rows, { onConflict: 'pertemuan_id,jemaat_id' })
    if (r.error) return { data: null, error: r.error }
  }
  return { data: meet, error: null }
})

export const setMemberKomsel = (jemaatId, komsel) => safe(async () => {
  const { error } = await supabase.rpc('admin_set_komsel', { p_jemaat: jemaatId, p_komsel: komsel || null })
  return { data: null, error }
})

// Tim pastoral (gembala) tidak pernah masuk daftar ini.
// "Perlu disapa": tidak hadir di 3 pertemuan terakhir berturut-turut (yang tercatat)
export function needsCare(members, meetings, streak = 3) {
  const recent = meetings.slice(0, streak)
  if (recent.length < streak) return []
  return members.filter(m => !m.gembala && recent.every(meet => {
    const h = meet.hadir.find(x => x.jemaat_id === m.id)
    return !h || !h.hadir
  }))
}
