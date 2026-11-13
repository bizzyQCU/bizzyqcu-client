import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      borderRadius: { card: '16px', field: '12px' },
      boxShadow: {
        card: '0 4px 12px -2px rgba(15,23,42,0.04)',
        'card-hover': '0 12px 24px -4px rgba(2,132,199,0.10)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        canvas: '#F8FAFC',
        ink: '#0F172A',
        body: '#334155',
        muted: '#64748B',
        placeholder: '#94A3B8',
        line: '#E2E8F0',
        primary: { DEFAULT: '#0284C7', deep: '#0369A1' },
        tint: '#8ACFF8',
        pop: '#FFD444',
        danger: '#BA1A1A',
        brand: {
          navy: '#1A365D',
          deepBlue: '#0F2756',
          yellow: '#FDB813',
          gold: '#F59E0B',
          amber: '#EAA212',
        },
      },
    },
  },
  plugins: [forms, containerQueries],
}
