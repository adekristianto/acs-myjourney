// screens/PhysicalScreen.jsx
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { saveJournal } from '../services/database'

function PhysicalScreen({ onBack, onComplete }) {
  const { t } = useTranslation()
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!note.trim()) {
      alert(t('journal.required') || '⚠️ Mohon isi aktivitas fisik hari ini')
      return
    }
    
    setIsSubmitting(true)
    
    const { data, error } = await saveJournal({
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('journal.physical')}</h1>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">
            💪 {t('journal.physicalPrompt') || 'Aktivitas fisik apa yang kamu lakukan hari ini?'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('journal.physicalPlaceholder') || 'Contoh: Jalan pagi 30 menit...'}
            rows="5"
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

export default PhysicalScreen