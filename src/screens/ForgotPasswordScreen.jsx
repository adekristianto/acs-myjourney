// screens/ForgotPasswordScreen.jsx
import { useState } from 'react'
import { sendPasswordReset } from '../services/database'
import { useTranslation } from '../hooks/useTranslation'

function ForgotPasswordScreen({ onBack }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (loading) return
    if (!email.trim()) {
      setError(t('forgot.errorEmpty'))
      return
    }
    setLoading(true)
    setError('')
    const { error: resetError } = await sendPasswordReset(email)
    setLoading(false)
    setSent(true)
  }

  const inputClass =
    'w-full p-4 rounded-xl text-base bg-white dark:bg-[#151515] ' +
    'border border-[#E5E5E5] dark:border-[#2A2A2A] ' +
    'text-[#111111] dark:text-white placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent ' +
    'transition-all duration-200'

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-[#F8F8F8] dark:bg-[#0D0D0D]">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-3 text-[#111111] dark:text-white">
            {t('forgot.sentTitle')}
          </h2>
          <p className="text-sm text-[#666666] dark:text-[#999999] mb-8 leading-relaxed">
            {t('forgot.sentBody')}
          </p>
          <button
            onClick={onBack}
            className="w-full py-4 rounded-xl font-semibold text-white bg-[#FF8A00] hover:bg-[#E67A00] active:scale-[0.98] transition-all"
          >
            {t('forgot.backToLogin')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-[#F8F8F8] dark:bg-[#0D0D0D]">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-[#111111] dark:text-white">
          {t('forgot.title')}
        </h2>
        <p className="text-sm mb-8 text-[#666666] dark:text-[#999999]">
          {t('forgot.sub')}
        </p>

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
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="email@contoh.com"
          className={inputClass + ' mb-4'}
        />

        {error && <p className="text-sm mb-4 text-center text-[#EF4444]">{error}</p>}

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold text-white bg-[#FF8A00] disabled:opacity-50 transition-all hover:bg-[#E67A00] active:scale-[0.98] mb-3"
        >
          {loading ? t('common.sending') : t('forgot.button')}
        </button>

        <button
          onClick={onBack}
          className="text-sm text-center w-full text-[#666666] dark:text-[#999999] underline"
        >
          {t('forgot.backToLogin')}
        </button>
      </div>
    </div>
  )
}

export default ForgotPasswordScreen