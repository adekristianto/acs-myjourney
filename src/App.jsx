import { useState, useEffect } from 'react'
import { colors } from './theme'
import { getCurrentJemaat, getStreaks, updateStreak, needsPasswordChange } from './services/database'
import LoginScreen from './screens/LoginScreen'
import SetPasswordScreen from './screens/SetPasswordScreen'
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
  const [darkMode, setDarkMode] = useState(false)
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

  // CEK SESSION
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getCurrentJemaat()
      if (data) {
        setCurrentUser(data)
        // Load streaks setelah user login
        await loadStreaks(data.id)
      }
      setAuthLoading(false)
    }
    checkSession()
  }, [])

  // LOAD STREAKS
  const loadStreaks = async (jemaatId) => {
    if (!jemaatId) return
    const { data } = await getStreaks(jemaatId)
    if (data) {
      setStreaks(data)
      // Update dimensions completed berdasarkan streaks
      setDimensions(prev =>
        prev.map(dim => ({
          ...dim,
          completed: data[dim.id] > 0
        }))
      )
    }
  }

  // UPDATE STREAK SETELAH SUBMIT JOURNAL
  const updateStreakAfterJournal = async (dimensionId) => {
    if (!currentUser) return

    // Hitung streak baru untuk dimensi ini
    const currentStreak = streaks[dimensionId] || 0
    const newStreak = currentStreak + 1

    // Update di database
    await updateStreak(currentUser.id, dimensionId, newStreak)

    // Update state lokal
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

    // Update dimensions
    setDimensions(prev =>
      prev.map(dim =>
        dim.id === dimensionId ? { ...dim, completed: true } : dim
      )
    )
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setCurrentScreen('home')
    setAuthStep(needsPasswordChange(user) ? 'setPassword' : 'welcome')
  }

  const handleLogout = () => {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0D0D0D]">
        <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
  }

  if (authStep === 'setPassword') {
    return <SetPasswordScreen onComplete={() => setAuthStep('welcome')} />
  }

  if (authStep === 'welcome') {
    return <WelcomeScreen onBegin={() => setAuthStep('ready')} />
  }

  // NAVIGATION
  if (currentScreen === 'komsel') {
    return <KomselAttendanceScreen onBack={() => setCurrentScreen('home')} />
  }
  if (currentScreen === 'worker') {
    return <WorkerAttendanceScreen onBack={() => setCurrentScreen('home')} />
  }
  if (currentScreen === 'bible') {
    return <BibleJournalScreen
      onBack={() => setCurrentScreen('home')}
      darkMode={darkMode}
      currentUser={currentUser}
      onComplete={() => updateStreakAfterJournal('spiritual')}
    />
  }
  if (currentScreen === 'wisdom') {
    return <WisdomScreen
      onBack={() => setCurrentScreen('home')}
      currentUser={currentUser}
      onComplete={() => updateStreakAfterJournal('wisdom')}
    />
  }
  if (currentScreen === 'physical') {
    return <PhysicalScreen
      onBack={() => setCurrentScreen('home')}
      currentUser={currentUser}
      onComplete={() => updateStreakAfterJournal('physical')}
    />
  }
  if (currentScreen === 'social') {
    return <SocialScreen
      onBack={() => setCurrentScreen('home')}
      currentUser={currentUser}
      onComplete={() => updateStreakAfterJournal('social')}
    />
  }

  // HOME
  return (
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
  )
}

export default App