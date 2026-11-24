// src/components/LinksCard.jsx — link YouTube ibadah Minggu (semua) & link Meeting Pekerja (pekerja saja)
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { fmtShort } from '../data/daily'

const T = {
  id: { title: 'Ibadah & pertemuan', minggu: 'Ibadah Minggu · YouTube', pekerja: 'Meeting Pekerja', open: 'Buka' },
  en: { title: 'Services & meetings', minggu: 'Sunday Service · YouTube', pekerja: 'Workers Meeting', open: 'Open' },
}
const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//.test(u) ? u : null)

export default function LinksCard({ lang = 'id' }) {
  const tx = T[lang] || T.id
  const [d, setD] = useState(null)
  useEffect(() => {
    let alive = true
    supabase.rpc('my_links').then(({ data }) => { if (alive) setD(data) }).catch(() => {})
    return () => { alive = false }
  }, [])
  const rows = [['minggu', '#FF3B30', '▶'], ['pekerja', '#0A84FF', '◎']].filter(([k]) => safeUrl(d?.[k]?.link))
  if (!rows.length) return null
  return (
    <section className="mt-4" data-testid="links-card">
      <h2 className="px-4 mb-2 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{tx.title}</h2>
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
        {rows.map(([k, color, icon], i) => (
          <a key={k} href={safeUrl(d[k].link)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 relative active:bg-black/[0.04] dark:active:bg-white/[0.06]">
            {i > 0 && <span className="absolute top-0 right-0 left-14 h-px bg-black/[0.08] dark:bg-white/[0.1]" />}
            <span className="w-[30px] h-[30px] rounded-[8px] text-white flex items-center justify-center text-[14px]" style={{ background: color }}>{icon}</span>
            <span className="flex-1 min-w-0"><span className="block text-[16px] font-medium">{tx[k]}</span>
              <span className="block text-[13px] text-gray-500">{fmtShort(d[k].tanggal, lang)}</span></span>
            <span className="text-[15px] font-semibold text-[#FF8A00]">{tx.open}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
