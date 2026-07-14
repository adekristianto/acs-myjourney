// hooks/useTranslation.js
import { useState, useEffect } from 'react'
import id from '../locales/id.json'
import en from '../locales/en.json'

const translations = { id, en }

export function useTranslation() {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('appLocale') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('appLocale', locale)
  }, [locale])

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[locale]
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k]
      } else {
        return key
      }
    }
    return value
  }

  const toggleLocale = () => {
    setLocale(prev => prev === 'en' ? 'id' : 'en')
  }

  return { t, locale, toggleLocale }
}