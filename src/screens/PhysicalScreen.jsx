// screens/PhysicalScreen.jsx
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { saveJournal } from '../services/database'

function PhysicalScreen({ onBack, onComplete, currentUser }) {
  const { t } = useTranslation()
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!note.trim()) {
      alert(t('journal.required') || '⚠️ Mohon isi aktivitas fisik hari ini')
      return
    }

    setIsSubmitting(true)
    const jemaatId = currentUser?.id

    if (!jemaatId) {
      alert('❌ Silakan login terlebih dahulu')
      setIsSubmitting(false)
      return
    }

    const { data, error } = await saveJournal({
      jemaatId: jemaatId,
      dimension: 'physical',
      content: { note: note },
      entryDate: new Date().toISOString().split('T')[0]
    })

    setIsSubmitting(false)

    if (error) {
      alert(`❌ Gagal menyimpan: ${error.message}`)
      return
    }

    alert('✅ ' + t('dimensions.physical') + ' — ' + (t('journal.saved') || 'Jurnal disimpan!'))
    onComplete()
    setNote('')
    onBack()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white">
      <div className="max-w-sm mx-auto px-4 py-4">
        
        <div className="flex items-center py-3">
          <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('journal.physical')}</h1>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              💪 {t('journal.physicalPrompt') || 'Aktivitas fisik apa yang kamu lakukan hari ini?'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('journal.physicalPlaceholder') || 'Contoh: Jalan pagi 30 menit...'}
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
    </div>
  )
}

export default PhysicalScreen