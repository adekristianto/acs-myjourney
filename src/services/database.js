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
// JOURNALS (4 dimensi) — pakai 'dimension_type'
// ============================================

export async function saveJournal({ jemaatId, dimension, content, entryDate }) {
  const { data, error } = await supabase
    .from('journals')
    .insert([{
      jemaat_id: jemaatId,
      dimension_type: dimension,   // ← pakai 'dimension_type'
      content: content,
      tanggal: entryDate || new Date().toISOString().split('T')[0]  // ← pakai 'tanggal'
    }])
    .select()
  return { data, error }
}

export async function getJournalsByJemaat(jemaatId) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .order('tanggal', { ascending: false })  // ← 'tanggal'
  return { data, error }
}

export async function getJournalsByDimension(jemaatId, dimension) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimension)    // ← 'dimension_type'
    .order('tanggal', { ascending: false })
  return { data, error }
}

export async function getTodayJournal(jemaatId, dimension) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimension)    // ← 'dimension_type'
    .eq('tanggal', today)                // ← 'tanggal'
    .maybeSingle()
  return { data, error }
}

// ============================================
// STREAKS — SESUAI SCHEMA Supabase
// ============================================

export async function getStreaks(jemaatId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('jemaat_id', jemaatId)
  
  if (error) return { data: null, error }
  
  // Default streak values
  const streaks = {
    wisdom: 0,
    physical: 0,
    spiritual: 0,
    social: 0,
    full_day: 0
  }
  
  // Isi dari database — pakai 'dimension_type'
  data?.forEach(s => {
    const dim = s.dimension_type
    if (dim === 'full_day') {
      streaks.full_day = s.current_streak || 0
    } else {
      streaks[dim] = s.current_streak || 0
    }
  })
  
  // Hitung full_day dari minimum semua dimensi
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
      dimension_type: dimensionType,   // ← pakai 'dimension_type'
      current_streak: streakValue,
      longest_streak: streakValue,
      last_update: new Date().toISOString().split('T')[0]  // ← pakai 'last_update'
    }, {
      onConflict: 'jemaat_id, dimension_type'
    })
    .select()
  return { data, error }
}

// ============================================
// KOMSEL ATTENDANCE
// ============================================

export async function saveKomselAttendance({ 
  jemaatId, 
  komsel, 
  lokasi, 
  present, 
  recordedBy,
  attendanceDate 
}) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .upsert({
      jemaat_id: jemaatId,
      komsel: komsel,
      lokasi: lokasi || null,
      attendance_date: attendanceDate || new Date().toISOString().split('T')[0],
      present: present || false,
      recorded_by: recordedBy || null
    }, {
      onConflict: 'jemaat_id, attendance_date'
    })
    .select()
  return { data, error }
}

export async function getKomselAttendance(date) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .select('*')
    .eq('attendance_date', date || new Date().toISOString().split('T')[0])
  return { data, error }
}

export async function getKomselAttendanceByJemaat(jemaatId, date) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('attendance_date', date || new Date().toISOString().split('T')[0])
    .maybeSingle()
  return { data, error }
}

// ============================================
// WORKER ATTENDANCE
// ============================================

export async function saveWorkerAttendance({ 
  jemaatId, 
  present, 
  recordedBy,
  meetingDate 
}) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .upsert({
      jemaat_id: jemaatId,
      meeting_date: meetingDate || new Date().toISOString().split('T')[0],
      present: present || false,
      recorded_by: recordedBy || null
    }, {
      onConflict: 'jemaat_id, meeting_date'
    })
    .select()
  return { data, error }
}

export async function getWorkerAttendance(date) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .select('*')
    .eq('meeting_date', date || new Date().toISOString().split('T')[0])
  return { data, error }
}

export async function getWorkerAttendanceByJemaat(jemaatId, date) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('meeting_date', date || new Date().toISOString().split('T')[0])
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
  // Sekaligus tandai bahwa password sudah pernah diganti,
  // supaya layar "Buat kata sandi sendiri" tidak muncul lagi
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { password_changed: true }
  })
  return { data, error }
}

// Cek apakah user masih memakai password default (Nomor Induk)
export function needsPasswordChange(user) {
  return user?.user_metadata?.password_changed !== true
}

// ============================================
// GOALS — SESUAI SCHEMA
// ============================================

export async function saveGoal({ jemaatId, dimension, goalText }) {
  const { data, error } = await supabase
    .from('goals')
    .insert([{
      jemaat_id: jemaatId,
      dimension: dimension,      // ← 'dimension'
      goal_text: goalText        // ← 'goal_text'
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