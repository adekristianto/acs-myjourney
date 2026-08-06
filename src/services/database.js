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

// Kirim email link reset password (self-service "Lupa Password")
export async function sendPasswordReset(email) {
  // Gunakan URL dengan parameter reset=1 agar app bisa mendeteksi
  const redirectTo = `${window.location.origin}/?reset=1&type=recovery`
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo }
  )
  return { data, error }
}

// Cek apakah URL saat ini adalah link recovery dari email
export function isRecoveryLink() {
  const hash = window.location.hash || ''
  const search = window.location.search || ''
  const fullUrl = window.location.href || ''
  
  console.log('🔍 isRecoveryLink check:')
  console.log('  - hash:', hash)
  console.log('  - search:', search)
  console.log('  - fullUrl:', fullUrl)
  
  // Deteksi berbagai format recovery link
  const isRecovery = (
    // Hash format (Supabase default)
    hash.includes('type=recovery') ||
    hash.includes('access_token') ||
    // Search parameter format
    search.includes('type=recovery') ||
    search.includes('access_token') ||
    search.includes('reset=1') ||
    search.includes('code=') ||
    // URL string match
    fullUrl.includes('#access_token') ||
    fullUrl.includes('?type=recovery')
  )
  
  console.log('  - result:', isRecovery)
  return isRecovery
}

// Tunggu sampai Supabase selesai memproses link recovery dan sesi terbentuk.
// Ini KUNCI: updateUser() akan GAGAL kalau sesi belum ada.
export async function waitForRecoverySession(timeoutMs = 8000) {
  console.log('⏳ waitForRecoverySession started...')
  
  // 1. Cek apakah sesi sudah ada
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    console.log('✅ Session already exists:', session.user.email)
    return { ready: true, session }
  }

  // 2. Kalau belum, tunggu event dari Supabase
  return new Promise((resolve) => {
    let done = false
    const finish = (result) => {
      if (done) return
      done = true
      try { sub?.data?.subscription?.unsubscribe() } catch (e) {}
      clearTimeout(timer)
      console.log('⏳ waitForRecoverySession result:', result)
      resolve(result)
    }

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event, session?.user?.email)
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