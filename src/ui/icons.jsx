// src/ui/icons.jsx — ikon garis gaya iOS (tanpa emoji)
const S = ({ children, size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{children}</svg>
)
export const IconWisdom = (p) => <S {...p}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></S>
export const IconPhysical = (p) => <S {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></S>
export const IconSpiritual = (p) => <S {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM20 17v4H6.5" /></S>
export const IconSocial = (p) => <S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20c-.4-2.6-1.8-4.4-3.8-5.1" /></S>
export const IconChevron = (p) => <S size={16} {...p}><path d="M9 6l6 6-6 6" /></S>
export const IconBack = (p) => <S size={22} {...p}><path d="M15 6l-6 6 6 6" /></S>
export const IconCheck = (p) => <S size={14} strokeWidth="3.2" {...p}><path d="M5 12.5l4.5 4.5L19 7" /></S>
export const IconMoon = (p) => <S size={18} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></S>
export const IconSun = (p) => <S size={18} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></S>
export const IconLogout = (p) => <S size={18} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></S>
export const IconBook = (p) => <S {...p}><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></S>

// eslint-disable-next-line react-refresh/only-export-components
export const DIMENSIONS = {
  wisdom: { color: '#0A84FF', Icon: IconWisdom },
  physical: { color: '#30B94D', Icon: IconPhysical },
  spiritual: { color: '#FF8A00', Icon: IconSpiritual },
  social: { color: '#AF52DE', Icon: IconSocial },
}

export function DimIcon({ id, size = 30 }) {
  const d = DIMENSIONS[id] || DIMENSIONS.wisdom
  return (
    <span className="rounded-[8px] flex items-center justify-center text-white shrink-0"
      style={{ width: size, height: size, background: d.color }}>
      <d.Icon size={Math.round(size * 0.58)} strokeWidth="2.2" />
    </span>
  )
}
