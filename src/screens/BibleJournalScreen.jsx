// screens/BibleJournalScreen.jsx
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { saveJournal, getCurrentJemaat } from '../services/database'

function BibleJournalScreen({ onBack, onComplete }) {
  const { t } = useTranslation()
  const [ayat, setAyat] = useState('')
  const [pesan, setPesan] = useState('')
  const [komitmen, setKomitmen] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!ayat.trim()) {
      alert(t('journal.verseRequired') || '⚠️ Mohon isi ayat yang dibaca terlebih dahulu')
      return
    }
    
    setIsSubmitting(true)
    
    // 1. Ambil current user
    const { data: user, error: userError } = await getCurrentJemaat()
    if (userError || !user) {
      alert('❌ Silakan login terlebih dahulu')
      setIsSubmitting(false)
      return
    }
    
    // 2. Siapkan content
    const content = {
      verse: ayat,
      message: pesan,
      commitment: komitmen
    }
    
    // 3. SAVE KE DATABASE
    const { data, error } = await saveJournal({
      jemaatId: user.id,
      dimension: 'spiritual',
      content: content,
      entryDate: new Date().toISOString().split('T')[0]
    })
    
    setIsSubmitting(false)
    
    if (error) {
      alert(`❌ Gagal menyimpan: ${error.message}`)
      return
    }
    
    alert(`✅ ${t('journal.spiritual')} ${t('journal.saved')}!`)
    onComplete()
    setAyat('')
    setPesan('')
    setKomitmen('')
    onBack()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('journal.spiritual')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('journal.subtitle')}</p>
        </div>
      </div>

      {/* Form */}
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