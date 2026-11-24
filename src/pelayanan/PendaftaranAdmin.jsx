// src/pelayanan/PendaftaranAdmin.jsx — admin menyetujui jemaat yang daftar sendiri
import { useEffect, useState } from 'react'
import { useToast } from '../ui/Toast'
import { Page, Section, Row } from './ui'
import { listPendaftaran, setujui, tolak } from '../services/pendaftaran'
import { KOMSEL } from './config'

const tgl = (s) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })
const wa = (hp) => { const d = (hp || '').replace(/\D/g, ''); return d ? 'https://wa.me/' + (d.startsWith('0') ? '62' + d.slice(1) : d) : null }

function Kartu({ p, onSelesai }) {
  const toast = useToast()
  const [komsel, setKomsel] = useState(p.komsel || '')
  const [busy, setBusy] = useState(false)
  const aksi = async (fn, pesan) => {
    setBusy(true)
    const { error } = await fn()
    setBusy(false)
    if (error) return toast.error('Gagal. Coba lagi.')
    toast.success(pesan); onSelesai()
  }
  return (
    <div className="px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[17px] font-semibold">{p.nama}</p>
        <span className="text-[13px] text-gray-500">{tgl(p.dibuat)}</span>
      </div>
      <p className="text-[14px] text-gray-500 dark:text-gray-400 break-all">{p.email}</p>
      {p.hp && <a href={wa(p.hp)} target="_blank" rel="noreferrer" className="text-[14px] text-[#34C759]">WA {p.hp}</a>}
      {p.mirip && <p className="mt-1 text-[13px] text-[#FF9500]">Mungkin sudah terdaftar: {p.mirip}. Cek dulu supaya tidak dobel.</p>}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[['', 'Belum ikut'], ...KOMSEL.map(k => [k, k])].map(([v, l]) => (
          <button key={l} onClick={() => setKomsel(v)}
            className={`px-3 h-8 rounded-full text-[14px] ${komsel === v ? 'bg-[#FF8A00] text-white' : 'bg-[#F2F2F7] dark:bg-black/40'}`}>{l}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={() => aksi(() => setujui(p.id, komsel), `${p.nama.split(' ')[0]} sudah jadi jemaat`)}
          className="flex-1 h-10 rounded-xl bg-[#34C759] text-white font-semibold disabled:opacity-50">Setujui</button>
        <button disabled={busy} onClick={() => aksi(() => tolak(p.id), 'Ditolak')}
          className="px-4 h-10 rounded-xl bg-[#F2F2F7] dark:bg-black/40 text-[#FF3B30] font-semibold disabled:opacity-50">Tolak</button>
      </div>
    </div>
  )
}

export default function PendaftaranAdmin({ onBack }) {
  const [list, setList] = useState(null)
  const muat = () => listPendaftaran().then(({ data }) => setList(data))
  useEffect(() => { muat() }, [])
  const menunggu = (list || []).filter(p => p.status === 'menunggu')
  const selesai = (list || []).filter(p => p.status !== 'menunggu')

  return (
    <Page title="Pendaftaran" onBack={onBack} backLabel="Pelayanan">
      <Section title={`Menunggu persetujuan · ${menunggu.length}`}
        footer="Setujui hanya orang yang kamu kenal / sudah dicek. Setelah disetujui, ia langsung bisa memakai aplikasi dengan kata sandinya sendiri.">
        {list === null && <p className="p-4 text-[15px] text-gray-500">Memuat…</p>}
        {list && !menunggu.length && <p className="p-4 text-[15px] text-gray-500">Tidak ada pendaftaran baru.</p>}
        {menunggu.map((p, i) => <div key={p.id} className={i ? 'border-t border-black/[0.08] dark:border-white/[0.1]' : ''}><Kartu p={p} onSelesai={muat} /></div>)}
      </Section>
      {selesai.length > 0 && (
        <Section title="14 hari terakhir">
          {selesai.map((p, i) => (
            <Row key={p.id} first={i === 0}>
              <span className="flex-1 text-[16px]">{p.nama}{p.komsel ? ` · ${p.komsel}` : ''}</span>
              <span className={`text-[14px] ${p.status === 'disetujui' ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>{p.status === 'disetujui' ? 'Disetujui' : 'Ditolak'}</span>
            </Row>
          ))}
        </Section>
      )}
    </Page>
  )
}
