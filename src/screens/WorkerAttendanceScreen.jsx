// screens/WorkerAttendanceScreen.jsx
import { useState, useEffect } from 'react'
import AttendanceRow from '../components/AttendanceRow'
import { useTranslation } from '../hooks/useTranslation'
import { saveWorkerAttendance, getCurrentJemaat, getJemaat } from '../services/database'

function WorkerAttendanceScreen({ onBack }) {
  const { t } = useTranslation()
  const [attendance, setAttendance] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ambil user dan daftar jemaat saat component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      // Ambil user yang login
      const { data: userData } = await getCurrentJemaat()
      if (userData) {
        setUser(userData)
      }
      
      // Ambil semua jemaat dari database
      const { data: jemaatList, error } = await getJemaat()
      if (error) {
        console.error('❌ Gagal load jemaat:', error)
      } else if (jemaatList) {
        // Untuk worker meeting, kita filter hanya jemaat yang memiliki role tertentu
        // Atau untuk sekarang, tampilkan semua jemaat
        const attendanceData = jemaatList.map(j => ({
          id: j.id,
          name: j.nama,
          present: false
        }))
        setAttendance(attendanceData)
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
      alert('❌ Silakan login terlebih dahulu')
      return
    }

    setIsSubmitting(true)

    const anggotaData = attendance.map(a => ({ 
      name: a.name, 
      present: a.present 
    }))

    const presentCount = attendance.filter(a => a.present).length

    const { data, error } = await saveWorkerAttendance({
      anggota: anggotaData,
      meetingDate: new Date().toISOString().split('T')[0]
    })

    setIsSubmitting(false)

    if (error) {
      alert(`❌ Gagal menyimpan: ${error.message}`)
    } else {
      alert(`✅ ${t('attendance.worker')} ${t('attendance.saved')}!\n${t('attendance.present')}: ${presentCount} ${t('attendance.from')} ${attendance.length} ${t('attendance.people')}`)
      onBack()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0D0D0D]">
        <p className="text-gray-600 dark:text-gray-400">Memuat data jemaat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('attendance.worker')}</h1>
      </div>
      <div className="p-4">
        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-[#FF8A00]">
          <p className="text-sm text-[#FF8A00]">📋 {t('attendance.workerChecklist')}</p>
        </div>
      </div>
      <div className="p-4 space-y-2">
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
      <div className="p-4">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed' 
              : 'bg-black dark:bg-[#FF8A00] text-white dark:text-black hover:bg-gray-800 dark:hover:bg-[#E67A00]'
          }`}
        >
          {isSubmitting ? '⏳ ' + t('attendance.saving') : '💾 ' + t('attendance.save')}
        </button>
      </div>
    </div>
  )
}

export default WorkerAttendanceScreen