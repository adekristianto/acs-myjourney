// components/DimensionCard.jsx
function DimensionCard({ 
  icon, 
  label, 
  completed, 
  isActive, 
  onClick,
  buttonText,
  statusText,
  streak
}) {
  return (
    <div className="p-3 rounded-lg flex items-center justify-between bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-700">
      
      {/* Kiri: Icon + Label + Status */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {statusText} · {streak > 0 ? `🔥 ${streak} hari` : ''}
          </p>
        </div>
      </div>

      {/* Kanan: Tombol */}
      <button
        onClick={onClick}
        className={`flex-shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
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