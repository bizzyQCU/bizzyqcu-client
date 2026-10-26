import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
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
