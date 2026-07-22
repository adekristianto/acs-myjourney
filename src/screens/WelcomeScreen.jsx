import { useEffect, useState } from 'react'
import { getCurrentJemaat, checkFoundingMember } from '../services/database'
import { useTranslation } from '../hooks/useTranslation'

const DIMENSIONS = [
  { key: 'wisdom',    icon: '\u{1F9E0}' },
  { key: 'physical',  icon: '\u{1F4AA}' },
  { key: 'spiritual', icon: '\u{1F64F}' },
  { key: 'social',    icon: '\u{1F91D}' },
]

function WelcomeScreen({ onBegin }) {
  const { t } = useTranslation()
  const [isFounding, setIsFounding] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    const check = async () => {
      // getCurrentJemaat mengembalikan { data, error } — id ada di data.id
      const { data: jemaat } = await getCurrentJemaat()
      if (!jemaat?.id) { if (active) setChecked(true); return }

      // checkFoundingMember mengembalikan { data: { isFoundingMember }, error }
      const { data: badge } = await checkFoundingMember(jemaat.id)
      if (!active) return
      setIsFounding(badge?.isFoundingMember === true)
      setChecked(true)
    }
    check()
    return () => { active = false }
  }, [])

  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center justify-center text-center bg-[#0D0D0D]">

      {/* Badge Founding Member — hanya untuk 11 orang */}
      <div className="h-10 mb-6 flex items-center">
        {checked && isFounding && (
          <div className="acs-fade-in text-[#FFD700] border border-[#FFD700] px-4 py-1.5 rounded-full text-xs tracking-wide">
            {t('welcome.founding')}
          </div>
        )}
      </div>

      {/* Empat dimensi — muncul berurutan */}
      <div className="flex gap-3 mb-10">
        {DIMENSIONS.map((d, i) => (
          <div
            key={d.key}
            className="acs-rise flex flex-col items-center gap-2"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="w-14 h-14 rounded-full border border-[#333] flex items-center justify-center text-xl">
              {d.icon}
            </div>
            <span className="text-[10px] text-gray-500">
              {t(`dimensions.${d.key}`)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-gray-400 italic text-sm leading-relaxed mb-6 max-w-xs">
        {t('welcome.verse')}
      </p>

      <p className="text-[#FF8A00] text-xl font-bold mb-12 max-w-xs leading-snug whitespace-pre-line">
        {t('welcome.slogan')}
      </p>

      <button
        onClick={onBegin}
        className="w-full max-w-sm py-4 rounded-xl font-semibold text-white bg-[#FF8A00]"
      >
        {t('welcome.begin')}
      </button>
    </div>
  )
}

export default WelcomeScreen