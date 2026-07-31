// screens/WelcomeScreen.jsx
import { useEffect, useState } from 'react'
import { getCurrentJemaat, checkFoundingMember } from '../services/database'
import { useTranslation } from '../hooks/useTranslation'

const DIMENSIONS = [
  { key: 'wisdom',    icon: '\u{1F9E0}' },
  { key: 'physical',  icon: '\u{1F4AA}' },
  { key: 'spiritual', icon: '\u{1F64F}' },
  { key: 'social',    icon: '\u{1F91D}' },
]

function WelcomeScreen({ onBegin, darkMode }) {
  const { t } = useTranslation()
  const [isFounding, setIsFounding] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    const check = async () => {
      const { data: jemaat } = await getCurrentJemaat()
      if (!jemaat?.id) { if (active) setChecked(true); return }

      const { data: badge } = await checkFoundingMember(jemaat.id)
      if (!active) return
      setIsFounding(badge?.isFoundingMember === true)
      setChecked(true)
    }
    check()
    return () => { active = false }
  }, [])

  return (
    <div className={`min-h-screen px-6 py-10 flex flex-col items-center justify-center text-center pt-safe ${
      darkMode 
        ? 'bg-[#0D0D0D] text-white' 
        : 'bg-[#F8F8F8] text-[#111111]'
    }`}>
      
      {/* BADGE FOUNDING MEMBER */}
      <div className="h-24 mb-4 flex items-center justify-center">
        {checked && isFounding && (
          <div className="acs-fade-in">
            <img 
              src="/founder-badge.png" 
              alt="Founding Member" 
              className="w-24 h-24 object-contain"
            />
          </div>
        )}
      </div>

      {/* EMPAT DIMENSI */}
      <div className="flex gap-3 mb-10">
        {DIMENSIONS.map((d, i) => (
          <div
            key={d.key}
            className="acs-rise flex flex-col items-center gap-2"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center text-xl ${
              darkMode 
                ? 'border-[#333]' 
                : 'border-[#E5E5E5]'
            }`}>
              {d.icon}
            </div>
            <span className={`text-[10px] ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {t(`dimensions.${d.key}`)}
            </span>
          </div>
        ))}
      </div>

      <p className={`italic text-sm leading-relaxed mb-6 max-w-xs ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {t('welcome.verse')}
      </p>

      <p className={`text-xl font-bold mb-12 max-w-xs leading-snug whitespace-pre-line ${
        darkMode ? 'text-[#FF8A00]' : 'text-[#FF8A00]'
      }`}>
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