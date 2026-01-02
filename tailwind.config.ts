import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
