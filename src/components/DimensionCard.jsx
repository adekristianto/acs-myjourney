// components/DimensionCard.jsx
function DimensionCard({ 
  icon, 
  label, 
  completed, 
  isActive, 
  onClick,
  buttonText,
  statusText,
  streak   // ← TERIMA PROP STREAK
}) {
  return (
    <div className="p-4 rounded-lg flex items-center justify-between bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {statusText}
            {streak !== undefined && streak > 0 && ` • 🔥 ${streak} hari`}
            {streak !== undefined && streak === 0 && ` • 🔥 0 hari`}
          </p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`px-3 py-1 rounded text-sm font-medium ${
          completed 
            ? 'bg-green-500 text-white cursor-default' 
            : isActive
              ? 'bg-[#FF8A00] text-white hover:bg-[#E67A00] cursor-pointer'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
      >
        {buttonText}
      </button>
    </div>
  )
}

export default DimensionCard