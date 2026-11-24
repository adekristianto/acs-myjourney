// src/App.jsx
import { useState, useEffect } from 'react'
import { 
  getCurrentJemaat, 
  getStreaks, 
  getTodayJournal,
  updateStreak, 
  needsPasswordChange, 
  logoutJemaat,
  isRecoveryLink,
  getTodayWIB // Import helper WIB
} from './services/database'
import LoginScreen from './screens/LoginScreen'
import SetPasswordScreen from './screens/SetPasswordScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'
import DaftarScreen from './screens/DaftarScreen'
import MenungguScreen from './screens/MenungguScreen'
import { sesiAktif } from './services/pendaftaran'
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'
import BibleJournalScreen from './screens/BibleJournalScreen'
import KomselAttendanceScreen from './screens/KomselAttendanceScreen'
import WorkerAttendanceScreen from './screens/WorkerAttendanceScreen'
import WisdomScreen from './screens/WisdomScreen'
import PhysicalScreen from './screens/PhysicalScreen'
import SocialScreen from './screens/SocialScreen'
import JournalHistoryScreen from './screens/JournalHistoryScreen'
import PelayananScreen from './pelayanan/PelayananScreen'
import CheckinScreen from './screens/CheckinScreen'
import ProfilKeluargaScreen from './screens/ProfilKeluargaScreen'
import { checkin } from './services/absensi'

// Scan QR / tap NFC: link .../?hadir=minggu → simpan dulu, diproses setelah login
;(() => {
  const v = new URLSearchParams(window.location.search).get('hadir')
  if (v && /^[a-z]{3,12}$/.test(v)) {
    try { sessionStorage.setItem('pendingCheckin', v) } catch { /* abaikan */ }
    window.history.replaceState(null, '', window.location.pathname)
  }
})()
import { getMyRoles } from './services/pelayanan'
import { useToast } from './ui/Toast'
import './index.css'

function App() {
  const toast = useToast()
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [authStep, setAuthStep] = useState('ready')
  const [showForgot, setShowForgot] = useState(false)
  const [showDaftar, setShowDaftar] = useState(false)
  const [pending, setPending] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [dimensions, setDimensions] = useState([
    { id: 'wisdom', label: 'Akal Budi', icon: '🧠', completed: false },
    { id: 'physical', label: 'Fisik', icon: '💪', completed: false },
    { id: 'spiritual', label: 'Rohani', icon: '🙏', completed: false },
    { id: 'social', label: 'Sosial', icon: '🤝', completed: false },
  ])
  const [streaks, setStreaks] = useState({
    wisdom: 0,
    physical: 0,
    spiritual: 0,
    social: 0,
    full_day: 0
  })
  const [isRecovery, setIsRecovery] = useState(false)
  const [roles, setRoles] = useState([])
  const [checkinResult, setCheckinResult] = useState(null)

  // Peran pelayanan (super admin, admin, ketua team, ketua/pembantu komsel)
  useEffect(() => {
    let alive = true
    if (!currentUser?.id) { setRoles([]); return }
    getMyRoles(currentUser.id).then(({ data }) => { if (alive) setRoles(data || []) })
    return () => { alive = false }
  }, [currentUser?.id])

  // Proses absensi dari scan QR / NFC setelah login
  useEffect(() => {
    if (!currentUser?.id || authStep === 'setPassword') return
    let jenis = null
    try { jenis = sessionStorage.getItem('pendingCheckin') } catch { /* abaikan */ }
    if (!jenis) return
    try { sessionStorage.removeItem('pendingCheckin') } catch { /* abaikan */ }
    checkin(jenis).then(({ data, error }) => {
      setCheckinResult(error ? { status: 'error', jenis } : data)
      setAuthStep('ready')
      setCurrentScreen('checkin')
    })
  }, [currentUser?.id, authStep])

  // LOAD STATUS HARI INI (dari journal, BUKAN streak)
  const loadTodayStatus = async (jemaatId) => {
    if (!jemaatId) return

    const dims = ['wisdom', 'physical', 'spiritual', 'social']
    const todayStatus = {}
    const today = getTodayWIB() // Gunakan WIB

    for (const dim of dims) {
      const { data, error } = await getTodayJournal(jemaatId, dim)
      const hasTodayJournal = data && data.tanggal === today
      todayStatus[dim] = !error && hasTodayJournal
    }

    setDimensions(prev =>
      prev.map(dim => ({
        ...dim,
        completed: todayStatus[dim.id] || false
      }))
    )

    const { data: streakData } = await getStreaks(jemaatId)
    if (streakData) {
      setStreaks(streakData)
    }
  }

  // UPDATE STREAK SETELAH SUBMIT JOURNAL
  // Logika perhitungan streak sekarang ditangani sepenuhnya oleh database.js
  const updateStreakAfterJournal = async (dimensionId) => {
    if (!currentUser) return

    // Cukup panggil updateStreak tanpa menghitung manual
    const result = await updateStreak(currentUser.id, dimensionId, 0) // parameter ke-3 tidak dipakai lagi

    if (result.error) {
      console.error('❌ Streak update failed:', result.error)
      toast.error('Jurnal tersimpan, tapi streak gagal diperbarui. Coba buka ulang aplikasi.')
      return
    }

    // Muat ulang semua status dari database
    await loadTodayStatus(currentUser.id)
  }

  // CEK SESSION
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }

    // CEK APAKAH INI RECOVERY LINK — PALING PERTAMA!
    if (isRecoveryLink()) {
      setIsRecovery(true)
      setAuthLoading(false)
      return
    }

    const checkSession = async () => {
      const { data } = await getCurrentJemaat()
      if (data) {
        setCurrentUser(data)
        await loadTodayStatus(data.id)
      } else if (await sesiAktif()) {
        setPending(true) // akun ada, belum disetujui sebagai jemaat
      }
      setAuthLoading(false)
    }
    checkSession()
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleLoginSuccess = async (authUser) => {
    const mustChange = needsPasswordChange(authUser)
    const { data } = await getCurrentJemaat()
    if (!data) { setPending(true); return } // belum disetujui → layar menunggu
    setCurrentUser(data)
    loadTodayStatus(authUser.id)
    setCurrentScreen('home')
    setAuthStep(mustChange ? 'setPassword' : 'welcome')
  }

  const handleLogout = async () => {
    await logoutJemaat()
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl) {
      const key = supabaseUrl.replace(/^https?:\/\//, '').replace(/\.supabase\.co$/, '')
      localStorage.removeItem(`sb-${key}-auth-token`)
    }
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key)
      }
    })
    
    setCurrentUser(null)
    setPending(false)
    setShowDaftar(false)
    setCurrentScreen('home')
    setDimensions([
      { id: 'wisdom', label: 'Akal Budi', icon: '🧠', completed: false },
      { id: 'physical', label: 'Fisik', icon: '💪', completed: false },
      { id: 'spiritual', label: 'Rohani', icon: '🙏', completed: false },
      { id: 'social', label: 'Sosial', icon: '🤝', completed: false },
    ])
    setStreaks({ wisdom: 0, physical: 0, spiritual: 0, social: 0, full_day: 0 })
  }

  // Akun yang baru daftar: cek apakah admin sudah menyetujui
  const handleCekPersetujuan = async () => {
    const { data } = await getCurrentJemaat()
    if (!data) return false
    setPending(false)
    setShowDaftar(false)
    setCurrentUser(data)
    loadTodayStatus(data.id)
    setCurrentScreen('home')
    setAuthStep('welcome')
    return true
  }

  // Handler setelah selesai reset password
  const handlePasswordResetComplete = async () => {
    // Clear hash & query params dari URL
    window.history.replaceState(null, '', window.location.pathname)
    setIsRecovery(false)
    setAuthStep('ready')
    // Reload user session setelah reset
    const { data } = await getCurrentJemaat()
    if (data) {
      setCurrentUser(data)
      await loadTodayStatus(data.id)
    }
  }

  const renderWithContainer = (Screen, props) => (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pt-safe">
      <Screen {...props} />
    </div>
  )

  // LOADING
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] dark:bg-black">
        <img src="/icon-192.png" alt="" className="w-16 h-16 rounded-[15px] animate-pulse" />
      </div>
    )
  }

  // ⭐ PRIORITAS TERTINGGI: RECOVERY LINK
  if (isRecovery || isRecoveryLink()) {
    return <SetPasswordScreen onComplete={handlePasswordResetComplete} />
  }

  // LOGIN / FORGOT PASSWORD
  if (!currentUser && pending) {
    return <MenungguScreen onCekLagi={handleCekPersetujuan} onLogout={handleLogout} />
  }
  if (!currentUser) {
    if (showDaftar) {
      return <DaftarScreen onBack={() => setShowDaftar(false)} onTerkirim={() => { setShowDaftar(false); setPending(true) }} />
    }
    if (showForgot) {
      return <ForgotPasswordScreen onBack={() => setShowForgot(false)} />
    }
    return <LoginScreen
      onLoginSuccess={handleLoginSuccess}
      onForgot={() => setShowForgot(true)}
      onDaftar={() => setShowDaftar(true)}
    />
  }

  // SET PASSWORD (first login)
  if (authStep === 'setPassword') {
    return <SetPasswordScreen onComplete={() => setAuthStep('welcome')} />
  }

  // WELCOME SCREEN
  if (authStep === 'welcome') {
    return <WelcomeScreen 
      onBegin={() => setAuthStep('ready')} 
      darkMode={darkMode} 
      currentUser={currentUser} // PERBAIKAN: Kirim currentUser ke WelcomeScreen
    />
  }

  // NAVIGATION
  if (currentScreen === 'checkin') {
    return <CheckinScreen result={checkinResult} onDone={() => { setCheckinResult(null); setCurrentScreen('home') }} />
  }
  if (currentScreen === 'pelayanan' && roles.some(r => r.role !== 'pekerja')) {
    return renderWithContainer(PelayananScreen, { onBack: () => setCurrentScreen('home'), currentUser, roles })
  }
  if (currentScreen === 'keluarga') {
    return renderWithContainer(ProfilKeluargaScreen, { onBack: () => setCurrentScreen('home'), currentUser })
  }
  if (currentScreen === 'history') {
    return renderWithContainer(JournalHistoryScreen, { onBack: () => setCurrentScreen('home'), currentUser })
  }
  if (currentScreen === 'komsel') {
    return renderWithContainer(KomselAttendanceScreen, { onBack: () => setCurrentScreen('home') })
  }
  if (currentScreen === 'worker') {
    return renderWithContainer(WorkerAttendanceScreen, { onBack: () => setCurrentScreen('home') })
  }
  if (currentScreen === 'bible') {
    return renderWithContainer(BibleJournalScreen, {
      onBack: () => setCurrentScreen('home'),
      darkMode,
      currentUser,
      onComplete: () => updateStreakAfterJournal('spiritual')
    })
  }
  if (currentScreen === 'wisdom') {
    return renderWithContainer(WisdomScreen, {
      onBack: () => setCurrentScreen('home'),
      currentUser,
      onComplete: () => updateStreakAfterJournal('wisdom')
    })
  }
  if (currentScreen === 'physical') {
    return renderWithContainer(PhysicalScreen, {
      onBack: () => setCurrentScreen('home'),
      currentUser,
      onComplete: () => updateStreakAfterJournal('physical')
    })
  }
  if (currentScreen === 'social') {
    return renderWithContainer(SocialScreen, {
      onBack: () => setCurrentScreen('home'),
      currentUser,
      onComplete: () => updateStreakAfterJournal('social')
    })
  }

  // HOME
  return (
    <div className="pt-safe bg-[#F2F2F7] dark:bg-black min-h-screen">
      <HomeScreen
        currentUser={currentUser}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        dimensions={dimensions}
        streaks={streaks}
        onDimensionClick={(id) => {
          const map = { wisdom: 'wisdom', physical: 'physical', spiritual: 'bible', social: 'social' }
          setCurrentScreen(map[id])
        }}
        onHistoryClick={() => setCurrentScreen('history')}
        onFamilyClick={() => setCurrentScreen('keluarga')}
        roles={roles}
        onPelayananClick={() => setCurrentScreen('pelayanan')}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default App