export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceBorder: string;
  
  // Brand Gold / Brass
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;

  // Accents
  secondary: string;
  secondaryMuted: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Statuses
  confirmed: string;
  confirmedBg: string;
  inChair: string;
  inChairBg: string;
  pending: string;
  pendingBg: string;
  completed: string;
  completedBg: string;
  cancelled: string;
  cancelledBg: string;

  danger: string;
  white: string;
}

export const darkColors: ThemeColors = {
  background: '#0b0f17',
  surface: '#151d2a',
  surfaceElevated: '#1e293b',
  surfaceBorder: '#293548',

  primary: '#d99b26',
  primaryLight: '#f5b942',
  primaryDark: '#a16d12',
  primaryMuted: 'rgba(217, 155, 38, 0.15)',

  secondary: '#38bdf8',
  secondaryMuted: 'rgba(56, 189, 248, 0.12)',

  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  confirmed: '#10b981',
  confirmedBg: 'rgba(16, 185, 129, 0.15)',
  inChair: '#3b82f6',
  inChairBg: 'rgba(59, 130, 246, 0.15)',
  pending: '#f59e0b',
  pendingBg: 'rgba(245, 158, 11, 0.15)',
  completed: '#8b5cf6',
  completedBg: 'rgba(139, 92, 246, 0.15)',
  cancelled: '#ef4444',
  cancelledBg: 'rgba(239, 68, 68, 0.15)',

  danger: '#ef4444',
  white: '#ffffff',
};

export const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  surfaceBorder: '#e2e8f0',

  primary: '#b47b16',
  primaryLight: '#d99b26',
  primaryDark: '#855609',
  primaryMuted: 'rgba(180, 123, 22, 0.12)',

  secondary: '#0284c7',
  secondaryMuted: 'rgba(2, 132, 199, 0.1)',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',

  confirmed: '#059669',
  confirmedBg: 'rgba(5, 150, 105, 0.12)',
  inChair: '#2563eb',
  inChairBg: 'rgba(37, 99, 235, 0.12)',
  pending: '#d97706',
  pendingBg: 'rgba(217, 119, 6, 0.12)',
  completed: '#7c3aed',
  completedBg: 'rgba(124, 58, 237, 0.12)',
  cancelled: '#dc2626',
  cancelledBg: 'rgba(220, 38, 38, 0.12)',

  danger: '#dc2626',
  white: '#ffffff',
};

export const defaultTheme = {
  colors: darkColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },
};

// Mutable theme object to preserve backward compatibility with existing StyleSheet references
export const theme = {
  ...defaultTheme,
  colors: { ...darkColors },
};
