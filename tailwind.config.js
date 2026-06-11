/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sakura-pink': '#FFB7D5',
        'sakura-glow': '#FFC9E0',
        'moonlight': '#F8F7F2',
        'bg-deep': '#0B0B0F',
        'bg-surface': '#12121A',
        'bg-elevated': '#1A1A26',
        'gold': '#D4A853',
        'bamboo': '#4A7C59',
        'text-primary': '#F8F7F2',
        'text-secondary': '#9B98B0',
        'text-muted': '#5A5870',
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        lg: '16px',
      },
      animation: {
        'petal-spin': 'petalSpin 1.2s linear infinite',
        'sway': 'sway 4s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        petalSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        sway: {
          '0%': { transform: 'rotate(-1.5deg)' },
          '100%': { transform: 'rotate(1.5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
