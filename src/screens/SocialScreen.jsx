// screens/SocialScreen.jsx
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { saveJournal, getTodayWIB } from '../services/database'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

function SocialScreen({ onBack, onComplete, currentUser }) {
  const { t } = useTranslation()
  const { toast, showToast, hideToast } = useToast()
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!note.trim()) {
      showToast(t('journal.required') || '⚠️ Mohon isi interaksi sosial hari ini', 'error')
      return
    }

    setIsSubmitting(true)
    const jemaatId = currentUser?.id

    if (!jemaatId) {
      showToast('❌ Silakan login terlebih dahulu', 'error')
      setIsSubmitting(false)
      return
    }

    const { data, error } = await saveJournal({
      jemaatId: jemaatId,
      dimension: 'social',
      content: { note: note },
      entryDate: getTodayWIB()
    })

    setIsSubmitting(false)

    if (error) {
      showToast(`❌ Gagal menyimpan: ${error.message}`, 'error')
      return
    }

    showToast('✅ ' + t('dimensions.social') + ' — ' + (t('journal.saved') || 'Jurnal disimpan!'))
    
    setTimeout(() => {
      onComplete()
      setNote('')
      onBack()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white">
      <div className="max-w-sm mx-auto px-4 py-4">
        
        <div className="flex items-center py-3">
          <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('journal.social')}</h1>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              🤝 {t('journal.socialPrompt') || 'Bagaimana interaksi sosialmu hari ini?'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('journal.socialPlaceholder') || 'Contoh: Bertemu teman, membantu orang lain...'}
              rows="6"
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

export default SocialScreen