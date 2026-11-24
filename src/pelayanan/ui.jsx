// src/pelayanan/ui.jsx — komponen tampilan bersama modul Pelayanan
import { IconBack } from '../ui/icons'

export function Page({ title, backLabel = 'Kembali', onBack, children, right }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 pb-16">
        <nav className="flex items-center justify-between h-12 -ml-1">
          <button onClick={onBack} className="flex items-center text-[#FF8A00] text-[17px] active:opacity-60"><IconBack />{backLabel}</button>
          {right}
        </nav>
        <h1 className="text-[30px] font-bold tracking-tight leading-tight mb-4">{title}</h1>
        {children}
      </div>
    </div>
  )
}

export function Section({ title, footer, children }) {
  return (
    <section className="mb-6">
      {title && <h2 className="px-4 mb-2 text-[13px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h2>}
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">{children}</div>
      {footer && <p className="px-4 mt-2 text-[13px] text-gray-500 dark:text-gray-400">{footer}</p>}
    </section>
  )
}

export function Row({ children, onClick, first }) {
  const cls = `w-full flex items-center gap-3 px-4 py-3 text-left relative ${onClick ? 'active:bg-black/[0.04] dark:active:bg-white/[0.06]' : ''}`
  const line = !first && <span className="absolute top-0 right-0 left-4 h-px bg-black/[0.08] dark:bg-white/[0.1]" />
  return onClick
    ? <button onClick={onClick} className={cls}>{line}{children}</button>
    : <div className={cls}>{line}{children}</div>
}

export const inputBase = 'rounded-xl bg-[#F2F2F7] dark:bg-black/40 px-3 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/60 placeholder:text-gray-400'
export const inputCls = 'w-full ' + inputBase

export function Field({ label, hint, children }) {
  return (
    <div className="px-4 py-3 relative">
      <label className="block text-[14px] font-medium mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  )
}

export function Chips({ options, value, onChange, multi }) {
  // options: ['A','B'] atau [{ value, label }]
  const val = (o) => (typeof o === 'object' ? o.value : o)
  const lab = (o) => (typeof o === 'object' ? o.label : o)
  const isOn = (o) => (multi ? (value || []).includes(val(o)) : value === val(o))
  const toggle = (o) => {
    if (!multi) return onChange(val(o))
    const v = value || []
    onChange(v.includes(val(o)) ? v.filter(x => x !== val(o)) : [...v, val(o)])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={val(o)} type="button" onClick={() => toggle(o)}
          className={`px-3 py-1.5 rounded-full text-[14px] font-medium border transition ${isOn(o)
            ? 'bg-[#FF8A00] border-[#FF8A00] text-white'
            : 'bg-transparent border-gray-300 dark:border-[#3A3A3C] text-gray-700 dark:text-gray-300'}`}>{lab(o)}</button>
      ))}
    </div>
  )
}

export function Badge({ color, children }) {
  return <span className="inline-flex items-center gap-1.5 text-[13px] font-medium"><span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />{children}</span>
}

export const primaryBtn = 'w-full h-[50px] rounded-xl bg-[#FF8A00] text-white text-[17px] font-semibold disabled:opacity-60 active:scale-[0.99] transition'
