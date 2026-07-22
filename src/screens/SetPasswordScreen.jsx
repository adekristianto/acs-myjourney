import { useState } from 'react'
import { updatePassword } from '../services/database'
import { useTranslation } from '../hooks/useTranslation'

function SetPasswordScreen({ onComplete }) {
  const { t } = useTranslation()
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Validasi hidup — muncul saat mengetik, bukan hanya saat submit
  const tooShort = pass.length > 0 && pass.length < 8
  const notMatch = confirm.length > 0 && pass !== confirm
  const isValid = pass.length >= 8 && pass === confirm

  const handleSubmit = async () => {
    if (loading || !isValid) return
    setLoading(true)
    setError('')

    // database.js mengembalikan { data, error } — TIDAK melempar exception
    const { data, error: updateError } = await updatePassword(pass)
    setLoading(false)

    if (updateError || !data?.user) {
      setError(t('set_pass.error_failed'))
      return
    }
    onComplete()
  }

  const inputClass =
    'w-full p-4 rounded-xl text-sm bg-white dark:bg-[#151515] ' +
    'border border-[#E5E5E5] dark:border-[#2A2A2A] ' +
    'text-[#111111] dark:text-white placeholder-gray-400'

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-[#F8F8F8] dark:bg-[#0D0D0D]">
      <h2 className="text-2xl font-bold mb-2 text-[#111111] dark:text-white">
        {t('set_pass.title')}
      </h2>
      <p className="text-sm mb-8 text-[#666666] dark:text-[#999999]">
        {t('set_pass.sub')}
      </p>

      <input
        type={showPass ? 'text' : 'password'}
        autoComplete="new-password"
        value={pass}
        onChange={(e) => { setPass(e.target.value); setError('') }}
        placeholder={t('set_pass.new')}
        className={inputClass + ' mb-2'}
      />
      {tooShort && (
        <p className="text-xs mb-2 text-[#EF4444]">{t('set_pass.error_len')}</p>
      )}

      <input
        type={showPass ? 'text' : 'password'}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => { setConfirm(e.target.value); setError('') }}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={t('set_pass.confirm')}
        className={inputClass + ' mt-2 mb-2'}
      />
      {notMatch && (
        <p className="text-xs mb-2 text-[#EF4444]">{t('set_pass.error_match')}</p>
      )}

      <button
        type="button"
        onClick={() => setShowPass(!showPass)}
        className="text-xs self-start mb-6 underline text-[#666666] dark:text-[#999999]"
      >
        {showPass ? t('set_pass.hide') : t('set_pass.show')}
      </button>

      {error && (
        <p className="text-sm mb-4 text-center text-[#EF4444]">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !isValid}
        className="w-full py-4 rounded-xl font-semibold text-white bg-[#FF8A00] disabled:opacity-40 transition-opacity"
      >
        {loading ? t('common.saving') : t('set_pass.save')}
      </button>
    </div>
  )
}

export default SetPasswordScreen