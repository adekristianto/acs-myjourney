// src/services/pelayanan.js — Modul Pelayanan. Semua fungsi mengembalikan { data, error }, tidak pernah throw.
import { supabase } from '../supabaseClient'

const safe = async (fn) => { try { return await fn() } catch (error) { return { data: null, error } } }

export const getMyRoles = (jemaatId) => safe(async () => {
  const { data, error } = await supabase.from('user_roles').select('role, scope').eq('jemaat_id', jemaatId)
  return { data: data || [], error }
})

// Minggu terakhir (WIB). Kalau hari ini Minggu → hari ini.
export function lastSundayWIB(offsetWeeks = 0) {
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  const d = new Date(todayStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() - d.getUTCDay() - offsetWeeks * 7)
  return d.toISOString().slice(0, 10)
}

export const getReport = (tanggal, team, ibadah = 'Ibadah 1') => safe(async () => {
  const { data, error } = await supabase.from('service_reports').select('*')
    .eq('tanggal', tanggal).eq('team', team).eq('ibadah', ibadah).maybeSingle()
  return { data, error }
})

export const saveReport = (report) => safe(async () => {
  const { data, error } = await supabase.from('service_reports')
    .upsert({ ...report, updated_at: new Date().toISOString() }, { onConflict: 'tanggal,ibadah,team' })
    .select().maybeSingle()
  return { data, error }
})

export const getReportsByDate = (tanggal) => safe(async () => {
  const { data, error } = await supabase.from('service_reports').select('*').eq('tanggal', tanggal)
  return { data: data || [], error }
})

export const getActions = () => safe(async () => {
  const { data, error } = await supabase.from('service_actions').select('*')
    .order('created_at', { ascending: false }).limit(200)
  return { data: data || [], error }
})

export const saveAction = (action) => safe(async () => {
  const row = { ...action, updated_at: new Date().toISOString() }
  const q = action.id
    ? supabase.from('service_actions').update(row).eq('id', action.id)
    : supabase.from('service_actions').insert([row])
  const { data, error } = await q.select().maybeSingle()
  return { data, error }
})

export const listRoles = () => safe(async () => {
  const { data, error } = await supabase.from('user_roles').select('jemaat_id, role, scope')
  return { data: data || [], error }
})
export const listJemaat = () => safe(async () => {
  const { data, error } = await supabase.rpc('admin_list_jemaat')
  return { data: data || [], error }
})
export const addRole = (jemaat_id, role, scope = '') => safe(async () => {
  const { error } = await supabase.from('user_roles').insert([{ jemaat_id, role, scope }])
  return { data: null, error }
})
export const removeRole = (jemaat_id, role, scope = '') => safe(async () => {
  const { error } = await supabase.from('user_roles').delete().eq('jemaat_id', jemaat_id).eq('role', role).eq('scope', scope)
  return { data: null, error }
})
