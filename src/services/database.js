// src/services/database.js
import { supabase } from '../supabaseClient'

// ============================================
// HELPER: TANGGAL WIB
// ============================================

// Fungsi helper untuk mendapatkan tanggal hari ini dalam WIB
export function getTodayWIB() {
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'Asia/Jakarta' 
  }) // Format: YYYY-MM-DD
}

// Fungsi helper untuk mendapatkan tanggal kemarin dalam WIB
function getYesterdayWIB() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toLocaleDateString('en-CA', { 
    timeZone: 'Asia/Jakarta' 
  })
}

// ============================================
// JEMAAT
// ============================================

// Ambil semua jemaat (HANYA id & nama — untuk keamanan)
export async function getJemaat() {
  const { data, error } = await supabase
    .from('jemaat')
    .select('id, nama')
    .order('nama', { ascending: true })
  return { data, error }
}

export async function getCurrentJemaat() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { data: null, error }
  
  const { data: jemaat, error: jemaatError } = await supabase
    .from('jemaat')
    .select('id, nama, komsel')
    .eq('id', user.id)
    .maybeSingle()
  
  return { data: jemaat, error: jemaatError }
}

export async function getJemaatById(id) {
  const { data, error } = await supabase
    .from('jemaat')
    .select('id, nama, komsel')
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
      tanggal: entryDate || getTodayWIB()
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
  const today = getTodayWIB()
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimension)
    .eq('tanggal', today)
    .order('created_at', { ascending: false })
    .limit(1)
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
  
  const today = getTodayWIB()
  const yesterday = getYesterdayWIB()
  data?.forEach(s => {
    const dim = s.dimension_type
    const masihJalan = s.last_update === today || s.last_update === yesterday
    const val = masihJalan ? (s.current_streak || 0) : 0
    if (dim === 'full_day') {
      streaks.full_day = val
    } else {
      streaks[dim] = val
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

export async function updateStreak(jemaatId, dimensionType) {
  const today = getTodayWIB()
  const yesterday = getYesterdayWIB()
  
  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimensionType)
    .maybeSingle()
  
  if (existing && existing.last_update === today) {
    return { data: existing, error: null }
  }
  
  let newStreak = 1
  let longestStreak = existing?.longest_streak || 0
  
  if (existing) {
    if (existing.last_update === yesterday) {
      newStreak = (existing.current_streak || 0) + 1
    } else {
      newStreak = 1
    }
    longestStreak = Math.max(newStreak, longestStreak)
  }
  
  const { data, error } = await supabase
    .from('streaks')
    .upsert({
      jemaat_id: jemaatId,
      dimension_type: dimensionType,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_update: today
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
      tanggal: tanggal || getTodayWIB(),
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
    .eq('tanggal', tanggal || getTodayWIB())
  return { data, error }
}

export async function getKomselAttendanceByTanggal(tanggal) {
  const { data, error } = await supabase
    .from('komsel_attendance')
    .select('*')
    .eq('tanggal', tanggal || getTodayWIB())
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
      tanggal: meetingDate || getTodayWIB(),
      anggota: anggota || []
    }])
    .select()
  return { data, error }
}

export async function getWorkerAttendance(tanggal) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .select('*')
    .eq('tanggal', tanggal || getTodayWIB())
  return { data, error }
}

export async function getWorkerAttendanceByTanggal(tanggal) {
  const { data, error } = await supabase
    .from('worker_attendance')
    .select('*')
    .eq('tanggal', tanggal || getTodayWIB())
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

export async function sendPasswordReset(email) {
  const redirectTo = `${window.location.origin}/?reset=1&type=recovery`
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo }
  )
  return { data, error }
}

export function isRecoveryLink() {
  const hash = window.location.hash || ''
  const search = window.location.search || ''
  const fullUrl = window.location.href || ''
  
  return (
    hash.includes('type=recovery') ||
    hash.includes('access_token') ||
    search.includes('type=recovery') ||
    search.includes('access_token') ||
    search.includes('reset=1') ||
    search.includes('code=') ||
    fullUrl.includes('#access_token') ||
    fullUrl.includes('?type=recovery')
  )
}

export async function waitForRecoverySession(timeoutMs = 8000) {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return { ready: true, session }

  return new Promise((resolve) => {
    let done = false
    const finish = (result) => {
      if (done) return
      done = true
      try { sub?.data?.subscription?.unsubscribe() } catch (e) {}
      clearTimeout(timer)
      resolve(result)
    }

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) {
        finish({ ready: true, session })
      }
    })

    const timer = setTimeout(async () => {
      const { data: { session: s2 } } = await supabase.auth.getSession()
      finish(s2 ? { ready: true, session: s2 } : { ready: false, session: null })
    }, timeoutMs)
  })
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