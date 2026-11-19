// src/components/JournalForm.jsx — satu layout untuk ke-4 jurnal
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { saveJournal, getTodayWIB } from '../services/database'
import { useToast } from '../ui/Toast'
import { DimIcon, IconBack } from '../ui/icons'

const T = {
  id: { back: 'Beranda', save: 'Simpan', saving: 'Menyimpan…', saved: (d) => `${d} tersimpan`, failed: 'Gagal menyimpan. Periksa koneksi lalu coba lagi.',
        required: 'Isi dulu sebelum menyimpan, ya.', login: 'Sesi berakhir. Silakan masuk lagi.', note: 'Tanggal tercatat otomatis hari ini (WIB). Bisa diubah lagi dari Riwayat.' },
  en: { back: 'Home', save: 'Save', saving: 'Saving…', saved: (d) => `${d} saved`, failed: 'Could not save. Check your connection and try again.',
        required: 'Please fill this in before saving.', login: 'Session expired. Please sign in again.', note: 'Dated today automatically (WIB). You can edit it later from History.' },
}

/**
 * fields: [{ key, label:{id,en}, placeholder:{id,en}, rows, required }]
 */
export default function JournalForm({ dimension, title, fields, currentUser, onBack, onComplete }) {
  const { locale } = useTranslation()
  const lang = locale === 'id' ? 'id' : 'en'
  const tx = T[lang]
  const toast = useToast()
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.key, ''])))
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (saving) return
    const missing = fields.find(f => f.required && !values[f.key].trim())
    if (missing) { toast.error(tx.required); return }
    if (!currentUser?.id) { toast.error(tx.login); return }
    setSaving(true)
    try {
      const { error } = await saveJournal({ jemaatId: currentUser.id, dimension, content: values, entryDate: getTodayWIB() })
      if (error) { toast.error(tx.failed); return }
      toast.success(tx.saved(title[lang]))
      onComplete && onComplete()
      onBack()
    } catch {
      toast.error(tx.failed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 pb-12">
        <nav className="flex items-center h-12 -ml-1">
          <button onClick={onBack} className="flex items-center text-[#FF8A00] text-[17px] active:opacity-60"><IconBack />{tx.back}</button>
        </nav>
        <div className="flex items-center gap-3 mt-1 mb-6">
          <DimIcon id={dimension} size={40} />
          <h1 className="text-[30px] font-bold tracking-tight leading-tight">{title[lang]}</h1>
        </div>

        {fields.map(f => (
          <div key={f.key} className="mb-5">
            <label className="block px-4 mb-2 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{f.label[lang]}</label>
            <textarea
              value={values[f.key]}
              onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder?.[lang]}
              rows={f.rows || 6}
              className="w-full rounded-2xl bg-white dark:bg-[#1C1C1E] px-4 py-3 text-[17px] leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/60 resize-none"
            />
          </div>
        ))}

        <p className="px-4 -mt-2 mb-6 text-[13px] text-gray-500 dark:text-gray-400">{tx.note}</p>

        <button onClick={submit} disabled={saving}
          className="w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold disabled:opacity-60 active:scale-[0.99] transition">
          {saving ? tx.saving : tx.save}
        </button>
      </div>
    </div>
  )
}
