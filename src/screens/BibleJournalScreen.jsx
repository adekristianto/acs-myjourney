// screens/BibleJournalScreen.jsx
import { useState } from 'react'

function BibleJournalScreen({ onBack, onComplete }) {
  const [ayat, setAyat] = useState('')
  const [pesan, setPesan] = useState('')
  const [komitmen, setKomitmen] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!ayat.trim()) {
      alert('⚠️ Mohon isi ayat yang dibaca terlebih dahulu')
      return
    }
    
    setIsSubmitting(true)
    
    setTimeout(() => {
      alert(`✅ Jurnal rohani berhasil disimpan!\n\n📖 Ayat: ${ayat}\n💬 Pesan: ${pesan || '(tidak diisi)'}\n📝 Komitmen: ${komitmen || '(tidak diisi)'}`)
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
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onBack}
          className="text-2xl mr-3 text-gray-900 dark:text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jurnal Rohani</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Renungan Firman Tuhan hari ini
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Pertanyaan 1 */}
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">
            📖 Ayat mana yang dibaca?
            <span className="text-[#FF8A00] ml-1">*</span>
          </label>
          <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">
            Contoh: "Yohanes 3:16" atau "Mazmur 23"
          </p>
          <input
            type="text"
            value={ayat}
            onChange={(e) => setAyat(e.target.value)}
            placeholder="Masukkan ayat yang dibaca..."
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
          />
        </div>

        {/* Pertanyaan 2 */}
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">
            💬 Apa pesan Tuhan secara pribadi?
          </label>
          <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">
            Apa yang Tuhan ingin sampaikan kepada Anda hari ini?
          </p>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Tuliskan pesan yang Anda terima..."
            rows="4"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none"
          />
        </div>

        {/* Pertanyaan 3 */}
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-white">
            📝 Komitmen apa yang mau dibuat?
          </label>
          <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">
            Langkah konkret yang akan Anda ambil hari ini
          </p>
          <textarea
            value={komitmen}
            onChange={(e) => setKomitmen(e.target.value)}
            placeholder="Contoh: Saya akan menelepon teman yang sedang sakit..."
            rows="3"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] resize-none"
          />
        </div>

        {/* Tombol Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#FF8A00] hover:bg-[#E67A00]'
          }`}
        >
          {isSubmitting ? '⏳ Menyimpan...' : '💾 Simpan Jurnal'}
        </button>
      </div>
    </div>
  )
}

export default BibleJournalScreen