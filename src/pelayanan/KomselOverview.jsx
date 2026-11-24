// src/pelayanan/KomselOverview.jsx — admin: ringkasan 5 komsel + atur anggota
import { useEffect, useMemo, useState } from 'react'
import { getMembers, getMeetings, needsCare, setMemberKomsel } from '../services/komsel'
import { listJemaat } from '../services/pelayanan'
import { KOMSEL, fmtDate } from './config'
import { useToast } from '../ui/Toast'
import { Page, Section, Row, inputCls, inputBase } from './ui'
import { IconChevron } from '../ui/icons'

export function KomselOverview({ onBack, onOpen, onManage }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all(KOMSEL.map(async k => {
      const [m, h] = await Promise.all([getMembers(k), getMeetings(k, 4)])
      const last = h.data[0]
      const reg = m.data.filter(x => !x.gembala)
      return { k, members: reg.length, last, hadir: last ? last.hadir.filter(x => x.hadir && reg.some(r => r.id === x.jemaat_id)).length : 0, care: needsCare(m.data, h.data).length }
    })).then(r => { setRows(r); setLoading(false) })
  }, [])
  return (
    <Page title="Komsel" onBack={onBack} backLabel="Pelayanan">
      {loading ? <p className="text-center text-gray-500 mt-8">Memuat…</p> : (<>
        <Section title="Pertemuan terakhir" footer="Ketuk komsel untuk melihat atau mengisi absensi.">
          {rows.map((r, i) => (
            <Row key={r.k} first={i === 0} onClick={() => onOpen(r.k)}>
              <span className="flex-1 min-w-0">
                <span className="block text-[17px] font-medium">{r.k}</span>
                <span className="block text-[13px] text-gray-500">{r.last ? `${fmtDate(r.last.tanggal, { day: 'numeric', month: 'short' })} · ${r.hadir}/${r.members} hadir` : `${r.members} anggota · belum ada pertemuan tercatat`}</span>
              </span>
              {r.care > 0 && <span className="text-[12px] font-semibold text-white bg-[#FF3B30] rounded-full px-2 py-0.5">{r.care} perlu disapa</span>}
              <span className="text-gray-300 dark:text-gray-600"><IconChevron /></span>
            </Row>
          ))}
        </Section>
        <button onClick={onManage} className="w-full h-11 text-[#FF8A00] font-semibold">Atur anggota komsel ›</button>
      </>)}
    </Page>
  )
}

export function KomselMembersAdmin({ onBack }) {
  const toast = useToast()
  const [people, setPeople] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('Semua')
  const load = async () => { const { data } = await listJemaat(); setPeople(data) }
  useEffect(() => { load() }, [])
  const shown = useMemo(() => people.filter(p =>
    (filter === 'Semua' || (filter === 'Belum ada' ? !p.komsel : p.komsel === filter)) &&
    (!q || (p.nama || '').toLowerCase().includes(q.toLowerCase()))), [people, q, filter])
  const change = async (p, k) => {
    const { error } = await setMemberKomsel(p.id, k)
    if (error) return toast.error('Gagal mengubah komsel.')
    setPeople(ps => ps.map(x => (x.id === p.id ? { ...x, komsel: k || null } : x)))
    toast.success(`${p.nama} → ${k || 'tanpa komsel'}`)
  }
  return (
    <Page title="Anggota Komsel" onBack={onBack} backLabel="Komsel">
      <div className="space-y-2 mb-4">
        <input className={inputCls + ' bg-white dark:bg-[#1C1C1E]'} placeholder="Cari nama…" value={q} onChange={e => setQ(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['Semua', ...KOMSEL, 'Belum ada'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-3 py-1.5 rounded-full text-[14px] font-medium border ${filter === f ? 'bg-[#FF8A00] border-[#FF8A00] text-white' : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-[#333]'}`}>{f}</button>
          ))}
        </div>
      </div>
      <Section title={`${shown.length} orang`}>
        {shown.map((p, i) => (
          <Row key={p.id} first={i === 0}>
            <span className="flex-1 text-[16px] min-w-0 truncate">{p.nama}</span>
            <select className={inputBase + ' w-36 shrink-0 py-1.5'} value={p.komsel || ''} onChange={e => change(p, e.target.value)}>
              <option value="">— belum —</option>{KOMSEL.map(k => <option key={k}>{k}</option>)}
            </select>
          </Row>
        ))}
      </Section>
    </Page>
  )
}
