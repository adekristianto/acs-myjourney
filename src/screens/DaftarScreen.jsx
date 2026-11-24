// src/screens/DaftarScreen.jsx — jemaat baru mendaftar sendiri; masuk antrean persetujuan admin
import { useState } from 'react'
import { daftar } from '../services/pendaftaran'
import { KOMSEL } from '../pelayanan/config'

const row = 'w-full bg-transparent px-4 h-[50px] text-[17px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none'
const Line = () => <div className="h-px bg-black/[0.08] dark:bg-white/[0.1] ml-4" />

export default function DaftarScreen({ onBack, onTerkirim }) {
  const [f, setF] = useState({ nama: '', email: '', hp: '', komsel: '', password: '', ulang: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selesai, setSelesai] = useState(false)
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setError('') }

  const kirim = async () => {
    if (loading) return
    if (f.nama.trim().split(/\s+/).length < 2) return setError('Tulis nama lengkap (nama depan dan belakang).')
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Email belum benar.')
    if (f.hp.replace(/\D/g, '').length < 9) return setError('Nomor HP/WA belum benar.')
    if (f.password.length < 8) return setError('Kata sandi minimal 8 karakter.')
    if (f.password !== f.ulang) return setError('Kedua kata sandi belum sama.')
    setLoading(true)
    const { error: err } = await daftar(f)
    setLoading(false)
    if (err?.code === 'sudah_terdaftar') return setError('Email ini sudah terdaftar. Silakan kembali dan login, atau pakai "Lupa kata sandi?".')
    if (err?.code === 'perlu_konfirmasi') return setSelesai(true)
    if (err) return setError('Pendaftaran belum berhasil. Coba lagi sebentar, atau hubungi admin ACS.')
    onTerkirim()
  }

  if (selesai) return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col justify-center px-6 text-center">
      <div className="text-5xl">🙏</div>
      <h1 className="mt-4 text-[24px] font-bold text-gray-900 dark:text-white">Pendaftaran terkirim</h1>
      <p className="mt-2 text-[15px] text-gray-500 dark:text-gray-400">Admin ACS akan memeriksa dan mengabari kamu.</p>
      <button onClick={onBack} className="mt-8 h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold">Kembali</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col">
      <div className="w-full max-w-sm mx-auto px-4 flex-1 py-8">
        <button onClick={onBack} className="text-[#FF8A00] text-[17px] -ml-1 h-11">‹ Login</button>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight text-gray-900 dark:text-white">Daftar sebagai jemaat</h1>
        <p className="mt-1 mb-6 text-[15px] text-gray-500 dark:text-gray-400">Isi data dirimu. Admin ACS akan menyetujui, lalu kamu bisa langsung memakai My Journey.</p>

        <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
          <input value={f.nama} onChange={set('nama')} placeholder="Nama lengkap" autoComplete="name" className={row} />
          <Line />
          <input type="email" inputMode="email" autoCapitalize="none" autoComplete="email" value={f.email} onChange={set('email')} placeholder="Email" className={row} />
          <Line />
          <input type="tel" inputMode="tel" autoComplete="tel" value={f.hp} onChange={set('hp')} placeholder="No. HP / WhatsApp" className={row} />
        </div>

        <p className="px-4 mt-5 mb-2 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Komsel</p>
        <div className="flex flex-wrap gap-2">
          {[['', 'Belum ikut'], ...KOMSEL.map(k => [k, k])].map(([v, l]) => (
            <button key={l} onClick={() => setF({ ...f, komsel: v })}
              className={`px-3.5 h-9 rounded-full text-[15px] ${f.komsel === v ? 'bg-[#FF8A00] text-white' : 'bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white'}`}>{l}</button>
          ))}
        </div>

        <p className="px-4 mt-5 mb-2 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Buat kata sandi</p>
        <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
          <input type="password" autoComplete="new-password" value={f.password} onChange={set('password')} placeholder="Kata sandi (min. 8 karakter)" className={row} />
          <Line />
          <input type="password" autoComplete="new-password" value={f.ulang} onChange={set('ulang')} placeholder="Ulangi kata sandi" className={row} />
        </div>
        <p className="px-4 mt-2 text-[13px] text-gray-500 dark:text-gray-400">Tanggal lahir, pasangan & keluarga bisa kamu isi sendiri setelah disetujui.</p>

        {error && <p className="px-4 mt-3 text-[14px] text-[#FF3B30]">{error}</p>}
        <button onClick={kirim} disabled={loading}
          className="mt-6 w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold disabled:opacity-60">
          {loading ? 'Mengirim…' : 'Daftar'}
        </button>
      </div>
    </div>
  )
}
