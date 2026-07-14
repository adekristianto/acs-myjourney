// screens/WorkerAttendanceScreen.jsx
import { useState } from 'react'
import AttendanceRow from '../components/AttendanceRow'
import { useTranslation } from '../hooks/useTranslation'

const workerMembers = [
  'Ps. Daniel Hendrata',
  'Ps. Debby Catharina',
  'Yohana S.',
  'Kristian T.',
  'Maria L.',
  'Stefanus W.',
]

function WorkerAttendanceScreen({ onBack }) {
  const { t } = useTranslation()
  const [attendance, setAttendance] = useState(
    workerMembers.map(name => ({ name, present: false }))
  )

  const togglePresent = (index) => {
    const newAttendance = [...attendance]
    newAttendance[index].present = !newAttendance[index].present
    setAttendance(newAttendance)
  }

  const handleSave = () => {
    const presentCount = attendance.filter(a => a.present).length
    alert(`✅ ${t('attendance.worker')} ${t('attendance.saved')}!\n${t('attendance.present')}: ${presentCount} ${t('attendance.from')} ${attendance.length} ${t('attendance.people')}`)
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
        <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{t('attendance.tapToMark')}</p>
        {attendance.map((member, index) => (
          <AttendanceRow
            key={index}
            name={member.name}
            isPresent={member.present}
            onToggle={() => togglePresent(index)}
          />
        ))}
      </div>
      <div className="p-4">
        <button onClick={handleSave} className="w-full py-3 rounded-lg font-medium transition-colors bg-black dark:bg-[#FF8A00] text-white dark:text-black hover:bg-gray-800 dark:hover:bg-[#E67A00]">
          💾 {t('attendance.save')}
        </button>
      </div>
    </div>
  )
}

export default WorkerAttendanceScreen