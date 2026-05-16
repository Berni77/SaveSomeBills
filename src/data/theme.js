// Zentrales Design-System – alle Farben, Schriftgrößen, Abstände und Radien der App

// Farbpalette: Dunkles Theme mit Cyan-Akzent (#00d4aa)
export const colors = {
  // Backgrounds
  bg: '#0a0a0f',
  bgCard: '#13131a',
  bgCardLight: '#1a1a24',
  bgInput: '#1e1e2a',

  // Accent - cyan/teal from prototype
  accent: '#00d4aa',
  accentDim: '#00b894',
  accentGlow: 'rgba(0, 212, 170, 0.15)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#8888aa',
  textMuted: '#55556a',

  // Semantic
  danger: '#ff4757',
  warning: '#ffa502',
  success: '#2ed573',

  // Border
  border: '#1e1e2e',
  borderLight: '#2a2a3a',

  // Tab bar
  tabBg: '#0f0f18',
};

// Typografie-Skala: einheitliche Schriftgrößen und -gewichte
export const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 38,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Abstands-Skala in Pixeln für konsistente Layouts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// Border-Radius-Werte für abgerundete Ecken
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};
