// src/components/TodayCelebrationsCard.jsx — kartu "Hari ini" untuk pastor & admin: siapa ulang tahun / anniversary
import { useEffect, useState } from 'react'
import { getPerayaan, tahunKe } from '../services/keluarga'
import { ordinal, firstName, todayWIB, AYAT_ULTAH, AYAT_ANNIV, pickAyat } from '../data/celebrations'

export default function TodayCelebrationsCard() {
  const [list, setList] = useState([])
  useEffect(() => {
    const day = todayWIB(), m = Number(day.slice(5, 7)), d = Number(day.slice(8, 10))
    const y = Number(day.slice(0, 4)), leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
    getPerayaan(m).then(({ data }) => {
      const feb29 = (r) => !leap && m === 2 && d === 28 && r.tanggal?.slice(5) === '02-29'
      setList((data || []).filter(r => r.hari === d || feb29(r)))
    })
  }, [])
  if (!list.length) return null
  const year = Number(todayWIB().slice(0, 4))

  const msg = (r) => {
    if (r.jenis === 'anniversary') {
      const n = tahunKe(r.tanggal, year), a = pickAyat(AYAT_ANNIV, year)
      return `Happy ${ordinal(n)} Anniversary, ${firstName(r.nama)}${r.keterangan ? ` & ${firstName(r.keterangan)}` : ''}! 💍\n\n"${a.text}" — ${a.ref}\n\nTuhan memberkati, dari GBI ACS 🙏`
    }
    const a = pickAyat(AYAT_ULTAH, year)
    return `Happy Birthday, ${firstName(r.nama)}! 🎂\n\n"${a.text}" — ${a.ref}\n\nTuhan memberkati, dari GBI ACS 🙏`
  }

  return (
    <section className="mt-4" data-testid="today-celebrations">
      <h2 className="px-4 mb-2 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Hari ini · untuk pastor & admin</h2>
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
        {list.map((r, i) => (
          <div key={r.jenis + r.nama + i} className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-black/[0.08] dark:border-white/[0.1]' : ''}`}>
            <span className="text-[24px]">{r.jenis === 'anniversary' ? '💍' : '🎂'}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[16px] font-medium truncate">{r.nama}{r.jenis === 'anniversary' && r.keterangan ? ` & ${r.keterangan}` : ''}</span>
              <span className="block text-[13px] text-gray-500 truncate">
                {r.jenis === 'anniversary' ? `Anniversary ke-${tahunKe(r.tanggal, year)}` : r.keterangan ? `Ulang tahun · ${r.keterangan}` : 'Ulang tahun'}{r.komsel ? ` · ${r.komsel}` : ''}
              </span>
            </span>
            <a href={`https://wa.me/?text=${encodeURIComponent(msg(r))}`} target="_blank" rel="noopener noreferrer"
              className="shrink-0 px-3 h-9 rounded-full bg-[#34C759] text-white text-[14px] font-semibold flex items-center">Ucapkan</a>
          </div>
        ))}
      </div>
    </section>
  )
}
