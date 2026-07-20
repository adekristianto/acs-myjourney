// screens/KomselAttendanceScreen.jsx
import { useState, useEffect } from 'react'
import AttendanceRow from '../components/AttendanceRow'
import { useTranslation } from '../hooks/useTranslation'
import { saveKomselAttendance, getCurrentJemaat } from '../services/database'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState(null)
  const [komsel, setKomsel] = useState('')

  // Ambil user saat component mount
  useEffect(() => {
    async function loadUser() {
      const { data } = await getCurrentJemaat()
      if (data) {
        setUser(data)
        setKomsel(data.komsel || 'Umum')
      }
    }
    loadUser()
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

    // Save ke database untuk setiap anggota yang hadir
    const presentMembers = attendance.filter(a => a.present)
    let successCount = 0
    let errorCount = 0

    for (const member of presentMembers) {
      const { error } = await saveKomselAttendance({
        jemaatId: user.id,
        komsel: komsel || 'Umum',
        lokasi: location,
        present: true,
        recordedBy: user.id,
        attendanceDate: new Date().toISOString().split('T')[0]
      })

      if (error) {
        console.log('❌ Gagal save attendance:', error)
        errorCount++
      } else {
        successCount++
      }
    }

    setIsSubmitting(false)

    if (errorCount === 0) {
      alert(`✅ ${t('attendance.komsel')} ${t('attendance.saved')}!\n${t('attendance.present')}: ${presentMembers.length} ${t('attendance.from')} ${attendance.length} ${t('attendance.people')}`)
      onBack()
    } else {
      alert(`⚠️ ${successCount} berhasil, ${errorCount} gagal disimpan`)
    }
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
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#FF8A00] hover:bg-[#E67A00]'
          }`}
        >
          {isSubmitting ? '⏳ ' + t('attendance.saving') : '💾 ' + t('attendance.save')}
        </button>
      </div>
    </div>
  )
}

export default KomselAttendanceScreen