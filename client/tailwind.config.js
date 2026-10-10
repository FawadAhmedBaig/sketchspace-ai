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
      },
      boxShadow: { card: '0 1px 2px rgba(31,41,55,.06), 0 8px 24px -12px rgba(31,41,55,.18)' },
    },
  },
  plugins: [],
};
