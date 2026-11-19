// screens/BibleJournalScreen.jsx
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { getTodayWIB, saveJournal } from '../services/database'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

function BibleJournalScreen({ onBack, onComplete, currentUser, darkMode }) {
  const { t } = useTranslation()
  const { toast, showToast, hideToast } = useToast()
  const [ayat, setAyat] = useState('')
  const [pesan, setPesan] = useState('')
  const [komitmen, setKomitmen] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!ayat.trim()) {
      showToast(t('journal.verseRequired') || '⚠️ Mohon isi ayat yang dibaca', 'error')
      return
    }

    setIsSubmitting(true)
    const jemaatId = currentUser?.id

    if (!jemaatId) {
      showToast('❌ Silakan login terlebih dahulu', 'error')
      setIsSubmitting(false)
      return
    }

    const content = { verse: ayat, message: pesan, commitment: komitmen }

    const { data, error } = await saveJournal({
      jemaatId: jemaatId,
      dimension: 'spiritual',
      content: content,
      entryDate: getTodayWIB()
    })

    setIsSubmitting(false)

    if (error) {
      showToast(`❌ Gagal menyimpan: ${error.message}`, 'error')
      return
    }

    // Tampilkan toast sukses (tanpa ringkasan panjang)
    showToast('✅ ' + t('journal.spiritual') + ' — ' + (t('journal.saved') || 'Jurnal disimpan!'))
    
    setTimeout(() => {
      onComplete()
      setAyat('')
      setPesan('')
      setKomitmen('')
      onBack()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white">
      <div className="max-w-sm mx-auto px-4 py-4">
        
        <div className="flex items-center py-3">
          <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('journal.spiritual')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('journal.subtitle')}</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              {t('journal.verse')} <span className="text-[#FF8A00]">*</span>
            </label>
            <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{t('journal.verseExample')}</p>
            <input
              type="text"
              value={ayat}
              onChange={(e) => setAyat(e.target.value)}
              placeholder={t('journal.versePlaceholder')}
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-base"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">{t('journal.message')}</label>
            <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{t('journal.messageHint')}</p>
            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder={t('journal.messagePlaceholder')}
              rows="4"
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none text-base"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">{t('journal.commitment')}</label>
            <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{t('journal.commitmentHint')}</p>
            <textarea
              value={komitmen}
              onChange={(e) => setKomitmen(e.target.value)}
              placeholder={t('journal.commitmentPlaceholder')}
              rows="3"
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none text-base"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#FF8A00] hover:bg-[#E67A00] active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? '⏳ ' + t('journal.saving') : '💾 ' + t('journal.save')}
          </button>
        </div>

      </div>

      {/* TOAST */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  )
}

export default BibleJournalScreen