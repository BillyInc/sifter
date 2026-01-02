// styles/nansen-theme.ts
export const nansenTheme = {
  colors: {
    // Dark background system
    bg: {
      primary: '#0A0E1A',      // Main background
      secondary: '#141824',    // Card background
      tertiary: '#1A1F2E',     // Elevated elements
      hover: '#1F2433',        // Hover states
    },
    // Accent colors
    accent: {
      primary: '#00D4AA',      // Nansen green
      secondary: '#7B61FF',    // Purple accent
      tertiary: '#FF6B9D',     // Pink accent
    },
    // Text hierarchy
    text: {
      primary: '#FFFFFF',      // Main text
      secondary: '#9CA3AF',    // Secondary text
      tertiary: '#6B7280',     // Muted text
      disabled: '#4B5563',     // Disabled
    },
    // Status colors
    status: {
      success: '#10B981',      // Green
      warning: '#F59E0B',      // Amber
      error: '#EF4444',        // Red
      info: '#3B82F6',         // Blue
    },
    // Border colors
    border: {
      default: '#1F2937',
      hover: '#374151',
      active: '#4B5563',
    }
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
    }
  }
};
