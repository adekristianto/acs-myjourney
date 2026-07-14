// screens/BibleJournalScreen.jsx
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'

function BibleJournalScreen({ onBack, onComplete }) {
  const { t } = useTranslation()
  const [ayat, setAyat] = useState('')
  const [pesan, setPesan] = useState('')
  const [komitmen, setKomitmen] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!ayat.trim()) {
      alert(t('journal.verseRequired') || '⚠️ Mohon isi ayat yang dibaca terlebih dahulu')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      alert(`✅ ${t('journal.spiritual')} ${t('journal.saved')}!\n\n📖 ${t('journal.verse')}: ${ayat}\n💬 ${t('journal.message')}: ${pesan || '(tidak diisi)'}\n📝 ${t('journal.commitment')}: ${komitmen || '(tidak diisi)'}`)
      onComplete()
      setAyat('')
      setPesan('')
      setKomitmen('')
      setIsSubmitting(false)
      onBack()
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('journal.spiritual')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('journal.subtitle')}</p>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">
            {t('journal.verse')} <span className="text-[#FF8A00]">*</span>
          </label>
          <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{t('journal.verseExample')}</p>
          <input
            type="text"
            value={ayat}
            onChange={(e) => setAyat(e.target.value)}
            placeholder={t('journal.versePlaceholder')}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">{t('journal.message')}</label>
          <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{t('journal.messageHint')}</p>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder={t('journal.messagePlaceholder')}
            rows="4"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">{t('journal.commitment')}</label>
          <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{t('journal.commitmentHint')}</p>
          <textarea
            value={komitmen}
            onChange={(e) => setKomitmen(e.target.value)}
            placeholder={t('journal.commitmentPlaceholder')}
            rows="3"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF8A00] hover:bg-[#E67A00]'}`}
        >
          {isSubmitting ? '⏳ ' + t('journal.saving') : '💾 ' + t('journal.save')}
        </button>
      </div>
    </div>
  )
}

export default BibleJournalScreen