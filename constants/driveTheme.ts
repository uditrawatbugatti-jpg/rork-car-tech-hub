export const DriveTheme = {
  colors: {
    background: {
      primary: '#0A0A0F',
      secondary: '#12121A',
      glass: 'rgba(20, 20, 30, 0.85)',
      glassLight: 'rgba(255, 255, 255, 0.03)',
    },
    accent: {
      primary: '#00D4FF',
      secondary: '#0099CC',
      warm: '#FF6B35',
      success: '#00FF94',
      warning: '#FFB800',
      critical: '#FF3B5C',
    },
    gauge: {
      track: 'rgba(255, 255, 255, 0.06)',
      trackGlow: 'rgba(0, 212, 255, 0.1)',
      needle: '#FFFFFF',
      speedNormal: '#00D4FF',
      speedWarning: '#FFB800',
      speedCritical: '#FF3B5C',
      rpmNormal: '#00FF94',
      rpmWarning: '#FFB800',
      rpmRedline: '#FF3B5C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.6)',
      tertiary: 'rgba(255, 255, 255, 0.35)',
      accent: '#00D4FF',
    },
    status: {
      normal: '#00FF94',
      warning: '#FFB800',
      critical: '#FF3B5C',
      info: '#00D4FF',
    },
    glow: {
      cyan: 'rgba(0, 212, 255, 0.4)',
      green: 'rgba(0, 255, 148, 0.4)',
      orange: 'rgba(255, 184, 0, 0.4)',
      red: 'rgba(255, 59, 92, 0.4)',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    speedLarge: {
      fontSize: 120,
      fontWeight: '200' as const,
      letterSpacing: -8,
    },
    speedMedium: {
      fontSize: 72,
      fontWeight: '300' as const,
      letterSpacing: -4,
    },
    speedSmall: {
      fontSize: 48,
      fontWeight: '400' as const,
      letterSpacing: -2,
    },
    label: {
      fontSize: 12,
      fontWeight: '600' as const,
      letterSpacing: 2,
      textTransform: 'uppercase' as const,
    },
    value: {
      fontSize: 24,
      fontWeight: '500' as const,
    },
    unit: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 1,
    },
  },
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    gauge: 800,
  },
  thresholds: {
    speed: {
      warning: 120,
      critical: 180,
    },
    rpm: {
      warning: 5500,
      redline: 6500,
      max: 8000,
    },
    coolant: {
      warning: 100,
      critical: 110,
    },
    battery: {
      low: 11.5,
      warning: 12.0,
    },
    fuel: {
      low: 15,
      warning: 25,
    },
  },
};

export type ThemeStatus = 'normal' | 'warning' | 'critical';

export const getStatusColor = (status: ThemeStatus): string => {
  switch (status) {
    case 'warning':
      return DriveTheme.colors.status.warning;
    case 'critical':
      return DriveTheme.colors.status.critical;
    default:
      return DriveTheme.colors.status.normal;
  }
};

export const getSpeedStatus = (speed: number): ThemeStatus => {
  if (speed >= DriveTheme.thresholds.speed.critical) return 'critical';
  if (speed >= DriveTheme.thresholds.speed.warning) return 'warning';
  return 'normal';
};

export const getRpmStatus = (rpm: number): ThemeStatus => {
  if (rpm >= DriveTheme.thresholds.rpm.redline) return 'critical';
  if (rpm >= DriveTheme.thresholds.rpm.warning) return 'warning';
  return 'normal';
};

export const getCoolantStatus = (temp: number): ThemeStatus => {
  if (temp >= DriveTheme.thresholds.coolant.critical) return 'critical';
  if (temp >= DriveTheme.thresholds.coolant.warning) return 'warning';
  return 'normal';
};

export const getBatteryStatus = (voltage: number): ThemeStatus => {
  if (voltage <= DriveTheme.thresholds.battery.low) return 'critical';
  if (voltage <= DriveTheme.thresholds.battery.warning) return 'warning';
  return 'normal';
};

export const getFuelStatus = (level: number): ThemeStatus => {
  if (level <= DriveTheme.thresholds.fuel.low) return 'critical';
  if (level <= DriveTheme.thresholds.fuel.warning) return 'warning';
  return 'normal';
};
