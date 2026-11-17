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
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'
import BibleJournalScreen from './screens/BibleJournalScreen'
import KomselAttendanceScreen from './screens/KomselAttendanceScreen'
import WorkerAttendanceScreen from './screens/WorkerAttendanceScreen'
import WisdomScreen from './screens/WisdomScreen'
import PhysicalScreen from './screens/PhysicalScreen'
import SocialScreen from './screens/SocialScreen'
import './index.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [authStep, setAuthStep] = useState('ready')
  const [showForgot, setShowForgot] = useState(false)
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
      alert('⚠️ Gagal menyimpan streak. Jurnal tetap tersimpan, tapi streak mungkin tidak akurat.')
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
      }
      setAuthLoading(false)
    }
    checkSession()
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    loadTodayStatus(user.id)
    setCurrentScreen('home')
    setAuthStep(needsPasswordChange(user) ? 'setPassword' : 'welcome')
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
    setCurrentScreen('home')
    setDimensions([
      { id: 'wisdom', label: 'Akal Budi', icon: '🧠', completed: false },
      { id: 'physical', label: 'Fisik', icon: '💪', completed: false },
      { id: 'spiritual', label: 'Rohani', icon: '🙏', completed: false },
      { id: 'social', label: 'Sosial', icon: '🤝', completed: false },
    ])
    setStreaks({ wisdom: 0, physical: 0, spiritual: 0, social: 0, full_day: 0 })
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
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50 dark:bg-[#0D0D0D] pt-safe">
      <Screen {...props} />
    </div>
  )

  // LOADING
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0D0D0D]">
        <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
      </div>
    )
  }

  // ⭐ PRIORITAS TERTINGGI: RECOVERY LINK
  if (isRecovery || isRecoveryLink()) {
    return <SetPasswordScreen onComplete={handlePasswordResetComplete} />
  }

  // LOGIN / FORGOT PASSWORD
  if (!currentUser) {
    if (showForgot) {
      return <ForgotPasswordScreen onBack={() => setShowForgot(false)} />
    }
    return <LoginScreen
      onLoginSuccess={handleLoginSuccess}
      onForgot={() => setShowForgot(true)}
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
    <div className="max-w-lg mx-auto pt-safe">
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
        onKomselClick={() => setCurrentScreen('komsel')}
        onWorkerClick={() => setCurrentScreen('worker')}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default App