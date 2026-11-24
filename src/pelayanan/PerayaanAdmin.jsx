// src/pelayanan/PerayaanAdmin.jsx — admin: ulang tahun & anniversary per bulan + kelengkapan data
import { useEffect, useMemo, useState } from 'react'
import { Page, Section, Row } from './ui'
import { getPerayaan, getKelengkapan, tahunKe } from '../services/keluarga'
import { useToast } from '../ui/Toast'

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const todayWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })

export default function PerayaanAdmin({ onBack }) {
  const toast = useToast()
  const t = todayWIB()
  const year = Number(t.slice(0, 4)), nowMonth = Number(t.slice(5, 7)), nowDay = Number(t.slice(8, 10))
  const [bulan, setBulan] = useState(nowMonth)
  const [rows, setRows] = useState([])
  const [lengkap, setLengkap] = useState(null)
  const [showMissing, setShowMissing] = useState(false)

  useEffect(() => { getPerayaan(bulan).then(({ data }) => setRows(data)) }, [bulan])
  useEffect(() => { getKelengkapan().then(({ data }) => setLengkap(data)) }, [])

  const ultah = rows.filter(r => r.jenis === 'ulang_tahun')
  const anniv = rows.filter(r => r.jenis === 'anniversary')
  const soon = (r) => bulan === nowMonth && r.hari >= nowDay && r.hari < nowDay + 7

  const wa = useMemo(() => {
    const line = (r) => `• ${r.hari} ${BULAN[bulan - 1]} — ${r.nama}${r.keterangan ? ` (${r.keterangan})` : ''}${r.jenis === 'anniversary' && r.tanggal ? ` · ${tahunKe(r.tanggal, year)} th` : ''}`
    return [`*Ulang Tahun & Anniversary ACS — ${BULAN[bulan - 1]} ${year}*`, '',
      `🎂 Ulang tahun (${ultah.length}):`, ...(ultah.length ? ultah.map(line) : ['• —']), '',
      `💍 Anniversary (${anniv.length}):`, ...(anniv.length ? anniv.map(line) : ['• —'])].join('\n')
  }, [ultah, anniv, bulan, year])

  const List = ({ list, icon, empty }) => list.length ? list.map((r, i) => (
    <Row key={r.jenis + r.nama + r.hari + i} first={i === 0}>
      <span className="w-10 text-center"><span className="block text-[20px] font-bold leading-none">{r.hari}</span><span className="text-[11px] text-gray-500">{BULAN[bulan - 1].slice(0, 3)}</span></span>
      <span className="flex-1 min-w-0"><span className="block text-[16px]">{icon} {r.nama}</span>
        <span className="block text-[13px] text-gray-500">{[r.keterangan, r.jenis === 'anniversary' && r.tanggal ? `${tahunKe(r.tanggal, year)} tahun` : null, r.komsel].filter(Boolean).join(' · ')}</span></span>
      {soon(r) && <span className="text-[11px] font-bold uppercase text-white bg-[#FF8A00] rounded-full px-2 py-0.5">Minggu ini</span>}
    </Row>
  )) : <p className="p-4 text-[15px] text-gray-500">{empty}</p>

  return (
    <Page title="Ulang Tahun & Anniversary" onBack={onBack} backLabel="Pelayanan">
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        {BULAN.map((b, i) => (
          <button key={b} onClick={() => setBulan(i + 1)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[14px] font-medium ${bulan === i + 1 ? 'bg-[#FF8A00] text-white' : 'bg-white dark:bg-[#1C1C1E]'}`}>{b.slice(0, 3)}</button>
        ))}
      </div>

      <Section title={`Ulang tahun · ${ultah.length}`}><List list={ultah} icon="🎂" empty="Belum ada data bulan ini." /></Section>
      <Section title={`Anniversary · ${anniv.length}`}><List list={anniv} icon="💍" empty="Belum ada data bulan ini." /></Section>

      <div className="mb-6 flex gap-2">
        <button onClick={() => navigator.clipboard?.writeText(wa).then(() => toast.success('Pesan disalin.'))} className="flex-1 h-11 rounded-xl bg-[#FF8A00] text-white font-semibold">Salin pesan</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(wa)}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-11 rounded-xl bg-[#34C759] text-white font-semibold flex items-center justify-center">Buka WhatsApp</a>
      </div>

      {lengkap && (
        <Section title="Kelengkapan data" footer="Jemaat mengisi sendiri di Beranda → Profil & Keluarga.">
          <Row first><span className="flex-1 text-[16px]">Sudah isi tanggal lahir</span><span className="text-[16px] font-semibold">{lengkap.profil} / {lengkap.jemaat}</span></Row>
          <Row onClick={() => setShowMissing(s => !s)}><span className="flex-1 text-[16px] text-[#FF8A00]">{showMissing ? 'Sembunyikan' : 'Lihat'} yang belum ({(lengkap.belum || []).length})</span></Row>
          {showMissing && <p className="px-4 pb-4 text-[14px] text-gray-600 dark:text-gray-400">{(lengkap.belum || []).join(', ') || '—'}</p>}
        </Section>
      )}
    </Page>
  )
}
