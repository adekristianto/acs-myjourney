import { useState } from 'react'
import { loginJemaat } from '../services/database'
import { colors } from '../theme'

function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error } = await loginJemaat(email, password)
    setLoading(false)
    if (error) {
      setError('Email atau password salah. Silakan coba lagi.')
      return
    }
    onLoginSuccess(data.user)
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center px-6"
      style={{ backgroundColor: colors.lightBg }}
    >
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold" style={{ color: colors.black }}>
          My Journey
        </h1>
        <p className="text-sm mt-2" style={{ color: colors.lightSecondary }}>
          GBI Anugrah Church @Storehouse
        </p>
      </div>

      <div className="rounded-2xl p-6" style={{ backgroundColor: colors.lightCard }}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: colors.black }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            className="w-full p-3 rounded-lg border text-sm"
            style={{ borderColor: '#E5E5E5', color: colors.black }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" style={{ color: colors.black }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nomor Induk Jemaat (login pertama)"
            className="w-full p-3 rounded-lg border text-sm"
            style={{ borderColor: '#E5E5E5', color: colors.black }}
          />
        </div>

        {error && (
          <p className="text-sm mb-4 text-center" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{ backgroundColor: loading ? '#999' : colors.orange }}
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: colors.lightSecondary }}>
        Password default: Nomor Induk Jemaat kamu. Hubungi admin gereja kalau lupa.
      </p>
    </div>
  )
}

export default LoginScreen