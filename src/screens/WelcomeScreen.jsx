// screens/WelcomeScreen.jsx
import { useEffect, useState } from 'react'
import { checkFoundingMember } from '../services/database'
import { useTranslation } from '../hooks/useTranslation'
import { DimIcon } from '../ui/icons'


// PERBAIKAN: Tambahkan currentUser ke dalam props
function WelcomeScreen({ onBegin, currentUser }) {
  const { t } = useTranslation()
  const [isFounding, setIsFounding] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    const check = async () => {
      // PERBAIKAN: Gunakan currentUser dari props, bukan getCurrentJemaat()
      if (!currentUser?.id) { if (active) setChecked(true); return }

      const { data: badge } = await checkFoundingMember(currentUser.id)
      if (!active) return
      setIsFounding(badge?.isFoundingMember === true)
      setChecked(true)
    }
    check()
    return () => { active = false }
  }, [currentUser])

  const dims = ['wisdom', 'physical', 'spiritual', 'social']
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-white flex flex-col">
      <div className="w-full max-w-sm mx-auto px-6 flex-1 flex flex-col justify-center text-center py-10">
        {checked && isFounding && (
          <img src="/founder-badge.png" alt="Founding Member" className="acs-fade-in w-32 h-32 mx-auto mb-8 drop-shadow-[0_10px_24px_rgba(255,159,10,0.3)]" />
        )}
        <div className="flex justify-center gap-4 mb-8">
          {dims.map((k, i) => (
            <div key={k} className="acs-rise flex flex-col items-center gap-2" style={{ animationDelay: `${i * 120}ms` }}>
              <DimIcon id={k} size={52} />
              <span className="text-[12px] text-gray-500 dark:text-gray-400">{t(`dimensions.${k}`)}</span>
            </div>
          ))}
        </div>
        <p className="text-[15px] italic leading-relaxed text-gray-500 dark:text-gray-400">{t('welcome.verse')}</p>
        <p className="mt-6 text-[22px] font-bold leading-snug whitespace-pre-line">{t('welcome.slogan')}</p>
        <button onClick={onBegin}
          className="mt-10 w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold active:scale-[0.99] transition">
          {t('welcome.begin')}
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen
