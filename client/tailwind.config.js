/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0F6B63',
          'teal-dark': '#0B524C',
          aqua: '#4FD1C5',
          cream: '#FAF9F6',
          charcoal: '#1F2937',
        },
        teal: {
          DEFAULT: '#0F6B63',
          dark: '#0A4A45',
          light: '#16857B',
          surface: '#E7F4F2',
        },
        aqua: {
          DEFAULT: '#4FD1C5',
          soft: '#E6FAF8',
          hover: '#38B2AC',
        },
        cream: {
          DEFAULT: '#FAF9F6',
          card: '#FFFFFF',
          subtle: '#F4F2EB',
        },
        charcoal: {
          DEFAULT: '#1F2937',
          muted: '#4B5563',
          light: '#6B7280',
          border: '#E5E7EB',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,41,55,.06), 0 8px 24px -12px rgba(31,41,55,.18)',
        soft: '0 4px 20px -2px rgba(15, 107, 99, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        handle: '0 4px 14px rgba(15, 107, 99, 0.35)',
      },
    },
  },
  plugins: [],
};
