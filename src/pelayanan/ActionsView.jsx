// src/pelayanan/ActionsView.jsx — daftar tindakan: siapa beresin, kapan selesai, status
import { useEffect, useState } from 'react'
import { getActions, saveAction, lastSundayWIB } from '../services/pelayanan'
import { getTodayWIB } from '../services/database'
import { TEAMS, ACTION_STATUS, fmtDate } from './config'
import { useToast } from '../ui/Toast'
import { Page, Section, inputCls } from './ui'

function ActionCard({ a, onSaved }) {
  const toast = useToast()
  const [v, setV] = useState(a)
  const today = getTodayWIB()
  const done = v.status === 'Selesai' || v.status === 'Dibatalkan'
  const late = !done && v.tenggat && v.tenggat < today
  const save = async (patch) => {
    const next = { ...v, ...patch }; setV(next)
    const { error } = await saveAction({ id: next.id, pic: next.pic, tenggat: next.tenggat || null, status: next.status, catatan: next.catatan, masalah: next.masalah, team: next.team })
    if (error) toast.error('Gagal menyimpan.'); else onSaved && onSaved()
  }
  return (
    <div className={`p-4 border-t first:border-t-0 border-black/[0.08] dark:border-white/[0.1] ${late ? 'bg-[#FF3B30]/[0.06]' : ''}`}>
      <p className="text-[13px] font-semibold text-gray-500">{v.team}{v.tanggal ? ' · ' + fmtDate(v.tanggal, { day: 'numeric', month: 'short' }) : ''}{late && <span className="text-[#FF3B30]"> · TERLAMBAT</span>}</p>
      <p className={`text-[16px] mt-0.5 ${done ? 'line-through text-gray-400' : ''}`}>{v.masalah}</p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <input className={inputCls} placeholder="Siapa yang beresin" defaultValue={v.pic || ''} onBlur={e => e.target.value !== (v.pic || '') && save({ pic: e.target.value })} />
        <input type="date" className={inputCls} value={v.tenggat || ''} onChange={e => save({ tenggat: e.target.value })} />
      </div>
      <select className={inputCls + ' mt-2'} value={v.status} onChange={e => save({ status: e.target.value })}>
        {ACTION_STATUS.map(s => <option key={s}>{s}</option>)}
      </select>
      <input className={inputCls + ' mt-2'} placeholder="Catatan progres (opsional)" defaultValue={v.catatan || ''} onBlur={e => e.target.value !== (v.catatan || '') && save({ catatan: e.target.value })} />
    </div>
  )
}

export default function ActionsView({ currentUser, onBack }) {
  const toast = useToast()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDone, setShowDone] = useState(false)
  const [draft, setDraft] = useState({ team: '', masalah: '' })
  const load = async () => { const { data } = await getActions(); setList(data); setLoading(false) }
  useEffect(() => { load() }, [])

  const open = list.filter(a => a.status !== 'Selesai' && a.status !== 'Dibatalkan')
  const closed = list.filter(a => a.status === 'Selesai' || a.status === 'Dibatalkan')
  const add = async () => {
    if (!draft.team || !draft.masalah.trim()) return toast.error('Pilih team dan tulis masalahnya.')
    const { error } = await saveAction({ tanggal: lastSundayWIB(), team: draft.team, masalah: draft.masalah.trim(), status: 'Belum mulai', created_by: currentUser?.id })
    if (error) return toast.error('Gagal menambah.')
    setDraft({ team: '', masalah: '' }); toast.success('Tindakan ditambahkan'); load()
  }

  return (
    <Page title="Tindakan" onBack={onBack} backLabel="Pelayanan">
      {loading ? <p className="text-center text-gray-500 mt-8">Memuat…</p> : (<>
        <Section title={`Terbuka · ${open.length}`} footer="Satu masalah, satu orang yang beresin, satu tanggal selesai.">
          {open.length === 0 && <p className="p-4 text-gray-500">Tidak ada tindakan terbuka 🙏</p>}
          {open.map(a => <ActionCard key={a.id} a={a} onSaved={load} />)}
        </Section>
        <Section title="Tambah manual">
          <div className="p-4 space-y-2">
            <select className={inputCls} value={draft.team} onChange={e => setDraft(d => ({ ...d, team: e.target.value }))}>
              <option value="">— team —</option>{TEAMS.map(t => <option key={t}>{t}</option>)}
            </select>
            <input className={inputCls} placeholder="Masalah / tugas" value={draft.masalah} onChange={e => setDraft(d => ({ ...d, masalah: e.target.value }))} />
            <button onClick={add} className="w-full h-11 rounded-xl bg-[#FF8A00] text-white font-semibold">Tambah</button>
          </div>
        </Section>
        <button onClick={() => setShowDone(s => !s)} className="w-full h-11 text-[#FF8A00] font-semibold">{showDone ? 'Sembunyikan' : 'Lihat'} yang sudah selesai ({closed.length})</button>
        {showDone && <Section>{closed.map(a => <ActionCard key={a.id} a={a} onSaved={load} />)}</Section>}
      </>)}
    </Page>
  )
}
