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
    if (!user) { alert('❌ Silakan login terlebih dahulu'); return }

    setIsSubmitting(true)
    const anggotaData = attendance.map(a => ({ name: a.name, present: a.present }))
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
        <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white">
      <div className="max-w-sm mx-auto px-4 py-4">
        
        <div className="flex items-center py-3">
          <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('attendance.worker')}</h1>
        </div>

        <div className="mt-4">
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-[#FF8A00]">
            <p className="text-sm text-[#FF8A00]">📋 {t('attendance.workerChecklist')}</p>
          </div>
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
              : 'bg-black dark:bg-[#FF8A00] text-white dark:text-black hover:bg-gray-800 dark:hover:bg-[#E67A00] active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? '⏳ ' + t('attendance.saving') : '💾 ' + t('attendance.save')}
        </button>

      </div>
    </div>
  )
}

export default WorkerAttendanceScreen