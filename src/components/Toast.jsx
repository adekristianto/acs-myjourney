// src/components/Toast.jsx
import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : type === 'error' 
      ? 'bg-red-500' 
      : 'bg-yellow-500'

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in`}>
      {message}
    </div>
  )
}

export default Toast