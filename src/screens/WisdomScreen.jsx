// screens/WisdomScreen.jsx
import { useState } from 'react'

function WisdomScreen({ onBack, onComplete }) {
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    if (!note.trim()) {
      alert('⚠️ Mohon isi pembelajaran hari ini')
      return
    }
    onComplete()
    alert('✅ Akal Budi — Jurnal disimpan!')
    onBack()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onBack}
          className="text-2xl mr-3 text-gray-900 dark:text-white"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Akal Budi</h1>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">
            📝 Apa yang kamu pelajari hari ini?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tuliskan pembelajaran baru..."
            rows="5"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg font-medium text-white bg-[#FF8A00] hover:bg-[#E67A00] transition-colors"
        >
          💾 Simpan
        </button>
      </div>
    </div>
  )
}

export default WisdomScreen