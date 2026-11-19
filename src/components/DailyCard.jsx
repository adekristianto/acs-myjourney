// src/components/DailyCard.jsx — kartu harian di Beranda (Morning Devotion / baca Alkitab)
// Link Zoom, seri & bahan dibaca dari tabel devotion_settings (diubah admin dari aplikasi).
import { useEffect, useState } from 'react'
import { nowWIB, devotionState, nextDevotionDate, fmtShort } from '../data/daily'
import { getDevotion } from '../services/devotion'

const T = {
  id: {
    md: 'Morning Devotion', time: '07:30–08:30 WIB · Zoom',
    before: 'Hari ini ada Morning Devotion. Sampai jumpa pukul 07:30!',
    live: 'Sedang berlangsung sekarang. Yuk gabung!',
    after: 'Sudah ikut tadi pagi? Catat apa yang Tuhan bicarakan.',
    join: 'Gabung Zoom', write: 'Tulis di jurnal Rohani', noLink: 'Link Zoom ada di grup WA',
    readTitle: 'Waktu bersama Firman', readSub: 'Tidak ada Morning Devotion hari ini. Luangkan 10 menit membaca Alkitab sendiri.',
    read: 'Mulai jurnal Rohani', doneRead: 'Jurnal Rohani hari ini sudah terisi. Teruskan!',
    today: 'Hari ini', nextLbl: 'Berikutnya', last: 'Terakhir',
    next: (d) => `Morning Devotion berikutnya: ${d}, 07:30`,
  },
  en: {
    md: 'Morning Devotion', time: '07:30–08:30 WIB · Zoom',
    before: 'Morning Devotion is on today. See you at 07:30!',
    live: 'Happening right now. Come join us!',
    after: 'Joined this morning? Write down what God spoke to you.',
    join: 'Join Zoom', write: 'Write in Spiritual journal', noLink: 'Zoom link is in the WA group',
    readTitle: 'Time in the Word', readSub: 'No Morning Devotion today. Take 10 minutes to read your Bible.',
    read: 'Start Spiritual journal', doneRead: 'Spiritual journal done today. Keep going!',
    today: 'Today', nextLbl: 'Next', last: 'Last',
    next: (d) => `Next Morning Devotion: ${d}, 07:30`,
  },
}

// Teks bahan: "Hari ini: Ibrani 3" / "Berikutnya: Ibrani 4 · Sabtu, 21 Nov" / "Terakhir: Ibrani 3"
function passageLine(s, today, tx, lang) {
  if (!s?.passage) return null
  if (!s.passage_date || s.passage_date === today) return `${tx.today}: ${s.passage}`
  if (s.passage_date > today) return `${tx.nextLbl}: ${s.passage} · ${fmtShort(s.passage_date, lang)}`
  return `${tx.last}: ${s.passage}`
}

export default function DailyCard({ lang = 'id', spiritualDone = false, onOpenSpiritual, settings: preset }) {
  const tx = T[lang] || T.id
  const [now, setNow] = useState(() => nowWIB())
  const [s, setS] = useState(preset || null)
  useEffect(() => { const t = setInterval(() => setNow(nowWIB()), 60000); return () => clearInterval(t) }, [])
  useEffect(() => {
    if (preset) return
    let alive = true
    getDevotion().then(({ data }) => { if (alive && data) setS(data) })
    return () => { alive = false }
  }, [preset])

  const state = devotionState(now)
  const zoom = s?.zoom_url || ''
  const line = passageLine(s, now.today, tx, lang)

  const btn = 'flex-1 h-11 rounded-xl text-[15px] font-semibold active:scale-[0.98] transition flex items-center justify-center'
  const primary = btn + ' bg-[#FF8A00] text-white'
  const secondary = btn + ' bg-black/[0.05] dark:bg-white/[0.08] text-gray-900 dark:text-white'
  const seriesBlock = (s?.series || line) && (
    <div className="mt-3 rounded-xl bg-[#5856D6]/[0.08] dark:bg-[#5E5CE6]/[0.18] px-3 py-2">
      {s?.series && <p className="text-[12px] font-semibold uppercase tracking-wide text-[#5856D6] dark:text-[#9C9AFF]">{s.series}</p>}
      {line && <p className="text-[15px] font-semibold">{line}</p>}
    </div>
  )

  if (state !== 'none') {
    const live = state === 'live'
    return (
      <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-4 mt-4" data-testid="daily-card">
        <div className="flex items-center gap-2">
          <span className="w-[30px] h-[30px] rounded-[8px] bg-[#5856D6] text-white flex items-center justify-center text-[15px]">☀</span>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-semibold leading-tight">{tx.md}</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">{tx.time}</p>
          </div>
          {live && <span className="text-[11px] font-bold uppercase tracking-wide text-white bg-[#FF3B30] rounded-full px-2 py-0.5">Live</span>}
        </div>
        {seriesBlock}
        <p className="mt-3 text-[15px] text-gray-700 dark:text-gray-300">{tx[state]}</p>
        <div className="mt-3 flex gap-2">
          {state !== 'after' && (zoom
            ? <a href={zoom} target="_blank" rel="noopener noreferrer" className={live ? primary : secondary}>{tx.join}</a>
            : <span className={secondary + ' text-gray-500 dark:text-gray-400 font-medium text-[13px]'}>{tx.noLink}</span>)}
          {state === 'after' && <button onClick={onOpenSpiritual} className={primary}>{spiritualDone ? tx.doneRead : tx.write}</button>}
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-4 mt-4" data-testid="daily-card">
      <div className="flex items-center gap-2">
        <span className="w-[30px] h-[30px] rounded-[8px] bg-[#AF52DE] text-white flex items-center justify-center text-[15px]">✦</span>
        <p className="flex-1 text-[17px] font-semibold">{tx.readTitle}</p>
      </div>
      <p className="mt-3 text-[15px] text-gray-700 dark:text-gray-300">{spiritualDone ? tx.doneRead : tx.readSub}</p>
      {!spiritualDone && <div className="mt-3 flex"><button onClick={onOpenSpiritual} className={primary}>{tx.read}</button></div>}
      <p className="mt-3 text-[12px] text-gray-400 dark:text-gray-500">
        {tx.next(fmtShort(nextDevotionDate(now.today), lang))}
        {s?.passage && s.passage_date && s.passage_date > now.today ? ` · ${s.passage}` : ''}
      </p>
    </section>
  )
}
