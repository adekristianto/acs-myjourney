// src/screens/LoginScreen.jsx — redesign iOS (logika tidak berubah)
import { useState } from 'react'
import { loginJemaat } from '../services/database'
import { useTranslation } from '../hooks/useTranslation'

export default function LoginScreen({ onLoginSuccess, onForgot }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (loading) return
    if (!email.trim() || !password) { setError(t('login.errorEmpty')); return }
    setLoading(true); setError('')
    try {
      const { data, error: loginError } = await loginJemaat(email.trim().toLowerCase(), password)
      if (loginError || !data?.user) { setError(t('login.error')); return }
      await onLoginSuccess(data.user)
    } catch {
      setError(t('login.error'))
    } finally {
      setLoading(false)
    }
  }
  const onEnter = (e) => { if (e.key === 'Enter') handleLogin() }
  const row = 'w-full bg-transparent px-4 h-[50px] text-[17px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none'

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col">
      <div className="w-full max-w-sm mx-auto px-4 flex-1 flex flex-col justify-center py-10">
        <img src="/icon-512.png" alt="" className="w-24 h-24 rounded-[22px] mx-auto shadow-xl shadow-black/20" />
        <h1 className="mt-5 text-center text-[28px] font-bold tracking-tight text-gray-900 dark:text-white">My Journey</h1>
        <p className="mt-1 mb-8 text-center text-[15px] text-gray-500 dark:text-gray-400">GBI ACS · Lukas 2:52</p>

        <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
          <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }} onKeyDown={onEnter}
            placeholder={t('login.email')} className={row} />
          <div className="h-px bg-black/[0.08] dark:bg-white/[0.1] ml-4" />
          <input type="password" autoComplete="current-password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }} onKeyDown={onEnter}
            placeholder={t('login.password')} className={row} />
        </div>
        <p className="px-4 mt-2 text-[13px] text-gray-500 dark:text-gray-400">{t('login.helper')}</p>

        {error && <p className="px-4 mt-3 text-[14px] text-[#FF3B30]">{error}</p>}

        <button onClick={handleLogin} disabled={loading}
          className="mt-6 w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold disabled:opacity-60 active:scale-[0.99] transition">
          {loading ? t('common.signingIn') : t('login.button')}
        </button>
        <button onClick={onForgot} className="mt-3 w-full h-11 text-[#FF8A00] text-[16px] font-medium">{t('forgotLink')}</button>
      </div>
    </div>
  )
}
