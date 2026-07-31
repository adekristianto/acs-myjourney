// screens/LoginScreen.jsx
import { useState } from 'react'
import { loginJemaat } from '../services/database'
import { useTranslation } from '../hooks/useTranslation'

function LoginScreen({ onLoginSuccess }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (loading) return
    if (!email.trim() || !password) {
      setError(t('login.errorEmpty'))
      return
    }
    setLoading(true)
    setError('')

    const { data, error: loginError } = await loginJemaat(
      email.trim().toLowerCase(),
      password
    )
    setLoading(false)

    if (loginError || !data?.user) {
      setError(t('login.error'))
      return
    }
    onLoginSuccess(data.user)
  }

  const onEnter = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  const inputClass =
    'w-full p-4 rounded-xl text-base bg-white dark:bg-[#151515] ' +
    'border border-[#E5E5E5] dark:border-[#2A2A2A] ' +
    'text-[#111111] dark:text-white placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent ' +
    'transition-all duration-200'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-[#F8F8F8] dark:bg-[#0D0D0D]">
      
      <div className="w-full max-w-sm">
        
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/acs-logo.png" alt="ACS" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-[#111111] dark:text-white">My Journey</h1>
        </div>

        <div className="rounded-2xl p-6 bg-white dark:bg-[#151515]">
          <label className="block text-sm font-medium mb-2 text-[#111111] dark:text-white">
            {t('login.email')}
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={onEnter}
            placeholder="email@contoh.com"
            className={inputClass + ' mb-5'}
          />

          <label className="block text-sm font-medium mb-2 text-[#111111] dark:text-white">
            {t('login.password')}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={onEnter}
            placeholder={t('login.passwordPlaceholder')}
            className={inputClass + ' mb-6'}
          />

          {error && (
            <p className="text-sm mb-4 text-center text-[#EF4444]">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white bg-[#FF8A00] disabled:opacity-50 transition-opacity hover:bg-[#E67A00] active:scale-[0.98]"
          >
            {loading ? t('common.signingIn') : t('login.button')}
          </button>
        </div>

        <p className="text-xs text-center mt-6 text-[#666666] dark:text-[#999999]">
          {t('login.helper')}
        </p>
        
      </div>
    </div>
  )
}

export default LoginScreen