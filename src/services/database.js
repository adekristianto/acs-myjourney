// src/services/database.js
import { supabase } from '../supabaseClient'

// ============================================
// JEMAAT
// ============================================

// Ambil semua jemaat (untuk attendance list)
export async function getJemaat() {
  const { data, error } = await supabase
    .from('jemaat')
    .select('*')
    .order('nama', { ascending: true })
  return { data, error }
}

export async function getJemaatByEmail(email) {
  const { data, error } = await supabase
    .from('jemaat')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  return { data, error }
}

export async function getCurrentJemaat() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { data: null, error }
  
  const { data: jemaat, error: jemaatError } = await supabase
    .from('jemaat')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()
  
  return { data: jemaat, error: jemaatError }
}

export async function getJemaatById(id) {
  const { data, error } = await supabase
    .from('jemaat')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return { data, error }
}

// ============================================
// JOURNALS (4 dimensi)
// ============================================

export async function saveJournal({ jemaatId, dimension, content, entryDate }) {
  const { data, error } = await supabase
    .from('journals')
    .insert([{
      jemaat_id: jemaatId,
      dimension_type: dimension,
      content: content,
      tanggal: entryDate || new Date().toISOString().split('T')[0]
    }])
    .select()
  return { data, error }
}

export async function getJournalsByJemaat(jemaatId) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .order('tanggal', { ascending: false })
  return { data, error }
}

export async function getJournalsByDimension(jemaatId, dimension) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimension)
    .order('tanggal', { ascending: false })
  return { data, error }
}

export async function getTodayJournal(jemaatId, dimension) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimension)
    .eq('tanggal', today)
    .maybeSingle()
  return { data, error }
}

// ============================================
// STREAKS
// ============================================

export async function getStreaks(jemaatId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('jemaat_id', jemaatId)
  
  if (error) return { data: null, error }
  
  const streaks = {
    wisdom: 0,
    physical: 0,
    spiritual: 0,
    social: 0,
    full_day: 0
  }
  
  data?.forEach(s => {
    const dim = s.dimension_type
    if (dim === 'full_day') {
      streaks.full_day = s.current_streak || 0
    } else {
      streaks[dim] = s.current_streak || 0
    }
  })
  
  streaks.full_day = Math.min(
    streaks.wisdom,
    streaks.physical,
    streaks.spiritual,
    streaks.social
  )
  
  return { data: streaks, error: null }
}

export async function updateStreak(jemaatId, dimensionType, streakValue) {
  const { data, error } = await supabase
    .from('streaks')
    .upsert({
      jemaat_id: jemaatId,
      dimension_type: dimensionType,
      current_streak: streakValue,
      longest_streak: streakValue,
      last_update: new Date().toISOString().split('T')[0]
    }, {
      onConflict: 'jemaat_id, dimension_type'
    })
    .select()
  return { data, error }
}

// ============================================
// KOMSEL ATTENDANCE
// ============================================

export async function saveKomselAttendance({ lokasi, anggota, tanggal }) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .insert([{
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      lokasi: lokasi || 'Storehouse',
      anggota: anggota || []
    }])
    .select()
  return { data, error }
}

export async function getKomselAttendance(tanggal) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .select('*')
    .eq('tanggal', tanggal || new Date().toISOString().split('T')[0])
  return { data, error }
}

export async function getKomselAttendanceByTanggal(tanggal) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .select('*')
    .eq('tanggal', tanggal || new Date().toISOString().split('T')[0])
    .maybeSingle()
  return { data, error }
}

// ============================================
// WORKER ATTENDANCE
// ============================================

export async function saveWorkerAttendance({ anggota, meetingDate }) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .insert([{
      tanggal: meetingDate || new Date().toISOString().split('T')[0],
      anggota: anggota || []
    }])
    .select()
  return { data, error }
}

export async function getWorkerAttendance(tanggal) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .select('*')
    .eq('tanggal', tanggal || new Date().toISOString().split('T')[0])
  return { data, error }
}

export async function getWorkerAttendanceByTanggal(tanggal) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .select('*')
    .eq('tanggal', tanggal || new Date().toISOString().split('T')[0])
    .maybeSingle()
  return { data, error }
}

// ============================================
// AUTH
// ============================================

export async function loginJemaat(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function logoutJemaat() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { password_changed: true }
  })
  return { data, error }
}

export function needsPasswordChange(user) {
  return user?.user_metadata?.password_changed !== true
}

// ============================================
// GOALS
// ============================================

export async function saveGoal({ jemaatId, dimension, goalText }) {
  const { data, error } = await supabase
    .from('goals')
    .insert([{
      jemaat_id: jemaatId,
      dimension: dimension,
      goal_text: goalText
    }])
    .select()
  return { data, error }
}

export async function getGoals(jemaatId) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// ============================================
// FOUNDING MEMBER
// ============================================

export async function checkFoundingMember(jemaatId) {
  const { data, error } = await supabase
    .from('founding_member_badges')
    .select('badge_type')
    .eq('jemaat_id', jemaatId)
    .maybeSingle()
  
  return { 
    data: { isFoundingMember: !!data, badge: data?.badge_type || null }, 
    error 
  }
}

export async function awardFoundingBadge(jemaatId, badgeType = 'founder') {
  const { data, error } = await supabase
    .from('founding_member_badges')
    .insert([{
      jemaat_id: jemaatId,
      badge_type: badgeType
    }])
    .select()
  return { data, error }
}