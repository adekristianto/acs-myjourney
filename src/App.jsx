import { useState, useEffect } from 'react'
import { colors } from './theme'
import { 
  getCurrentJemaat, 
  getStreaks, 
  getTodayJournal,
  updateStreak, 
  needsPasswordChange, 
  logoutJemaat,
  isRecoveryLink
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
  // State untuk recovery mode
  const [isRecovery, setIsRecovery] = useState(false)

  // LOAD STATUS HARI INI
  const loadTodayStatus = async (jemaatId) => {
    if (!jemaatId) return

    const dims = ['wisdom', 'physical', 'spiritual', 'social']
    const todayStatus = {}
    const today = new Date().toISOString().split('T')[0]

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
  const updateStreakAfterJournal = async (dimensionId) => {
    if (!currentUser) return

    const currentStreak = streaks[dimensionId] || 0
    const newStreak = currentStreak + 1

    const result = await updateStreak(currentUser.id, dimensionId, newStreak)

    if (result.error) {
      console.error('❌ Streak update failed:', result.error)
      alert('⚠️ Gagal menyimpan streak. Jurnal tetap tersimpan, tapi streak mungkin tidak akurat.')
      return
    }

    await loadTodayStatus(currentUser.id)

    setStreaks(prev => ({
      ...prev,
      [dimensionId]: newStreak,
      full_day: Math.min(
        dimensionId === 'wisdom' ? newStreak : prev.wisdom,
        dimensionId === 'physical' ? newStreak : prev.physical,
        dimensionId === 'spiritual' ? newStreak : prev.spiritual,
        dimensionId === 'social' ? newStreak : prev.social
      )
    }))
  }

  // CEK SESSION
  useEffect(() => {
    console.log('🔍 App mounted, checking session...')
    console.log('🔍 URL:', window.location.href)
    console.log('🔍 isRecoveryLink:', isRecoveryLink())

    if (darkMode) {
      document.documentElement.classList.add('dark')
    }

    // CEK APAKAH INI RECOVERY LINK — PALING PERTAMA!
    if (isRecoveryLink()) {
      console.log('🔐 RECOVERY LINK DETECTED! Redirecting to SetPasswordScreen')
      setIsRecovery(true)
      setAuthLoading(false)
      return
    }

    const checkSession = async () => {
      console.log('🔍 Checking normal session...')
      const { data } = await getCurrentJemaat()
      if (data) {
        console.log('✅ User found:', data.nama)
        setCurrentUser(data)
        await loadTodayStatus(data.id)
      } else {
        console.log('ℹ️ No user session found')
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
    console.log('✅ Password reset complete!')
    // Clear hash & query params dari URL
    window.history.replaceState(null, '', window.location.pathname)
    setIsRecovery(false)
    setAuthStep('ready')
    // Reload user session setelah reset
    const { data } = await getCurrentJemaat()
    if (data) {
      console.log('✅ User reloaded:', data.nama)
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
  // Harus di atas semua kondisi lain (termasuk !currentUser)
  if (isRecovery || isRecoveryLink()) {
    console.log('🔐 Rendering SetPasswordScreen for recovery')
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