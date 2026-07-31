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

  const bgColor = darkMode ? 'bg-[#0D0D0D]' : 'bg-[#F8F8F8]'
  const textColor = darkMode ? 'text-white' : 'text-[#111111]'
  const borderColor = darkMode ? 'border-[#333]' : 'border-[#E5E5E5]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-600'
  const iconBorder = darkMode ? 'border-[#333]' : 'border-[#E5E5E5]'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center ${bgColor} ${textColor}`}>
      
      <div className="w-full max-w-sm">
        
        {checked && isFounding && (
          <div className="flex justify-center mb-6 acs-fade-in">
            <img src="/founder-badge.png" alt="Founding Member" className="w-24 h-24 object-contain" />
          </div>
        )}

        <div className="flex justify-center gap-3 mb-8">
          {DIMENSIONS.map((d, i) => (
            <div
              key={d.key}
              className="acs-rise flex flex-col items-center gap-2"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className={`w-14 h-14 rounded-full border flex items-center justify-center text-xl ${iconBorder}`}>
                {d.icon}
              </div>
              <span className={`text-[10px] ${textMuted}`}>
                {t(`dimensions.${d.key}`)}
              </span>
            </div>
          ))}
        </div>

        <p className={`italic text-sm leading-relaxed mb-6 max-w-xs mx-auto ${textMuted}`}>
          {t('welcome.verse')}
        </p>

        <p className="text-[#FF8A00] text-xl font-bold mb-10 leading-snug whitespace-pre-line">
          {t('welcome.slogan')}
        </p>

        <button
          onClick={onBegin}
          className="w-full py-4 rounded-xl font-semibold text-white bg-[#FF8A00] hover:bg-[#E67A00] active:scale-[0.98] transition-all"
        >
          {t('welcome.begin')}
        </button>

      </div>
    </div>
  )
}

export default WelcomeScreen