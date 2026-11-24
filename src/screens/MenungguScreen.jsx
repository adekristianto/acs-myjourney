// src/screens/MenungguScreen.jsx — akun sudah ada tapi belum disetujui sebagai jemaat
import { useEffect, useState } from 'react'
import { statusSaya } from '../services/pendaftaran'

export default function MenungguScreen({ onCekLagi, onLogout }) {
  const [p, setP] = useState(undefined)
  const [cek, setCek] = useState(false)
  useEffect(() => { statusSaya().then(({ data }) => setP(data || null)) }, [])

  const cekLagi = async () => {
    setCek(true)
    const ok = await onCekLagi()
    if (!ok) { const { data } = await statusSaya(); setP(data || null) }
    setCek(false)
  }

  const ditolak = p?.status === 'ditolak'
  const [icon, judul, isi] = p === undefined ? ['', '', '']
    : ditolak ? ['🙏', 'Pendaftaran belum bisa disetujui', 'Silakan hubungi admin ACS untuk informasi lebih lanjut.']
    : p ? ['⏳', `Terima kasih, ${p.nama.split(' ')[0]}!`, 'Pendaftaranmu sedang diperiksa admin ACS. Setelah disetujui, buka lagi aplikasi ini atau tekan "Cek lagi".']
    : ['ℹ️', 'Akun belum terhubung', 'Akunmu belum terdaftar sebagai jemaat ACS. Silakan hubungi admin ACS.']

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col justify-center px-6 text-center">
      <div className="w-full max-w-sm mx-auto">
        <img src="/icon-192.png" alt="" className="w-16 h-16 rounded-[15px] mx-auto" />
        {p !== undefined && <>
          <div className="mt-6 text-5xl">{icon}</div>
          <h1 className="mt-3 text-[24px] font-bold text-gray-900 dark:text-white">{judul}</h1>
          <p className="mt-2 text-[15px] text-gray-500 dark:text-gray-400">{isi}</p>
          {!ditolak && (
            <button onClick={cekLagi} disabled={cek}
              className="mt-8 w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold disabled:opacity-60">
              {cek ? 'Memeriksa…' : 'Cek lagi'}
            </button>
          )}
        </>}
        <button onClick={onLogout} className="mt-3 w-full h-11 text-[#FF8A00] text-[16px] font-medium">Keluar</button>
      </div>
    </div>
  )
}
