// screens/KomselAttendanceScreen.jsx
import { useState } from 'react'
import AttendanceRow from '../components/AttendanceRow'
import { useTranslation } from '../hooks/useTranslation'

const komselMembers = [
  'Andi Wijaya',
  'Budi Santoso',
  'Citra Dewi',
  'David Tan',
  'Eka Putri',
  'Felix Gunawan',
]

function KomselAttendanceScreen({ onBack }) {
  const { t } = useTranslation()
  const [attendance, setAttendance] = useState(
    komselMembers.map(name => ({ name, present: false }))
  )
  const [location, setLocation] = useState('Storehouse')

  const togglePresent = (index) => {
    const newAttendance = [...attendance]
    newAttendance[index].present = !newAttendance[index].present
    setAttendance(newAttendance)
  }

  const handleSave = () => {
    const presentCount = attendance.filter(a => a.present).length
    alert(`✅ ${t('attendance.komsel')} ${t('attendance.saved')}!\n${t('attendance.present')}: ${presentCount} ${t('attendance.from')} ${attendance.length} ${t('attendance.people')}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D]">
      <div className="flex items-center p-4 bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="text-2xl mr-3 text-gray-900 dark:text-white">←</button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('attendance.komsel')}</h1>
      </div>
      <div className="p-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('attendance.location')}</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] text-gray-900 dark:text-white"
        >
          <option value="Storehouse">Storehouse (Gereja)</option>
          <option value="Rumah Andi">Rumah Andi</option>
          <option value="Rumah Budi">Rumah Budi</option>
          <option value="Online">Online (Zoom)</option>
        </select>
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
        <button onClick={handleSave} className="w-full py-3 rounded-lg font-medium text-white bg-[#FF8A00] hover:bg-[#E67A00] transition-colors">
          💾 {t('attendance.save')}
        </button>
      </div>
    </div>
  )
}

export default KomselAttendanceScreen