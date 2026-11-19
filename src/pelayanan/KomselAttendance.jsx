// src/pelayanan/KomselAttendance.jsx — ketua & pembantu komsel mencatat kehadiran
import { useEffect, useMemo, useState } from 'react'
import { getMembers, getMeetings, saveMeeting, needsCare } from '../services/komsel'
import { getTodayWIB } from '../services/database'
import { fmtDate } from './config'
import { useToast } from '../ui/Toast'
import { Page, Section, Row, inputCls, inputBase, primaryBtn } from './ui'

function Switch({ on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`relative w-[51px] h-[31px] rounded-full transition-colors shrink-0 ${on ? 'bg-[#34C759]' : 'bg-black/[0.12] dark:bg-white/[0.2]'}`}>
      <span className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export default function KomselAttendance({ komsel, currentUser, onBack, backLabel = 'Pelayanan' }) {
  const toast = useToast()
  const [members, setMembers] = useState([])
  const [meetings, setMeetings] = useState([])
  const [tanggal, setTanggal] = useState(getTodayWIB())
  const [hadir, setHadir] = useState({})
  const [tamu, setTamu] = useState(0)
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [m, h] = await Promise.all([getMembers(komsel), getMeetings(komsel)])
    setMembers(m.data); setMeetings(h.data); setLoading(false)
  }
  useEffect(() => { load() }, [komsel]) // eslint-disable-line react-hooks/exhaustive-deps

  // Isi ulang form kalau tanggal ini sudah pernah dicatat
  useEffect(() => {
    const ex = meetings.find(m => m.tanggal === tanggal)
    setHadir(ex ? Object.fromEntries(ex.hadir.map(h => [h.jemaat_id, h.hadir])) : {})
    setTamu(ex?.jumlah_tamu || 0); setCatatan(ex?.catatan || '')
  }, [tanggal, meetings])

  const care = useMemo(() => needsCare(members, meetings), [members, meetings])
  const count = members.filter(m => hadir[m.id]).length
  const pct = members.length ? Math.round((count / members.length) * 100) : 0
  const existing = meetings.some(m => m.tanggal === tanggal)

  const save = async () => {
    if (saving) return
    if (!members.length) return toast.error('Belum ada anggota di komsel ini. Minta admin mengatur anggota.')
    setSaving(true)
    try {
      const hadirMap = Object.fromEntries(members.map(m => [m.id, !!hadir[m.id]]))
      const { error } = await saveMeeting({ komsel, tanggal, jumlah_tamu: tamu, catatan, dicatat_oleh: currentUser?.id, hadirMap })
      if (error) { toast.error('Gagal menyimpan. Periksa koneksi lalu coba lagi.'); return }
      toast.success(`Absensi ${komsel} tersimpan · ${count} hadir`)
      await load()
    } finally { setSaving(false) }
  }

  return (
    <Page title={`Komsel ${komsel}`} onBack={onBack} backLabel={backLabel}>
      {loading ? <p className="text-center text-gray-500 mt-8">Memuat…</p> : (<>
        <Section>
          <div className="p-3 flex items-center gap-3">
            <input type="date" className={inputCls} value={tanggal} max={getTodayWIB()} onChange={e => setTanggal(e.target.value)} />
          </div>
          <div className="px-4 pb-4">
            <p className="text-[15px] text-gray-500"><b className="text-gray-900 dark:text-white text-[20px]">{count}</b> dari {members.length} hadir · {pct}%</p>
            <div className="h-1.5 rounded-full bg-black/[0.08] dark:bg-white/[0.12] mt-2 overflow-hidden"><div className="h-full bg-[#34C759] transition-all" style={{ width: pct + '%' }} /></div>
            {existing && <p className="mt-2 text-[13px] text-[#FF8A00]">Tanggal ini sudah tercatat — kamu sedang mengubahnya.</p>}
          </div>
        </Section>

        {care.length > 0 && (
          <Section title="Perlu disapa" footer="Tidak hadir di 3 pertemuan terakhir. Sapa secara pribadi, bukan di grup.">
            {care.map((m, i) => (
              <Row key={m.id} first={i === 0}>
                <span className="w-8 h-8 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center text-[13px] font-bold shrink-0">{m.nama.split(' ').map(s => s[0]).slice(0, 2).join('')}</span>
                <span className="flex-1 text-[16px]">{m.nama}</span>
                <span className="text-[13px] text-[#FF3B30]">3× absen</span>
              </Row>
            ))}
          </Section>
        )}

        <Section title={`Anggota · ${members.length}`} footer={members.length === 0 ? 'Belum ada anggota. Admin mengatur anggota lewat Pelayanan → Anggota Komsel.' : null}>
          {members.length > 0 && (
            <div className="flex justify-end px-4 pt-3 gap-4 text-[14px] font-semibold text-[#FF8A00]">
              <button onClick={() => setHadir(Object.fromEntries(members.map(m => [m.id, true])))}>Semua hadir</button>
              <button onClick={() => setHadir({})}>Kosongkan</button>
            </div>
          )}
          {members.map((m, i) => (
            <Row key={m.id} first={i === 0}>
              <span className="flex-1 text-[16px]">{m.nama}</span>
              <Switch on={!!hadir[m.id]} onClick={() => setHadir(h => ({ ...h, [m.id]: !h[m.id] }))} />
            </Row>
          ))}
        </Section>

        <Section title="Tambahan">
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="flex-1 text-[16px]">Tamu / non-anggota</span>
            <input type="number" min="0" inputMode="numeric" className={inputBase + ' w-24 shrink-0 text-center'} value={tamu} onChange={e => setTamu(e.target.value)} />
          </div>
          <div className="px-4 pb-4">
            <textarea rows={2} placeholder="Catatan singkat (opsional) — bukan untuk hal pribadi/konseling" className={inputCls + ' resize-none'} value={catatan} onChange={e => setCatatan(e.target.value)} />
          </div>
        </Section>

        <button onClick={save} disabled={saving} className={primaryBtn + ' mb-6'}>{saving ? 'Menyimpan…' : existing ? 'Simpan perubahan' : 'Simpan absensi'}</button>

        {meetings.length > 0 && (
          <Section title="Riwayat pertemuan">
            {meetings.map((m, i) => {
              const c = m.hadir.filter(h => h.hadir).length
              return (
                <Row key={m.id} first={i === 0} onClick={() => setTanggal(m.tanggal)}>
                  <span className="flex-1 text-[15px]">{fmtDate(m.tanggal, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="text-[14px] text-gray-500">{c} hadir{m.jumlah_tamu ? ` + ${m.jumlah_tamu} tamu` : ''}</span>
                </Row>
              )
            })}
          </Section>
        )}
      </>)}
    </Page>
  )
}
