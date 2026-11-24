// src/screens/CheckinScreen.jsx — hasil scan QR / tap NFC absensi
import { JENIS } from '../services/absensi'
import { GOOGLE_REVIEW_URL } from '../data/links'

const MSG = {
  ok: ['✓', '#34C759', 'Kehadiranmu tercatat', 'Terima kasih! Admin akan mengonfirmasi.'],
  sudah: ['✓', '#34C759', 'Sudah tercatat', 'Kamu sudah absen untuk acara ini hari ini.'],
  tutup: ['!', '#FF9500', 'Absensi belum dibuka', 'Coba lagi saat acara berlangsung, atau hubungi admin.'],
  bukan_jemaat: ['!', '#FF9500', 'Akun belum terdaftar sebagai jemaat', 'Hubungi admin ACS.'],
  error: ['!', '#FF3B30', 'Gagal mencatat', 'Periksa koneksi, lalu scan sekali lagi.'],
}

export default function CheckinScreen({ result, onDone }) {
  const [icon, color, title, sub] = MSG[result?.status] || MSG.error
  const label = JENIS[result?.jenis]?.label
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1C1C1E] p-8 text-center">
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-white text-[40px] font-bold" style={{ background: color }}>{icon}</div>
        {label && <p className="mt-5 text-[13px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>}
        <h1 className="mt-1 text-[24px] font-bold">{title}</h1>
        <p className="mt-2 text-[15px] text-gray-600 dark:text-gray-400">{sub}</p>
        <button onClick={onDone} className="mt-8 w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold">Ke Beranda</button>
        {GOOGLE_REVIEW_URL && ['ok', 'sudah'].includes(result?.status) && (
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-[15px] font-semibold">
            <span className="text-[#FBBC04]">★</span> Ceritakan pengalamanmu di Google
          </a>
        )}
      </div>
    </div>
  )
}
