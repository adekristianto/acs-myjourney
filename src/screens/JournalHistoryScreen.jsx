// src/screens/JournalHistoryScreen.jsx — Riwayat Jurnal (F1)
// Timeline per tanggal (terbaru di atas), filter dimensi, 30 per halaman,
// ketuk untuk baca penuh, Edit isi catatan (tanggal tidak bisa diubah).
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { getJournalHistory, updateJournalContent } from '../services/history'
import { DimIcon, IconBack } from '../ui/icons'
import { useToast } from '../ui/Toast'

const PAGE = 30

const L = {
  id: {
    title: 'Riwayat', home: 'Beranda', all: 'Semua', empty: 'Belum ada catatan. Mulai dari Beranda, ya.',
    more: 'Muat lagi', loading: 'Memuat…', edit: 'Ubah', save: 'Simpan', cancel: 'Batal',
    saving: 'Menyimpan…', error: 'Gagal memuat. Coba lagi.', saveError: 'Gagal menyimpan. Coba lagi.',
    saved: 'Tersimpan', verse: 'Ayat', message: 'Pesan', commitment: 'Komitmen', note: 'Catatan',
    dims: { wisdom: 'Akal Budi', physical: 'Fisik', spiritual: 'Rohani', social: 'Sosial' },
    locale: 'id-ID',
  },
  en: {
    title: 'History', home: 'Home', all: 'All', empty: 'No entries yet. Start from Home.',
    more: 'Load more', loading: 'Loading…', edit: 'Edit', save: 'Save', cancel: 'Cancel',
    saving: 'Saving…', error: 'Could not load. Try again.', saveError: 'Could not save. Try again.',
    saved: 'Saved', verse: 'Verse', message: 'Message', commitment: 'Commitment', note: 'Note',
    dims: { wisdom: 'Wisdom', physical: 'Physical', spiritual: 'Spiritual', social: 'Social' },
    locale: 'en-US',
  },
}

const DIMS = [
  { id: 'wisdom', icon: '🧠', color: '#0A84FF' },
  { id: 'physical', icon: '💪', color: '#30D158' },
  { id: 'spiritual', icon: '🙏', color: '#FF9500' },
  { id: 'social', icon: '🤝', color: '#BF5AF2' },
]

// Isi jurnal → daftar field yang bisa ditampilkan/diubah
function fieldsOf(entry) {
  const c = entry.content || {}
  if (entry.dimension_type === 'spiritual') return ['verse', 'message', 'commitment'].filter(k => k in c || true)
  return ['note']
}
function preview(entry) {
  const c = entry.content || {}
  if (entry.dimension_type === 'spiritual') return [c.verse, c.message].filter(Boolean).join(' — ')
  return c.note || ''
}

export default function JournalHistoryScreen({ onBack, currentUser }) {
  const { locale } = useTranslation()
  const toast = useToast()
  const tx = L[locale === 'id' ? 'id' : 'en']
  const jemaatId = currentUser?.id

  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (reset) => {
    if (!jemaatId) return
    setLoading(true)
    setErrorMsg('')
    try {
      const offset = reset ? 0 : items.length
      const { data, error } = await getJournalHistory(jemaatId, { limit: PAGE, offset, dimension: filter })
      if (error) { setErrorMsg('GENERIC'); return }
      setItems(prev => (reset ? data : [...prev, ...data]))
      setHasMore(data.length === PAGE)
    } finally {
      setLoading(false)
    }
    // items.length sengaja tidak di deps (hanya dipakai untuk offset "Muat lagi")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jemaatId, filter])

  useEffect(() => { load(true) }, [load])

  const startEdit = (entry) => {
    const c = entry.content || {}
    const d = {}
    fieldsOf(entry).forEach(k => { d[k] = c[k] || '' })
    setDraft(d)
    setEditId(entry.id)
  }

  const saveEdit = async (entry) => {
    setSaving(true)
    setErrorMsg('')
    try {
      const content = { ...(entry.content || {}), ...draft }
      const { data, error } = await updateJournalContent(entry.id, content, entry._contentIsString)
      if (error || !data) { setErrorMsg('SAVE'); return }
      setItems(prev => prev.map(it => (it.id === entry.id ? { ...it, content: data.content } : it)))
      setEditId(null)
      toast.success(tx.saved)
    } finally {
      setSaving(false)
    }
  }

  // Kelompokkan per tanggal
  const groups = []
  items.forEach(it => {
    const last = groups[groups.length - 1]
    if (last && last.date === it.tanggal) last.items.push(it)
    else groups.push({ date: it.tanggal, items: [it] })
  })
  const fmtDate = (d) => {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString(tx.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return d }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 pb-16">

        {/* HEADER */}
        <nav className="flex items-center h-12 -ml-1">
          <button onClick={onBack} className="flex items-center text-[#FF8A00] text-[17px] active:opacity-60"><IconBack />{tx.home}</button>
        </nav>
        <h1 className="text-[34px] font-bold tracking-tight leading-tight mb-3">{tx.title}</h1>

        {/* FILTER */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {[{ id: 'all', label: tx.all }, ...DIMS.map(d => ({ id: d.id, label: tx.dims[d.id] }))].map(f => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setOpenId(null); setEditId(null) }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f.id
                  ? 'bg-[#FF8A00] border-[#FF8A00] text-white'
                  : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300'
              }`}
            >{f.label}</button>
          ))}
        </div>


        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm">
            {errorMsg === 'SAVE' ? tx.saveError : tx.error}
          </div>
        )}

        {!loading && !errorMsg && items.length === 0 && (
          <p className="mt-16 text-center text-gray-500 dark:text-gray-400">{tx.empty}</p>
        )}

        {/* TIMELINE */}
        {groups.map(g => (
          <section key={g.date} className="mt-5">
            <h2 className="px-1 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{fmtDate(g.date)}</h2>
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E] divide-y divide-gray-100 dark:divide-[#2C2C2E]">
              {g.items.map(entry => {
                const open = openId === entry.id
                const editing = editId === entry.id
                const c = entry.content || {}
                return (
                  <div key={entry.id} className="p-4">
                    <button className="w-full text-left flex gap-3 items-start" onClick={() => { setOpenId(open ? null : entry.id); setEditId(null) }}>
                      <DimIcon id={entry.dimension_type} size={28} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[16px] font-semibold">{tx.dims[entry.dimension_type] || entry.dimension_type}</span>
                        {!open && <span className="block text-sm text-gray-500 dark:text-gray-400 truncate">{preview(entry)}</span>}
                      </span>
                      <span className={`text-gray-300 dark:text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
                    </button>

                    {open && !editing && (
                      <div className="mt-3 pl-10 space-y-3">
                        {fieldsOf(entry).map(k => (c[k] ? (
                          <div key={k}>
                            {entry.dimension_type === 'spiritual' && <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{tx[k]}</div>}
                            <p className="whitespace-pre-wrap leading-relaxed">{c[k]}</p>
                          </div>
                        ) : null))}
                        <button onClick={() => startEdit(entry)} className="text-[#FF8A00] font-semibold text-sm">{tx.edit}</button>
                      </div>
                    )}

                    {open && editing && (
                      <div className="mt-3 pl-10 space-y-3">
                        {Object.keys(draft).map(k => (
                          <div key={k}>
                            {entry.dimension_type === 'spiritual' && <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">{tx[k]}</label>}
                            <textarea
                              value={draft[k]}
                              onChange={e => setDraft(prev => ({ ...prev, [k]: e.target.value }))}
                              rows={k === 'verse' ? 1 : 4}
                              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none"
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button disabled={saving} onClick={() => saveEdit(entry)}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-white ${saving ? 'bg-gray-400' : 'bg-[#FF8A00]'}`}>
                            {saving ? tx.saving : tx.save}
                          </button>
                          <button disabled={saving} onClick={() => setEditId(null)}
                            className="flex-1 py-2.5 rounded-xl font-semibold bg-gray-200 dark:bg-[#2C2C2E]">{tx.cancel}</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {loading && <p className="mt-6 text-center text-gray-500 dark:text-gray-400">{tx.loading}</p>}

        {!loading && hasMore && (
          <button onClick={() => load(false)} className="mt-6 w-full py-3 rounded-xl bg-white dark:bg-[#1C1C1E] font-semibold text-[#FF8A00]">{tx.more}</button>
        )}
      </div>
    </div>
  )
}
