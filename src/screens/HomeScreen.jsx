// src/screens/HomeScreen.jsx — Beranda (redesign iOS)
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { getSalutation, getGreetingMessage } from '../data/greetings'
import { getJourneyStats } from '../services/history'
import { DimIcon, IconChevron, IconCheck, IconMoon, IconSun, IconLogout, IconBook } from '../ui/icons'

const L = {
  id: {
    today: 'Hari ini', of: 'dari 4 dimensi', allDone: 'Lengkap hari ini. Luar biasa!', keepGoing: 'Satu langkah lagi tetap berarti.',
    done: 'Selesai', streak: (n) => `${n} hari beruntun`, journey: 'Perjalananmu', history: 'Lihat riwayat jurnal',
    entries: 'catatan', days: 'hari aktif', since: 'sejak', logout: 'Keluar', locale: 'id-ID',
    dims: { wisdom: 'Akal Budi', physical: 'Fisik', spiritual: 'Rohani', social: 'Sosial' },
    prompts: { wisdom: 'Apa yang kamu pelajari hari ini?', physical: 'Gerak, makan, istirahat', spiritual: 'Ayat & renungan', social: 'Siapa yang kamu berkati?' },
    verse: 'Lukas 2:52',
  },
  en: {
    today: 'Today', of: 'of 4 dimensions', allDone: 'All four done today. Amazing!', keepGoing: 'One more step still counts.',
    done: 'Done', streak: (n) => `${n}-day streak`, journey: 'Your journey', history: 'View journal history',
    entries: 'entries', days: 'active days', since: 'since', logout: 'Log out', locale: 'en-US',
    dims: { wisdom: 'Wisdom', physical: 'Physical', spiritual: 'Spiritual', social: 'Social' },
    prompts: { wisdom: 'What did you learn today?', physical: 'Move, eat, rest', spiritual: 'Scripture & reflection', social: 'Who did you bless today?' },
    verse: 'Luke 2:52',
  },
}

function Ring({ value, total = 4 }) {
  const r = 30, c = 2 * Math.PI * r, p = Math.min(1, value / total)
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
      <circle cx="38" cy="38" r={r} fill="none" strokeWidth="8" className="stroke-black/[0.07] dark:stroke-white/[0.12]" />
      <circle cx="38" cy="38" r={r} fill="none" stroke="#FF8A00" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${c * p} ${c}`} transform="rotate(-90 38 38)" style={{ transition: 'stroke-dasharray .6s ease' }} />
      <text x="38" y="44" textAnchor="middle" fontSize="18" fontWeight="700" className="fill-gray-900 dark:fill-white">{value}/{total}</text>
    </svg>
  )
}

export default function HomeScreen({ currentUser, darkMode, toggleDarkMode, dimensions, streaks, onDimensionClick, onHistoryClick, onLogout }) {
  const { locale, toggleLocale } = useTranslation()
  const lang = locale === 'id' ? 'id' : 'en'
  const tx = L[lang]
  const firstName = (currentUser?.nama || '').trim().split(/\s+/)[0]
  const message = useMemo(() => getGreetingMessage(lang), [lang])
  const done = dimensions.filter(d => d.completed).length
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let alive = true
    if (currentUser?.id) getJourneyStats(currentUser.id).then(({ data }) => { if (alive) setStats(data) })
    return () => { alive = false }
  }, [currentUser?.id, done])

  const sinceText = stats?.since
    ? new Date(stats.since + 'T00:00:00').toLocaleDateString(tx.locale, { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const iconBtn = 'w-9 h-9 rounded-full flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.08] text-gray-700 dark:text-gray-200 active:scale-95 transition'

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 pb-12">

        {/* Toolbar */}
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={toggleLocale} className={iconBtn + ' text-[11px] font-bold tracking-wide'} aria-label="Language">{lang === 'id' ? 'EN' : 'ID'}</button>
          <button onClick={toggleDarkMode} className={iconBtn} aria-label="Theme">{darkMode ? <IconSun /> : <IconMoon />}</button>
          <button onClick={onLogout} className={iconBtn} aria-label={tx.logout}><IconLogout /></button>
        </div>

        {/* Greeting */}
        <header className="text-center mt-2 mb-6">
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500">ACS · My Journey</p>
          <p className="mt-3 text-[17px] text-gray-500 dark:text-gray-400">{getSalutation(lang)}{firstName ? ',' : ''}</p>
          {firstName && <h1 className="text-[34px] leading-tight font-bold tracking-tight">{firstName}</h1>}
          <p className="mt-2 text-[15px] italic text-gray-500 dark:text-gray-400 px-4 leading-snug">{message}</p>
        </header>

        {/* Progress */}
        <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-4 flex items-center gap-4">
          <Ring value={done} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{tx.today}</p>
            <p className="text-[22px] font-bold leading-tight">{done} <span className="font-semibold text-gray-500 dark:text-gray-400 text-[17px]">{tx.of}</span></p>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">{done === 4 ? tx.allDone : tx.keepGoing}</p>
          </div>
        </section>

        {/* Dimensions */}
        <h2 className="mt-7 mb-2 px-4 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{tx.verse}</h2>
        <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
          {dimensions.map((d, i) => {
            const s = streaks?.[d.id] || 0
            return (
              <button key={d.id} onClick={() => onDimensionClick(d.id)}
                className="w-full flex items-center gap-3 pl-4 pr-3 py-3 text-left active:bg-black/[0.04] dark:active:bg-white/[0.06] relative">
                {i > 0 && <span className="absolute top-0 right-0 left-[58px] h-px bg-black/[0.08] dark:bg-white/[0.1]" />}
                <DimIcon id={d.id} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[17px] font-medium">{tx.dims[d.id]}</span>
                  <span className="block text-[13px] text-gray-500 dark:text-gray-400 truncate">
                    {d.completed ? tx.done : tx.prompts[d.id]}{s > 0 ? ` · 🔥 ${tx.streak(s)}` : ''}
                  </span>
                </span>
                {d.completed
                  ? <span className="w-6 h-6 rounded-full bg-[#34C759] text-white flex items-center justify-center shrink-0"><IconCheck /></span>
                  : <span className="text-gray-300 dark:text-gray-600 shrink-0"><IconChevron /></span>}
              </button>
            )
          })}
        </section>

        {/* Journey */}
        <h2 className="mt-7 mb-2 px-4 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{tx.journey}</h2>
        <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
          <div className="grid grid-cols-3 text-center py-4">
            <div><p className="text-[22px] font-bold">{stats?.entries ?? '–'}</p><p className="text-[12px] text-gray-500 dark:text-gray-400">{tx.entries}</p></div>
            <div className="border-x border-black/[0.08] dark:border-white/[0.1]"><p className="text-[22px] font-bold">{stats?.days ?? '–'}</p><p className="text-[12px] text-gray-500 dark:text-gray-400">{tx.days}</p></div>
            <div><p className="text-[15px] font-bold leading-[33px]">{sinceText || '–'}</p><p className="text-[12px] text-gray-500 dark:text-gray-400">{tx.since}</p></div>
          </div>
          <button onClick={onHistoryClick} className="w-full flex items-center gap-3 pl-4 pr-3 py-3 border-t border-black/[0.08] dark:border-white/[0.1] active:bg-black/[0.04] dark:active:bg-white/[0.06]">
            <span className="w-[30px] h-[30px] rounded-[8px] bg-gray-500 text-white flex items-center justify-center"><IconBook size={17} /></span>
            <span className="flex-1 text-left text-[17px] font-medium">{tx.history}</span>
            <span className="text-gray-300 dark:text-gray-600"><IconChevron /></span>
          </button>
        </section>

        <p className="mt-8 text-center text-[12px] text-gray-400 dark:text-gray-600">GBI ACS · My Journey</p>
      </div>
    </div>
  )
}
