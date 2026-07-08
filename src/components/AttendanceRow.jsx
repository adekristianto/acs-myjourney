// components/AttendanceRow.jsx
// Komponen reusable untuk checklist kehadiran
// Dipakai di Komsel dan Meeting Pekerja

function AttendanceRow({ name, isPresent, onToggle }) {
  return (
    <div 
      className={`
        flex items-center justify-between p-3 rounded-lg transition-colors
        ${isPresent ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-[#151515]'}
        border border-gray-200 dark:border-gray-700
      `}
    >
      <span className="font-medium text-gray-900 dark:text-white">
        {name}
      </span>
      <button
        onClick={onToggle}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
          ${isPresent 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }
        `}
      >
        {isPresent ? '✓' : '+'}
      </button>
    </div>
  )
}

export default AttendanceRow