// ============================================
// THEME — ACS My Journey
// Semua warna di sini, jangan hardcode di komponen
// ============================================

export const colors = {
  // Primary
  black: '#111111',
  orange: '#FF8A00',
  orangeHover: '#E67A00',
  
  // Background
  lightBg: '#F8F8F8',
  darkBg: '#0D0D0D',
  
  // Cards
  lightCard: '#FFFFFF',
  darkCard: '#151515',
  
  // Text
  lightText: '#111111',
  darkText: '#FFFFFF',
  lightSecondary: '#666666',
  darkSecondary: '#999999',
  
  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Border
  lightBorder: '#E5E5E5',
  darkBorder: '#2A2A2A',
}

export const getTheme = (darkMode) => ({
  background: darkMode ? colors.darkBg : colors.lightBg,
  card: darkMode ? colors.darkCard : colors.lightCard,
  text: darkMode ? colors.darkText : colors.lightText,
  secondary: darkMode ? colors.darkSecondary : colors.lightSecondary,
  border: darkMode ? colors.darkBorder : colors.lightBorder,
})