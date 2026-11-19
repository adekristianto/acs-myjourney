// src/pelayanan/AdminPanel.jsx — Yohana: pilih tanggal → semuanya tersusun otomatis
import { useEffect, useMemo, useState } from 'react'
import { getReportsByDate, saveAction, lastSundayWIB } from '../services/pelayanan'
import { ROUTINE_TEAMS, STATUS, fmtDate } from './config'
import { useToast } from '../ui/Toast'
import { Page, Section, Row, Badge, inputCls, primaryBtn } from './ui'

const n = (v) => (typeof v === 'number' ? v : Number(v) || 0)

export default function AdminPanel({ currentUser, onBack, onOpenActions }) {
  const toast = useToast()
  const sundays = [0, 1, 2, 3, 4, 5, 6, 7].map(w => lastSundayWIB(w))
  const [tanggal, setTanggal] = useState(sundays[0])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [made, setMade] = useState({})

  useEffect(() => {
    let alive = true
    setLoading(true)
    getReportsByDate(tanggal).then(({ data }) => { if (alive) { setReports(data); setLoading(false) } })
    return () => { alive = false }
  }, [tanggal])

  const by = useMemo(() => Object.fromEntries(reports.map(r => [r.team, r])), [reports])
  const usher = by['Usher']?.detail || {}, kids = by['Kids Church']?.detail || {}, admin = by['Admin']?.detail || {}
  const dewasa = n(usher.dewasa), tamu = n(usher.tamu_baru), anak = n(kids.murid)
  const lapor = ROUTINE_TEAMS.filter(t => by[t])
  const belum = ROUTINE_TEAMS.filter(t => !by[t])
  const masalah = reports.filter(r => r.masalah && r.masalah !== '-')
  const keputusan = reports.filter(r => r.perlu_gembala)

  const wa = [
    `*Laporan Minggu ACS — ${fmtDate(tanggal, { day: 'numeric', month: 'long', year: 'numeric' })}*`, '',
    `👥 Hadir: ${dewasa} dewasa · ${anak} anak · ${tamu} tamu baru`,
    `📖 Topik: ${admin.topik || '-'}${admin.pengkhotbah ? ' (' + admin.pengkhotbah + ')' : ''}`,
    `✅ Team lapor: ${lapor.length} dari ${ROUTINE_TEAMS.length}${belum.length ? ' (belum: ' + belum.join(', ') + ')' : ''}`, '',
    '🌟 Berjalan baik:', ...(reports.length ? reports.map(r => `• ${r.team}: ${r.baik}`) : ['-']), '',
    '⚠️ Masalah:', ...(masalah.length ? masalah.map(r => `• ${r.team}: ${r.masalah}`) : ['Tidak ada']), '',
    '🙏 Perlu keputusan Gembala:', ...(keputusan.length ? keputusan.map(r => `• ${r.team}: ${r.keputusan || '(lihat laporan)'}`) : ['Tidak ada']),
  ].join('\n')

  const copy = async () => {
    try { await navigator.clipboard.writeText(wa); toast.success('Pesan disalin. Tempel di WhatsApp.') }
    catch { toast.error('Tidak bisa menyalin otomatis. Tekan lama pada teks lalu salin.') }
  }
  const makeAction = async (r) => {
    const { error } = await saveAction({ tanggal, team: r.team, masalah: r.masalah, report_id: r.id, created_by: currentUser?.id,
      status: r.perlu_gembala ? 'Butuh keputusan Gembala' : 'Belum mulai' })
    if (error) return toast.error('Gagal membuat tindakan.')
    setMade(m => ({ ...m, [r.id]: true })); toast.success('Masuk daftar Tindakan. Isi siapa & kapan di sana.')
  }

  return (
    <Page title="Panel Laporan" onBack={onBack} backLabel="Pelayanan">
      <Section>
        <div className="p-3">
          <select className={inputCls + ' font-semibold'} value={tanggal} onChange={e => setTanggal(e.target.value)}>
            {sundays.map(s => <option key={s} value={s}>{fmtDate(s)}</option>)}
          </select>
        </div>
      </Section>
      {loading ? <p className="text-center text-gray-500 mt-8">Memuat…</p> : (<>
        <Section title="Kehadiran">
          <div className="grid grid-cols-3 text-center py-4">
            <div><p className="text-[24px] font-bold">{dewasa}</p><p className="text-[12px] text-gray-500">dewasa</p></div>
            <div className="border-x border-black/[0.08] dark:border-white/[0.1]"><p className="text-[24px] font-bold">{anak}</p><p className="text-[12px] text-gray-500">anak</p></div>
            <div><p className="text-[24px] font-bold">{tamu}</p><p className="text-[12px] text-gray-500">tamu baru</p></div>
          </div>
          <Row><span className="text-[14px] text-gray-500 w-20">Topik</span><span className="flex-1 text-[15px]">{admin.topik || '-'}</span></Row>
        </Section>

        <Section title={`Team lapor · ${lapor.length} dari ${ROUTINE_TEAMS.length}`}>
          {ROUTINE_TEAMS.map((t, i) => {
            const r = by[t]; const st = STATUS.find(s => s.id === r?.status)
            return (
              <Row key={t} first={i === 0}>
                <span className="flex-1 text-[16px]">{t}</span>
                {r ? <><Badge color={st?.color || '#999'}>{st?.label}</Badge><span className="text-[13px] text-gray-500 w-24 truncate text-right">{r.pelapor_nama || ''}</span></>
                   : <span className="text-[14px] text-[#FF3B30] font-medium">Belum lapor</span>}
              </Row>
            )
          })}
        </Section>

        <Section title="Masalah" footer={masalah.length ? 'Ketuk "Jadikan tindakan", lalu isi siapa & kapan di menu Tindakan.' : null}>
          {masalah.length === 0 && <Row first><span className="text-gray-500">Tidak ada masalah 🙏</span></Row>}
          {masalah.map((r, i) => (
            <Row key={r.id} first={i === 0}>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-500">{r.team}</p>
                <p className="text-[15px]">{r.masalah}</p>
                {r.usulan && <p className="text-[13px] text-gray-500 mt-0.5">Usulan: {r.usulan}</p>}
              </div>
              <button disabled={made[r.id]} onClick={() => makeAction(r)}
                className="shrink-0 text-[13px] font-semibold text-[#FF8A00] disabled:text-[#34C759]">{made[r.id] ? '✓ Masuk' : 'Jadikan tindakan'}</button>
            </Row>
          ))}
        </Section>

        <Section title="Perlu keputusan Gembala">
          {keputusan.length === 0 && <Row first><span className="text-gray-500">Tidak ada</span></Row>}
          {keputusan.map((r, i) => <Row key={r.id} first={i === 0}><div><p className="text-[13px] font-semibold text-gray-500">{r.team}</p><p className="text-[15px]">{r.keputusan || '(lihat laporan)'}</p></div></Row>)}
        </Section>

        <Section title="Pesan WhatsApp untuk Ps. Daniel Hendrata">
          <pre className="p-4 text-[14px] whitespace-pre-wrap font-sans leading-relaxed">{wa}</pre>
        </Section>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={copy} className={primaryBtn}>Salin pesan</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(wa)}`} target="_blank" rel="noreferrer"
            className="h-[50px] rounded-xl bg-[#25D366] text-white text-[17px] font-semibold flex items-center justify-center">Buka WhatsApp</a>
        </div>
        <button onClick={onOpenActions} className="w-full h-11 text-[#FF8A00] font-semibold">Buka daftar Tindakan ›</button>
      </>)}
    </Page>
  )
}
