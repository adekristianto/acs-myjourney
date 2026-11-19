// src/pelayanan/ReportForm.jsx — ketua team mengisi laporan Minggu
import { useEffect, useState } from 'react'
import { getReport, saveReport, lastSundayWIB } from '../services/pelayanan'
import { TEAMS, TEAM_FIELDS, STATUS, fmtDate } from './config'
import { useToast } from '../ui/Toast'
import { Page, Section, Field, Chips, inputCls, primaryBtn } from './ui'

const EMPTY = { status: '', baik: '', masalah: '', usulan: '', perlu_gembala: false, keputusan: '', detail: {} }

export default function ReportForm({ currentUser, team: fixedTeam, onBack }) {
  const toast = useToast()
  const sundays = [0, 1, 2, 3].map(w => lastSundayWIB(w))
  const [tanggal, setTanggal] = useState(sundays[0])
  const [team, setTeam] = useState(fixedTeam || '')
  const [form, setForm] = useState(EMPTY)
  const [existing, setExisting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    if (!team) return
    setLoading(true)
    getReport(tanggal, team).then(({ data }) => {
      if (!alive) return
      setExisting(!!data)
      setForm(data ? { ...EMPTY, ...data, detail: data.detail || {} } : EMPTY)
      setLoading(false)
    })
    return () => { alive = false }
  }, [tanggal, team])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setD = (k, v) => setForm(f => ({ ...f, detail: { ...f.detail, [k]: v } }))
  const fields = TEAM_FIELDS[team] || []

  const submit = async () => {
    if (saving) return
    if (!team) return toast.error('Pilih team dulu.')
    if (!form.status) return toast.error('Pilih status hari ini.')
    const miss = fields.find(f => f.required && (form.detail[f.key] === undefined || form.detail[f.key] === ''))
    if (miss) return toast.error(`Isi "${miss.label}" dulu.`)
    if (!form.baik.trim()) return toast.error('Isi "Yang berjalan baik".')
    setSaving(true)
    try {
      const { error } = await saveReport({
        tanggal, ibadah: 'Ibadah 1', team,
        pelapor_id: currentUser?.id, pelapor_nama: currentUser?.nama || null,
        status: form.status, baik: form.baik.trim(), masalah: form.masalah.trim() || '-',
        usulan: form.usulan.trim(), perlu_gembala: !!form.perlu_gembala, keputusan: form.perlu_gembala ? form.keputusan.trim() : '',
        detail: form.detail,
      })
      if (error) { toast.error('Gagal menyimpan. Periksa koneksi lalu coba lagi.'); return }
      toast.success(existing ? 'Laporan diperbarui' : 'Laporan terkirim. Terima kasih!')
      onBack()
    } finally { setSaving(false) }
  }

  const renderField = (f) => {
    const v = form.detail[f.key]
    if (f.type === 'textarea') return <textarea rows={3} className={inputCls + ' resize-none'} value={v || ''} onChange={e => setD(f.key, e.target.value)} />
    if (f.type === 'number') return <input type="number" inputMode="numeric" min="0" className={inputCls} value={v ?? ''} onChange={e => setD(f.key, e.target.value === '' ? '' : Number(e.target.value))} />
    if (f.type === 'choice') return <Chips options={f.options} value={v} onChange={x => setD(f.key, x)} />
    if (f.type === 'multi') return <Chips multi options={f.options} value={v} onChange={x => setD(f.key, x)} />
    return <input className={inputCls} value={v || ''} placeholder={f.placeholder} onChange={e => setD(f.key, e.target.value)} />
  }

  return (
    <Page title="Laporan Minggu" onBack={onBack} backLabel="Pelayanan">
      <Section>
        <Field label="Tanggal ibadah">
          <select className={inputCls} value={tanggal} onChange={e => setTanggal(e.target.value)}>
            {sundays.map(s => <option key={s} value={s}>{fmtDate(s)}</option>)}
          </select>
        </Field>
        <Field label="Team">
          {fixedTeam
            ? <p className="text-[17px] font-semibold">{fixedTeam}</p>
            : <select className={inputCls} value={team} onChange={e => setTeam(e.target.value)}>
                <option value="">— pilih team —</option>
                {TEAMS.map(t => <option key={t}>{t}</option>)}
              </select>}
        </Field>
      </Section>

      {team && !loading && (<>
        {existing && <p className="px-4 -mt-3 mb-4 text-[13px] text-[#FF8A00]">Laporan tanggal ini sudah ada — kamu sedang mengubahnya.</p>}

        <Section title="Status hari ini">
          <div className="p-3 grid grid-cols-3 gap-2">
            {STATUS.map(s => (
              <button key={s.id} type="button" onClick={() => set('status', s.id)}
                className={`rounded-xl py-3 px-2 text-center border-2 transition ${form.status === s.id ? 'border-current' : 'border-transparent bg-[#F2F2F7] dark:bg-black/40'}`}
                style={form.status === s.id ? { color: s.color, background: s.color + '1A' } : {}}>
                <span className="block w-3 h-3 rounded-full mx-auto mb-1.5" style={{ background: s.color }} />
                <span className="block text-[15px] font-semibold text-gray-900 dark:text-white">{s.label}</span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{s.desc}</span>
              </button>
            ))}
          </div>
        </Section>

        {fields.length > 0 && (
          <Section title={team}>
            {fields.map(f => <Field key={f.key} label={f.label + (f.required ? ' *' : '')} hint={f.hint}>{renderField(f)}</Field>)}
          </Section>
        )}

        <Section title="Catatan">
          <Field label="Yang berjalan baik *"><textarea rows={2} className={inputCls + ' resize-none'} value={form.baik} onChange={e => set('baik', e.target.value)} /></Field>
          <Field label="Masalah atau kejadian tidak biasa" hint="Fakta, bukan perasaan. Kosongkan kalau tidak ada.">
            <textarea rows={2} className={inputCls + ' resize-none'} value={form.masalah === '-' ? '' : form.masalah} onChange={e => set('masalah', e.target.value)} />
          </Field>
          <Field label="Usulan tindakan" hint="APA — SIAPA — KAPAN. Contoh: Ganti baterai mic — Andi — Jumat">
            <textarea rows={2} className={inputCls + ' resize-none'} value={form.usulan} onChange={e => set('usulan', e.target.value)} />
          </Field>
          <Field label="Perlu keputusan Gembala?">
            <Chips options={['Tidak', 'Ya']} value={form.perlu_gembala ? 'Ya' : 'Tidak'} onChange={x => set('perlu_gembala', x === 'Ya')} />
            {form.perlu_gembala && <textarea rows={2} placeholder="Keputusan apa yang dibutuhkan?" className={inputCls + ' resize-none mt-2'} value={form.keputusan} onChange={e => set('keputusan', e.target.value)} />}
          </Field>
        </Section>

        <p className="px-4 mb-4 text-[13px] text-gray-500 dark:text-gray-400">Keadaan darurat (keselamatan, anak, medis) jangan lewat laporan — langsung telepon.</p>
        <button onClick={submit} disabled={saving} className={primaryBtn}>{saving ? 'Mengirim…' : existing ? 'Simpan perubahan' : 'Kirim laporan'}</button>
      </>)}
      {loading && <p className="text-center text-gray-500 mt-8">Memuat…</p>}
    </Page>
  )
}
