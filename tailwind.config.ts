import type { Config } from 'tailwindcss'

/**
 * Sifter design tokens.
 *
 * `sifter.*` is the product palette used across the app (bg-sifter-dark,
 * bg-sifter-card, border-sifter-border, text-sifter-blue, ...). These classes
 * were referenced in ~60 files but never defined, so Tailwind silently dropped
 * them and every card/button lost its surface. Keep this block in sync with the
 * CSS variables in `src/app/globals.css`.
 *
 * `nansen.*` is kept for the older compact/data views that still use it.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sifter: {
          // Surfaces (darkest → lightest)
          dark: '#0A0E1A',
          card: '#141824',
          elevated: '#1A1F2E',
          hover: '#1F2433',
          // Lines
          border: {
            DEFAULT: '#1F2937',
            strong: '#374151',
          },
          // Text
          text: {
            DEFAULT: '#F9FAFB',
            muted: '#9CA3AF',
            subtle: '#6B7280',
          },
          // Brand / primary action
          blue: {
            DEFAULT: '#3B82F6',
            hover: '#2563EB',
            active: '#1D4ED8',
          },
          // Semantic
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#60A5FA',
        },
        nansen: {
          bg: {
            primary: '#0A0E1A',
            secondary: '#141824',
            tertiary: '#1A1F2E',
            hover: '#1F2433',
          },
          accent: {
            primary: '#00D4AA',
            secondary: '#7B61FF',
            tertiary: '#FF6B9D',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#9CA3AF',
            tertiary: '#6B7280',
            disabled: '#4B5563',
          },
          border: {
            DEFAULT: '#1F2937',
            hover: '#374151',
            active: '#4B5563',
          },
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.4), 0 1px 3px 1px rgb(0 0 0 / 0.25)',
        popover: '0 10px 30px -10px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(255 255 255 / 0.04)',
        focus: '0 0 0 2px #0A0E1A, 0 0 0 4px #3B82F6',
      },
      transitionDuration: {
        fast: '100ms',
        base: '200ms',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 250ms ease-out both',
      },
    },
  },
  plugins: [],
}
export default config
