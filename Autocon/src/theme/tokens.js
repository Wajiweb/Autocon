export const tokens = {
  colors: {
    background: {
      primary: 'var(--bg)',
      secondary: 'var(--surface-low)',
    },
    card: {
      base: 'var(--card)',
      elevated: 'var(--card-elevated)',
      hover: 'var(--card-hover)',
      active: 'var(--card-active)',
    },
    sidebar: {
      bg: 'var(--bg)',
    },
    primary: {
      main: 'var(--primary)',
      hover: 'var(--primary-hover)',
      light: 'var(--primary)',
      glow: 'var(--primary-glow)',
    },
    ai: {
      accent: 'var(--ai-accent)',
      teal: 'var(--ai-teal)',
    },
    text: {
      lightBg: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      darkBg: {
        primary: 'var(--text-dark-primary)',
        secondary: 'var(--text-dark-secondary)',
        muted: 'var(--text-dark-muted)',
      },
    },
    border: {
      light: 'var(--border-light)',
      dark: 'var(--border-dark)',
    },
    status: {
      success: 'var(--success)',
      warning: 'var(--warning)',
      error: 'var(--error)',
      info: 'var(--info)',
    },
  },
  spacing: {
    px: '1px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '32px',
    8: '40px',
    9: '48px',
    10: '64px',
  },
  radii: {
    sm: '7px',
    md: '8px',
    lg: '10px',
    xl: '12px',
    pill: '999px',
  },
  shadows: {
    soft: '0 4px 12px rgba(0, 0, 0, 0.05)',
    elevated: '0 8px 24px rgba(0, 0, 0, 0.25)',
    glow: 'var(--shadow-glow)',
    innerDepth: 'inset -1px 0 0 var(--surface)',
    card: '0 18px 44px rgba(7, 18, 15, 0.22)',
    cardHover: '0 22px 56px rgba(7, 18, 15, 0.28)',
  },
  transitions: {
    smooth: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fast: 'all 0.15s ease-out',
  },
  layout: {
    sidebar: '218px',
    topbar: '54px',
    contentMax: '1400px',
  },
};

