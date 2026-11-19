// src/data/daily.js — jadwal & hitungan waktu kartu harian Beranda
// Link Zoom, seri dan bahan diatur ADMIN dari aplikasi (Pelayanan → Morning Devotion), bukan di sini.

// 0=Minggu ... 6=Sabtu. Morning Devotion: Selasa, Kamis, Sabtu.
export const DEVOTION_DAYS = [2, 4, 6]
export const DEVOTION_START = 7 * 60 + 30 // 07:30
export const DEVOTION_END = 8 * 60 + 30   // 08:30

// Hari, menit, dan tanggal (YYYY-MM-DD) saat ini dalam WIB, apa pun zona waktu HP pengguna
export function nowWIB(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date)
  const get = (t) => parts.find(p => p.type === t)?.value
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  const minutes = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10)
  const today = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  return { day, minutes, today }
}

// 'before' | 'live' | 'after' | 'none'
export function devotionState({ day, minutes }) {
  if (!DEVOTION_DAYS.includes(day)) return 'none'
  if (minutes < DEVOTION_START - 15) return 'before'
  if (minutes <= DEVOTION_END) return 'live'
  return 'after'
}

// Tanggal Morning Devotion berikutnya (YYYY-MM-DD). includeToday: hitung hari ini kalau hari devotion.
export function nextDevotionDate(fromYmd, includeToday = false) {
  const d = new Date(fromYmd + 'T12:00:00Z')
  for (let i = includeToday ? 0 : 1; i <= 7; i++) {
    const x = new Date(d.getTime() + i * 86400000)
    if (DEVOTION_DAYS.includes(x.getUTCDay())) return x.toISOString().slice(0, 10)
  }
  return fromYmd
}

export function fmtShort(ymd, lang = 'id') {
  if (!ymd) return ''
  return new Date(ymd + 'T12:00:00Z').toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })
}
