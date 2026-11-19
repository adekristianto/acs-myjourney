// src/ui/Toast.jsx — pengganti alert(). Pakai: const toast = useToast(); toast.success('...'); toast.error('...')
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const show = useCallback((message, type = 'success') => {
    clearTimeout(timer.current)
    setToast({ message, type, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), type === 'error' ? 4000 : 2500)
  }, [])
  const api = useMemo(() => ({ success: m => show(m, 'success'), error: m => show(m, 'error'), info: m => show(m, 'info') }), [show])
  return (
    <ToastCtx.Provider value={api}>
      {children}
      {toast && (
        <div key={toast.key} role="status" className="fixed left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
          <div className="mj-toast pointer-events-auto max-w-sm w-full flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl
            bg-white/90 dark:bg-[#2C2C2E]/90 backdrop-blur-xl border border-black/5 dark:border-white/10"
            onClick={() => setToast(null)}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm shrink-0 ${
              toast.type === 'error' ? 'bg-[#FF3B30]' : toast.type === 'info' ? 'bg-[#0A84FF]' : 'bg-[#34C759]'}`}>
              {toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓'}
            </span>
            <span className="text-[15px] font-medium text-gray-900 dark:text-white leading-snug">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastCtx) || { success: () => {}, error: () => {}, info: () => {} }
}
