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

// PERBAIKAN: getJemaatByEmail DIHAPUS karena kolom email sudah tidak bisa di-select

export async function getCurrentJemaat() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { data: null, error }
  
  // PERBAIKAN: Cari berdasarkan id (auth.uid) dan batasi kolomnya
  const { data: jemaat, error: jemaatError } = await supabase
    .from('jemaat')
    .select('id, nama, komsel')
    .eq('id', user.id)
    .maybeSingle()
  
  return { data: jemaat, error: jemaatError }
}

export async function getJemaatById(id) {
  // PERBAIKAN: Batasi kolom yang diambil
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
      tanggal: entryDate || getTodayWIB()  // ← Pakai WIB
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
  const today = getTodayWIB()  // ← Pakai WIB
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
// STREAKS — PERBAIKAN: PER HARI, BUKAN +1 SETIAP SIMPAN
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

// PERBAIKAN: Streak dihitung per hari berturut-turut
// - Isi 2x sehari = tetap +1 (bukan +2)
// - Bolong sehari = reset ke 1
// - longest_streak tidak boleh turun
export async function updateStreak(jemaatId, dimensionType, streakValue) {
  const today = getTodayWIB()
  const yesterday = getYesterdayWIB()
  
  // 1. Ambil streak yang ada
  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('jemaat_id', jemaatId)
    .eq('dimension_type', dimensionType)
    .maybeSingle()
  
  // 2. Kalau sudah update hari ini, jangan tambah lagi
  if (existing && existing.last_update === today) {
    return { data: existing, error: null }
  }
  
  // 3. Hitung streak baru
  let newStreak = 1
  let longestStreak = existing?.longest_streak || 0
  
  if (existing) {
    if (existing.last_update === yesterday) {
      // Lanjut streak (kemarin sudah isi)
      newStreak = (existing.current_streak || 0) + 1
    } else {
      // Bolong sehari atau lebih → reset ke 1
      newStreak = 1
    }
    // longest_streak tidak boleh turun
    longestStreak = Math.max(newStreak, longestStreak)
  }
  
  // 4. Upsert
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

// Kirim email link reset password
export async function sendPasswordReset(email) {
  const redirectTo = `${window.location.origin}/?reset=1&type=recovery`
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo }
  )
  return { data, error }
}

// Cek apakah URL saat ini adalah link recovery dari email
// PERBAIKAN: Tidak ada console.log URL (keamanan)
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

// Tunggu sampai Supabase selesai memproses link recovery dan sesi terbentuk
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