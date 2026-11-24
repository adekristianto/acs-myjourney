// src/services/absensi.js — absensi Minggu / Pekerja / Morning Devotion. Mengembalikan { data, error }.
import { supabase } from '../supabaseClient'
const safe = async (fn) => { try { return await fn() } catch (error) { return { data: null, error } } }

export const JENIS = {
  minggu: { label: 'Ibadah Minggu', scan: true },
  pekerja: { label: 'Meeting Pekerja', scan: true },
  devotion: { label: 'Morning Devotion', scan: false },
}

export const checkinLink = (jenis) => `${window.location.origin}/?hadir=${jenis}`

export const checkin = (jenis) => safe(async () => {
  const { data, error } = await supabase.rpc('checkin', { p_jenis: jenis })
  return { data, error }
})

export const getAcara = (jenis, tanggal) => safe(async () => {
  const { data, error } = await supabase.from('acara').select('*').eq('jenis', jenis).eq('tanggal', tanggal).maybeSingle()
  return { data, error }
})

export const listAcara = (limit = 12) => safe(async () => {
  const { data, error } = await supabase.from('acara').select('*').order('tanggal', { ascending: false }).limit(limit)
  return { data: data || [], error }
})

export const openAcara = (jenis, tanggal, userId) => safe(async () => {
  const { data, error } = await supabase.from('acara')
    .upsert({ jenis, tanggal, dibuat_oleh: userId, updated_at: new Date().toISOString() }, { onConflict: 'jenis,tanggal' })
    .select().maybeSingle()
  return { data, error }
})

export const updateAcara = (id, fields) => safe(async () => {
  const { data, error } = await supabase.from('acara').update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id).select().maybeSingle()
  return { data, error }
})

export const getKehadiran = (acaraId) => safe(async () => {
  const { data, error } = await supabase.from('kehadiran').select('jemaat_id, cara, status, created_at')
    .eq('acara_id', acaraId).order('created_at', { ascending: true })
  return { data: data || [], error }
})

export const setStatus = (acaraId, jemaatIds, status) => safe(async () => {
  const { error } = await supabase.from('kehadiran').update({ status }).eq('acara_id', acaraId).in('jemaat_id', jemaatIds)
  return { data: null, error }
})

export const addManual = (acaraId, jemaatId) => safe(async () => {
  const { error } = await supabase.from('kehadiran')
    .upsert({ acara_id: acaraId, jemaat_id: jemaatId, cara: 'admin', status: 'disetujui' }, { onConflict: 'acara_id,jemaat_id' })
  return { data: null, error }
})

export const removeKehadiran = (acaraId, jemaatId) => safe(async () => {
  const { error } = await supabase.from('kehadiran').delete().eq('acara_id', acaraId).eq('jemaat_id', jemaatId)
  return { data: null, error }
})

// Ringkasan Minggu: tamu = dewasa (hitungan usher) − jemaat terdaftar yang hadir (disetujui)
export function ringkasMinggu(acara, list) {
  const jemaat = list.filter(k => k.status === 'disetujui').length
  const dewasa = Number(acara?.dewasa) || 0
  const anak = Number(acara?.anak) || 0
  return { jemaat, dewasa, anak, total: dewasa + anak, tamu: Math.max(dewasa - jemaat, 0) }
}
