// screens/SocialScreen.jsx
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'

function SocialScreen({ onBack, onComplete }) {
  const { t } = useTranslation()
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    if (!note.trim()) {
      alert(t('journal.required') || '⚠️ Mohon isi interaksi sosial hari ini')
      return
    }
    onComplete()
    alert('✅ ' + t('dimensions.social') + ' — ' + (t('journal.saved') || 'Jurnal disimpan!'))
    onBack()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('journal.social')}</h1>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">
            🤝 {t('journal.socialPrompt') || 'Bagaimana interaksi sosialmu hari ini?'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('journal.socialPlaceholder') || 'Contoh: Bertemu teman, membantu orang lain...'}
            rows="5"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg font-medium text-white bg-[#FF8A00] hover:bg-[#E67A00] transition-colors"
        >
          💾 {t('journal.save')}
        </button>
      </div>
    </div>
  )
}

export default SocialScreen