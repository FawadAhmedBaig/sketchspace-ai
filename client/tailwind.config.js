/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0F6B63',
          dark: '#0B524C',
          surface: '#E6F4F1',
        },
        aqua: {
          DEFAULT: '#4FD1C5',
          soft: '#E6FFFA',
        },
        cream: '#FAF9F6',
        charcoal: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          light: '#9CA3AF',
          border: '#E5E7EB',
        },
        brand: {
          teal: '#0F6B63',
          'teal-dark': '#0B524C',
          aqua: '#4FD1C5',
          cream: '#FAF9F6',
          charcoal: '#1F2937',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,41,55,.06), 0 8px 24px -12px rgba(31,41,55,.18)',
        soft: '0 2px 8px -2px rgba(15,107,99,.15), 0 1px 4px -1px rgba(0,0,0,.06)',
      },
    },
  },
  plugins: [],
};
