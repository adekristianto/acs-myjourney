// src/services/database.js
// ============================================
// DATABASE SERVICE LAYER — Supabase
// Persiapan sebelum credentials masuk
// Nanti tinggal isi implementasi Supabase-nya
// ============================================

// Ini akan diisi dengan supabase client nanti
// import { supabase } from './supabaseClient'

// ============================================
// JEMAAT
// ============================================

export async function getJemaat() {
  // TODO: Implementasi Supabase
  // const { data, error } = await supabase
  //   .from('jemaat')
  //   .select('*')
  // return { data, error }
  
  console.log('[database] getJemaat — menunggu Supabase')
  return { data: [], error: null }
}

export async function getJemaatById(id) {
  console.log('[database] getJemaatById — menunggu Supabase')
  return { data: null, error: null }
}

// ============================================
// JOURNALS (4 dimensi)
// ============================================

// dimension_type: 'wisdom', 'physical', 'spiritual', 'social'
export async function saveJournal({ jemaatId, dimensionType, content, tanggal }) {
  // TODO: Implementasi Supabase
  // const { data, error } = await supabase
  //   .from('journals')
  //   .insert([{ jemaat_id: jemaatId, dimension_type: dimensionType, content, tanggal }])
  // return { data, error }
  
  console.log('[database] saveJournal — menunggu Supabase', { dimensionType, content })
  return { data: null, error: null }
}

export async function getJournalsByJemaat(jemaatId) {
  console.log('[database] getJournalsByJemaat — menunggu Supabase')
  return { data: [], error: null }
}

export async function getJournalsByDimension(jemaatId, dimensionType) {
  console.log('[database] getJournalsByDimension — menunggu Supabase')
  return { data: [], error: null }
}

export async function getTodayJournal(jemaatId, dimensionType) {
  console.log('[database] getTodayJournal — menunggu Supabase')
  return { data: null, error: null }
}

// ============================================
// STREAKS (per dimensi)
// ============================================

export async function getStreaks(jemaatId) {
  // TODO: Implementasi Supabase
  // const { data, error } = await supabase
  //   .from('streaks')
  //   .select('*')
  //   .eq('jemaat_id', jemaatId)
  // return { data, error }
  
  console.log('[database] getStreaks — menunggu Supabase')
  return { 
    data: {
      wisdom: 0,
      physical: 0,
      spiritual: 0,
      social: 0,
      full_streak: 0
    }, 
    error: null 
  }
}

export async function updateStreak(jemaatId, dimensionType, streakValue) {
  console.log('[database] updateStreak — menunggu Supabase')
  return { data: null, error: null }
}

// ============================================
// KOMSEL ATTENDANCE
// ============================================

export async function saveKomselAttendance({ tanggal, lokasi, anggota }) {
  console.log('[database] saveKomselAttendance — menunggu Supabase')
  return { data: null, error: null }
}

export async function getKomselAttendance(tanggal) {
  console.log('[database] getKomselAttendance — menunggu Supabase')
  return { data: [], error: null }
}

// ============================================
// WORKER ATTENDANCE
// ============================================

export async function saveWorkerAttendance({ tanggal, anggota }) {
  console.log('[database] saveWorkerAttendance — menunggu Supabase')
  return { data: null, error: null }
}

export async function getWorkerAttendance(tanggal) {
  console.log('[database] getWorkerAttendance — menunggu Supabase')
  return { data: [], error: null }
}

// ============================================
// AUTH
// ============================================

export async function loginJemaat(email, password) {
  // TODO: Implementasi Supabase Auth
  // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  // return { data, error }
  
  console.log('[database] loginJemaat — menunggu Supabase')
  return { data: null, error: null }
}

export async function logoutJemaat() {
  console.log('[database] logoutJemaat — menunggu Supabase')
  return { error: null }
}

export async function getCurrentJemaat() {
  console.log('[database] getCurrentJemaat — menunggu Supabase')
  return { data: null, error: null }
}

export async function updatePassword(newPassword) {
  console.log('[database] updatePassword — menunggu Supabase')
  return { error: null }
}

// ============================================
// GOAL SETTING (tambahan)
// ============================================

export async function saveGoal({ jemaatId, dimensionType, target, deadline }) {
  console.log('[database] saveGoal — menunggu Supabase')
  return { data: null, error: null }
}

export async function getGoals(jemaatId) {
  console.log('[database] getGoals — menunggu Supabase')
  return { data: [], error: null }
}

// ============================================
// FOUNDING MEMBER
// ============================================

export async function checkFoundingMember(jemaatId) {
  console.log('[database] checkFoundingMember — menunggu Supabase')
  return { data: { isFoundingMember: false }, error: null }
}