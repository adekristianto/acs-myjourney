// src/components/CelebrationPopup.jsx — pop-up ucapan di hari ulang tahun / anniversary (sekali per hari)
import { useEffect, useState } from 'react'
import { getProfil, tahunKe } from '../services/keluarga'
import { AYAT_ULTAH, AYAT_ANNIV, pickAyat, ordinal, firstName, isToday, todayWIB } from '../data/celebrations'

const seenKey = (type, day) => `celebrate-${type}-${day}`
const seen = (k) => { try { return localStorage.getItem(k) === '1' } catch { return false } }
const markSeen = (k) => { try { localStorage.setItem(k, '1') } catch { /* abaikan */ } }

export default function CelebrationPopup({ currentUser }) {
  const [queue, setQueue] = useState([])

  useEffect(() => {
    if (!currentUser?.id) return
    let alive = true
    getProfil(currentUser.id).then(({ data: p }) => {
      if (!alive || !p) return
      const day = todayWIB(), year = Number(day.slice(0, 4)), me = firstName(currentUser.nama)
      const q = []
      if (isToday(p.tanggal_lahir, day) && !seen(seenKey('ultah', day))) {
        q.push({ type: 'ultah', emoji: '🎂', title: `Happy Birthday, ${me}!`, sub: 'Selamat ulang tahun! Tuhan memberkatimu di tahun yang baru ini.', ayat: pickAyat(AYAT_ULTAH, year) })
      }
      if (p.status_nikah === 'menikah' && isToday(p.tanggal_menikah, day) && !seen(seenKey('anniv', day))) {
        const n = tahunKe(p.tanggal_menikah, year), spouse = firstName(p.nama_pasangan)
        if (n > 0) q.push({ type: 'anniv', emoji: '💍', title: `Happy ${ordinal(n)} Anniversary, ${me}${spouse ? ` & ${spouse}` : ''}!`, sub: `Selamat ulang tahun pernikahan ke-${n}. Kiranya kasih kalian makin kuat di dalam Tuhan.`, ayat: pickAyat(AYAT_ANNIV, year) })
      }
      setQueue(q)
    })
    return () => { alive = false }
  }, [currentUser?.id, currentUser?.nama])

  const cur = queue[0]
  if (!cur) return null
  const close = () => { markSeen(seenKey(cur.type, todayWIB())); setQueue(q => q.slice(1)) }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" role="dialog" aria-modal="true" data-testid="celebration">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white p-7 text-center shadow-2xl">
        <div className="text-[56px] leading-none">{cur.emoji}</div>
        <h2 className="mt-4 text-[26px] font-bold leading-tight">{cur.title}</h2>
        <p className="mt-2 text-[15px] text-gray-600 dark:text-gray-400">{cur.sub}</p>
        <blockquote className="mt-5 rounded-2xl bg-[#FF8A00]/10 px-4 py-4 text-left">
          <p className="text-[15px] leading-relaxed italic">“{cur.ayat.text}”</p>
          <p className="mt-2 text-[13px] font-semibold text-[#FF8A00]">{cur.ayat.ref}</p>
        </blockquote>
        <p className="mt-4 text-[13px] text-gray-500">Dengan kasih, keluarga besar GBI ACS</p>
        <button onClick={close} className="mt-5 w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold">Amin 🙏</button>
      </div>
    </div>
  )
}
