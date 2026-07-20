import { useState, useEffect } from 'react'
import { colors } from './theme'
import { getCurrentJemaat } from './services/database'
import LoginScreen from './screens/LoginScreen'
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
  const [darkMode, setDarkMode] = useState(false)
  const [dimensions, setDimensions] = useState([
    { id: 'wisdom', label: 'Akal Budi', icon: '🧠', completed: false },
    { id: 'physical', label: 'Fisik', icon: '💪', completed: false },
    { id: 'spiritual', label: 'Rohani', icon: '🙏', completed: false },
    { id: 'social', label: 'Sosial', icon: '🤝', completed: false },
  ])
  const [streaks, setStreaks] = useState({
    wisdom: 0, physical: 0, spiritual: 0, social: 0, full_day: 0
  })

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getCurrentJemaat()
      if (data) setCurrentUser(data)
      setAuthLoading(false)
    }
    checkSession()
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const markDimensionCompleted = (id) => {
    setDimensions(prev =>
      prev.map(dim => dim.id === id ? { ...dim, completed: true } : dim)
    )
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setCurrentScreen('home')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentScreen('home')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.lightBg }}>
        <p style={{ color: colors.lightSecondary }}>Memuat...</p>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
  }

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
      onComplete={() => markDimensionCompleted('spiritual')}
    />
  }
  if (currentScreen === 'wisdom') {
    return <WisdomScreen
      onBack={() => setCurrentScreen('home')}
      currentUser={currentUser}
      onComplete={() => markDimensionCompleted('wisdom')}
    />
  }
  if (currentScreen === 'physical') {
    return <PhysicalScreen
      onBack={() => setCurrentScreen('home')}
      currentUser={currentUser}
      onComplete={() => markDimensionCompleted('physical')}
    />
  }
  if (currentScreen === 'social') {
    return <SocialScreen
      onBack={() => setCurrentScreen('home')}
      currentUser={currentUser}
      onComplete={() => markDimensionCompleted('social')}
    />
  }

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