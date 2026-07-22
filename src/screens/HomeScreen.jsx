// screens/HomeScreen.jsx
import DimensionCard from '../components/DimensionCard'
import { useTranslation } from '../hooks/useTranslation'

function HomeScreen({ 
  darkMode, 
  toggleDarkMode, 
  dimensions, 
  onDimensionClick,
  onKomselClick,
  onWorkerClick,
  streaks,
  onLogout   // ← TAMBAHKAN INI
}) {
  const { t, locale, toggleLocale } = useTranslation()
  const completedCount = streaks?.full_day || dimensions.filter(d => d.completed).length

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-[#0D0D0D] text-gray-900 dark:text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4">
        <div>
          <h1 className="text-xl font-bold">{t('app.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('app.greeting')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleLocale}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700"
          >
            {locale === 'en' ? '🇮🇩 ID' : '🇬🇧 EN'}
          </button>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-[#FF8A00] text-black' 
                : 'bg-[#111111] text-white'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {t('home.logout')}
          </button>
        </div>
      </div>

      {/* STREAK */}
      <div className="mx-4 p-4 rounded-lg text-center bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-700">
        <p className="text-2xl font-bold text-[#FF8A00]">
          {t('home.streak').replace('{count}', completedCount)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {completedCount === 4 ? t('home.complete') : t('home.incomplete')}
        </p>
      </div>

      {/* 4 DIMENSI — SEMUA AKTIF */}
      <div className="p-4 space-y-3">
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
      <div className="p-4 grid grid-cols-2 gap-3">
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
  )
}

export default HomeScreen