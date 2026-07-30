// screens/HomeScreen.jsx
import DimensionCard from '../components/DimensionCard'
import { useTranslation } from '../hooks/useTranslation'

function HomeScreen({ 
  currentUser,
  darkMode, 
  toggleDarkMode, 
  dimensions, 
  onDimensionClick,
  onKomselClick,
  onWorkerClick,
  streaks,
  onLogout
}) {
  const { t, locale, toggleLocale } = useTranslation()
  const completedCount = streaks?.full_day || dimensions.filter(d => d.completed).length

  // Ambil nama user dari currentUser
  const userName = currentUser?.nama || 'ACS Congregation'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white overflow-x-hidden">
      <div className="max-w-lg mx-auto px-4 pb-20">
        {/* HEADER */}
        <div className="flex justify-between items-center py-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{t('app.title')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              Welcome back, {userName}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <button
              onClick={toggleLocale}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-700"
            >
              {locale === 'en' ? '🇮🇩' : '🇬🇧'}
            </button>
            <button
              onClick={toggleDarkMode}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-[#FF8A00] text-black' 
                  : 'bg-[#111111] text-white'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              {t('home.logout') || 'Logout'}
            </button>
          </div>
        </div>

        {/* STREAK */}
        <div className="p-4 rounded-lg text-center bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-[#FF8A00]">
            {t('home.streak').replace('{count}', completedCount)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount === 4 ? t('home.complete') : t('home.incomplete')}
          </p>
        </div>

        {/* 4 DIMENSI */}
        <div className="py-3 space-y-3">
          {dimensions.map((dim) => {
            const isActive = !dim.completed
            const buttonText = dim.completed 
              ? t('home.doneButton')
              : t('home.startButton')
            
            const labelKey = `dimensions.${dim.id}`
            const label = t(labelKey) !== labelKey ? t(labelKey) : dim.label
            
            const dimStreak = streaks?.[dim.id] || 0
            
            return (
              <DimensionCard
                key={dim.id}
                icon={dim.icon}
                label={label}
                completed={dim.completed}
                isActive={isActive}
                onClick={() => {
                  if (isActive) {
                    onDimensionClick(dim.id)
                  }
                }}
                buttonText={buttonText}
                statusText={dim.completed ? t('home.done') : t('home.notStarted')}
                streak={dimStreak}
              />
            )
          })}
        </div>

        {/* QUICK ACCESS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onKomselClick}
            className="p-4 rounded-lg text-center font-medium text-white bg-[#FF8A00] hover:bg-[#E67A00] transition-colors"
          >
            📋 {t('attendance.komsel')}
          </button>
          <button
            onClick={onWorkerClick}
            className="p-4 rounded-lg text-center font-medium text-white bg-black hover:bg-gray-800 transition-colors dark:bg-[#151515] dark:hover:bg-[#222222]"
          >
            👥 {t('attendance.worker')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen