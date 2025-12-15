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
        'sifter-dark': '#0a0a0f',
        'sifter-card': '#12121a',
        'sifter-border': '#2a2a3a',
        'sifter-green': '#22c55e',
        'sifter-red': '#ef4444',
        'sifter-yellow': '#eab308',
        'sifter-blue': '#3b82f6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
