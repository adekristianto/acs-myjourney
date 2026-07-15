// src/services/database.js
import { supabase } from '../supabaseClient'

// ============================================
// JEMAAT
// ============================================

export async function getJemaat() {
  const { data, error } = await supabase
    .from('jemaat')
    .select('*')
  return { data, error }
}

export async function getJemaatById(id) {
  const { data, error } = await supabase
    .from('jemaat')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function getJemaatByEmail(email) {
  const { data, error } = await supabase
    .from('jemaat')
    .select('*')
    .eq('email', email)
    .single()
  return { data, error }
}

// ============================================
// JOURNALS (4 dimensi)
// ============================================

export async function saveJournal({ jemaatId, dimensionType, content, tanggal }) {
  const { data, error } = await supabase
    .from('journals')
    .insert([{
      jemaat_id: jemaatId,
      dimension_type: dimensionType,
      content: content,
      tanggal: tanggal || new Date().toISOString().split('T')[0]
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

export async function getJournalsByDimension(jemaatId, dimensionType) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimensionType)
    .order('tanggal', { ascending: false })
  return { data, error }
}

export async function getTodayJournal(jemaatId, dimensionType) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimensionType)
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
  
  // Format ke object per dimensi
  const streaks = {
    wisdom: 0,
    physical: 0,
    spiritual: 0,
    social: 0,
    full_streak: 0
  }
  
  data?.forEach(s => {
    streaks[s.dimension_type] = s.current_streak || 0
  })
  
  // Full streak = nilai minimum dari semua dimensi
  streaks.full_streak = Math.min(
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

export async function saveKomselAttendance({ tanggal, lokasi, anggota }) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .insert([{
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      lokasi: lokasi,
      anggota: anggota
    }])
    .select()
  return { data, error }
}

export async function getKomselAttendance(tanggal) {
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

export async function saveWorkerAttendance({ tanggal, anggota }) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .insert([{
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      anggota: anggota
    }])
    .select()
  return { data, error }
}

export async function getWorkerAttendance(tanggal) {
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

export async function getCurrentJemaat() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { data: null, error }
  
  // Ambil data jemaat dari tabel
  const { data: jemaat, error: jemaatError } = await supabase
    .from('jemaat')
    .select('*')
    .eq('email', user.email)
    .single()
  
  return { data: jemaat, error: jemaatError }
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  return { data, error }
}

// ============================================
// GOALS
// ============================================

export async function saveGoal({ jemaatId, dimensionType, target, deadline }) {
  const { data, error } = await supabase
    .from('goals')
    .insert([{
      jemaat_id: jemaatId,
      dimension_type: dimensionType,
      target: target,
      deadline: deadline
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

export async function updateGoalStatus(goalId, isCompleted) {
  const { data, error } = await supabase
    .from('goals')
    .update({ is_completed: isCompleted })
    .eq('id', goalId)
    .select()
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