// src/pelayanan/DevotionSettings.jsx — admin mengatur Morning Devotion (link Zoom, seri, bahan)
// Disimpan ke database → langsung tampil di Beranda semua jemaat saat mereka membuka/menyegarkan aplikasi.
import { useEffect, useState } from 'react'
import { Page, Section, Field, inputCls, primaryBtn } from './ui'
import { getDevotion, saveDevotion } from '../services/devotion'
import { nowWIB, nextDevotionDate, fmtShort } from '../data/daily'
import { useToast } from '../ui/Toast'

export default function DevotionSettings({ currentUser, onBack }) {
  const toast = useToast()
  const today = nowWIB().today
  const [f, setF] = useState({ zoom_url: '', series: '', passage: '', passage_date: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updated, setUpdated] = useState(null)
  const set = (k) => (e) => setF(v => ({ ...v, [k]: e.target.value }))

  useEffect(() => {
    let alive = true
    getDevotion().then(({ data }) => {
      if (!alive) return
      if (data) { setF({ zoom_url: data.zoom_url || '', series: data.series || '', passage: data.passage || '', passage_date: data.passage_date || '' }); setUpdated(data.updated_at) }
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const zoomOk = !f.zoom_url || /^https:\/\/([a-z0-9-]+\.)*zoom\.us\//i.test(f.zoom_url.trim())

  async function save() {
    if (!zoomOk) { toast.error('Link Zoom harus diawali https:// dan dari zoom.us'); return }
    setSaving(true)
    try {
      const { error } = await saveDevotion(f, currentUser?.id)
      if (error) toast.error('Gagal menyimpan: ' + (error.message || 'coba lagi'))
      else { toast.success('Tersimpan. Beranda jemaat sudah ikut berubah.'); setUpdated(new Date().toISOString()) }
    } finally { setSaving(false) }
  }

  const nextDate = nextDevotionDate(today, true)
  const quick = [
    { label: `Hari ini (${fmtShort(today)})`, val: today },
    { label: `Berikutnya (${fmtShort(nextDevotionDate(today))})`, val: nextDevotionDate(today) },
  ]

  return (
    <Page title="Morning Devotion" onBack={onBack} backLabel="Pelayanan">
      <Section title="Bahan eksposisi" footer="Ganti setiap selesai sesi: isi pasal berikutnya dan tanggalnya. Jemaat langsung melihatnya di Beranda.">
        <Field label="Seri" hint="Contoh: Eksposisi Kitab Ibrani">
          <input className={inputCls} value={f.series} onChange={set('series')} placeholder="Eksposisi Kitab Ibrani" disabled={loading} />
        </Field>
        <Field label="Bahan / pasal" hint="Contoh: Ibrani 3 atau Ibrani 4:1-13">
          <input className={inputCls} value={f.passage} onChange={set('passage')} placeholder="Ibrani 3" disabled={loading} />
        </Field>
        <Field label="Untuk tanggal">
          <input type="date" className={inputCls} value={f.passage_date} onChange={set('passage_date')} disabled={loading} />
          <div className="flex flex-wrap gap-2 mt-2">
            {quick.map(q => (
              <button key={q.label} type="button" onClick={() => setF(v => ({ ...v, passage_date: q.val }))}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border ${f.passage_date === q.val ? 'bg-[#FF8A00] border-[#FF8A00] text-white' : 'border-gray-300 dark:border-[#3A3A3C] text-gray-700 dark:text-gray-300'}`}>{q.label}</button>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Link Zoom" footer="Kalau dikosongkan, jemaat melihat tulisan “Link Zoom ada di grup WA”.">
        <Field label="Link" hint={zoomOk ? null : '⚠︎ Harus link zoom.us yang diawali https://'}>
          <input className={inputCls} value={f.zoom_url} onChange={set('zoom_url')} placeholder="https://us02web.zoom.us/j/…" inputMode="url" autoCapitalize="off" autoCorrect="off" disabled={loading} />
        </Field>
      </Section>

      <button className={primaryBtn} onClick={save} disabled={loading || saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
      {updated && <p className="mt-3 text-center text-[12px] text-gray-500 dark:text-gray-400">Terakhir diubah {new Date(updated).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} WIB</p>}
      <p className="mt-1 text-center text-[12px] text-gray-400">Sesi berikutnya: {fmtShort(nextDate)}, 07:30</p>
    </Page>
  )
}
