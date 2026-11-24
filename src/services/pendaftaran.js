// src/services/pendaftaran.js — jemaat baru daftar sendiri, admin menyetujui. Mengembalikan { data, error }.
import { supabase } from '../supabaseClient'
const safe = async (fn) => { try { return await fn() } catch (error) { return { data: null, error } } }

export const daftar = ({ nama, email, hp, komsel, password }) => safe(async () => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { daftar: 'ya', nama: nama.trim(), hp: hp.trim(), komsel: komsel || '', password_changed: true } },
  })
  if (error) {
    const sudah = /already|registered|exists/i.test(error.message || '')
    return { data: null, error: sudah ? { code: 'sudah_terdaftar' } : error }
  }
  // Jika "Confirm email" masih ON, Supabase mengembalikan user tanpa identities untuk email yang sudah ada
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { data: null, error: { code: 'sudah_terdaftar' } }
  }
  if (!data?.session) return { data: null, error: { code: 'perlu_konfirmasi' } }
  return { data, error: null }
})

export const sesiAktif = async () => {
  try { const { data } = await supabase.auth.getUser(); return data?.user || null } catch { return null }
}

export const statusSaya = () => safe(async () => {
  const { data, error } = await supabase.rpc('my_pendaftaran')
  return { data, error }
})

export const listPendaftaran = () => safe(async () => {
  const { data, error } = await supabase.rpc('admin_pendaftaran')
  return { data: data || [], error }
})

export const setujui = (id, komsel) => safe(async () => {
  const { error } = await supabase.rpc('admin_setujui', { p_id: id, p_komsel: komsel || null })
  return { data: !error, error }
})

export const tolak = (id) => safe(async () => {
  const { error } = await supabase.rpc('admin_tolak', { p_id: id })
  return { data: !error, error }
})
