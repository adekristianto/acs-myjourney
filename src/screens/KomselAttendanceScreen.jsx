// screens/KomselAttendanceScreen.jsx
import { useState, useEffect } from 'react'
import AttendanceRow from '../components/AttendanceRow'
import { useTranslation } from '../hooks/useTranslation'
import { saveKomselAttendance, getCurrentJemaat, getJemaat, getTodayWIB } from '../services/database'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

function KomselAttendanceScreen({ onBack }) {
  const { t } = useTranslation()
  const { toast, showToast, hideToast } = useToast()
  const [attendance, setAttendance] = useState([])
  const [location, setLocation] = useState('Storehouse')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: userData } = await getCurrentJemaat()
      if (userData) setUser(userData)
      
      const { data: jemaatList } = await getJemaat()
      if (jemaatList) {
        setAttendance(jemaatList.map(j => ({ id: j.id, name: j.nama, present: false })))
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const togglePresent = (index) => {
    const newAttendance = [...attendance]
    newAttendance[index].present = !newAttendance[index].present
    setAttendance(newAttendance)
  }

  const handleSave = async () => {
    if (!user) {
      showToast('❌ Silakan login terlebih dahulu', 'error')
      return
    }

    setIsSubmitting(true)
    const anggotaData = attendance.map(a => ({ name: a.name, present: a.present }))
    const presentCount = attendance.filter(a => a.present).length

    const { data, error } = await saveKomselAttendance({
      lokasi: location,
      anggota: anggotaData,
      tanggal: getTodayWIB()
    })

    setIsSubmitting(false)

    if (error) {
      showToast(`❌ Gagal menyimpan: ${error.message}`, 'error')
    } else {
      showToast(`✅ ${t('attendance.komsel')} ${t('attendance.saved')}! (${presentCount} hadir)`)
      setTimeout(() => {
        onBack()
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0D0D0D]">
        <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white">
      <div className="max-w-sm mx-auto px-4 py-4">
        
        <div className="flex items-center py-3">
          <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('attendance.komsel')}</h1>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('attendance.location')}</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white text-base"
          >
            <option value="Storehouse">Storehouse (Gereja)</option>
            <option value="Rumah Andi">Rumah Andi</option>
            <option value="Rumah Budi">Rumah Budi</option>
            <option value="Online">Online (Zoom)</option>
          </select>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">
            {t('attendance.tapToMark')} ({attendance.length} jemaat)
          </p>
          {attendance.map((member, index) => (
            <AttendanceRow
              key={member.id || index}
              name={member.name}
              isPresent={member.present}
              onToggle={() => togglePresent(index)}
            />
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#FF8A00] hover:bg-[#E67A00] active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? '⏳ ' + t('attendance.saving') : '💾 ' + t('attendance.save')}
        </button>

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

export default KomselAttendanceScreen