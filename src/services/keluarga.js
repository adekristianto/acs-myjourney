// src/services/keluarga.js — profil, keluarga, laporan perayaan. Mengembalikan { data, error }.
import { supabase } from '../supabaseClient'
const safe = async (fn) => { try { return await fn() } catch (error) { return { data: null, error } } }
const nul = (v) => (v === '' || v === undefined ? null : v)

export const HUBUNGAN = { pasangan: 'Pasangan', anak: 'Anak', ayah: 'Ayah', ibu: 'Ibu', saudara: 'Saudara', cucu: 'Cucu', lainnya: 'Lainnya' }

export const getProfil = (id) => safe(async () => {
  const { data, error } = await supabase.from('jemaat_profil').select('*').eq('jemaat_id', id).maybeSingle()
  return { data, error }
})

export const saveProfil = (id, f) => safe(async () => {
  const row = { jemaat_id: id, tanggal_lahir: nul(f.tanggal_lahir), jenis_kelamin: nul(f.jenis_kelamin), no_hp: nul((f.no_hp || '').trim()),
    status_nikah: nul(f.status_nikah), tanggal_menikah: f.status_nikah === 'menikah' ? nul(f.tanggal_menikah) : null,
    nama_pasangan: f.status_nikah === 'menikah' ? nul((f.nama_pasangan || '').trim()) : null, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('jemaat_profil').upsert(row, { onConflict: 'jemaat_id' }).select().maybeSingle()
  return { data, error }
})

export const listKeluarga = (id) => safe(async () => {
  const { data, error } = await supabase.from('keluarga_anggota').select('*').eq('pemilik_id', id).order('created_at', { ascending: true })
  return { data: data || [], error }
})

export const addKeluarga = (id, f) => safe(async () => {
  const { data, error } = await supabase.from('keluarga_anggota')
    .insert({ pemilik_id: id, nama: f.nama.trim(), hubungan: f.hubungan, tanggal_lahir: nul(f.tanggal_lahir), jemaat_acs: !!f.jemaat_acs })
    .select().maybeSingle()
  return { data, error }
})

export const removeKeluarga = (rowId) => safe(async () => {
  const { error } = await supabase.from('keluarga_anggota').delete().eq('id', rowId)
  return { data: null, error }
})

export const getPerayaan = (bulan) => safe(async () => {
  const { data, error } = await supabase.rpc('admin_perayaan', { p_bulan: bulan })
  return { data: data || [], error }
})

export const getKelengkapan = () => safe(async () => {
  const { data, error } = await supabase.rpc('admin_kelengkapan')
  return { data, error }
})

// Umur / tahun ke- pada tahun berjalan
export const tahunKe = (ymd, year = new Date().getFullYear()) => (ymd ? year - Number(ymd.slice(0, 4)) : null)
