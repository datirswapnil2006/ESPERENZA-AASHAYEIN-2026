/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF8F1',
          50: '#FDFCF9',
          100: '#FAF8F1',
          200: '#F4EEDC',
          300: '#EAE1C3',
        },
        'light-blue': {
          DEFAULT: '#EAF2FC',
          50: '#F5F9FE',
          100: '#EAF2FC',
          200: '#D5E6F9',
          300: '#BED9F6',
        },
        'primary-blue': {
          DEFAULT: '#3478C9',
          hover: '#2961A3',
          light: '#EAF2FC',
          dark: '#21518D',
        },
        'navy-blue': {
          DEFAULT: '#183153',
          light: '#234471',
          dark: '#0F2038',
        },
        'light-gray': '#F3F5F8',
        'navy-text': '#263445',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(24, 49, 83, 0.07), 0 4px 6px -2px rgba(24, 49, 83, 0.04)',
        'soft-lg': '0 10px 25px -5px rgba(24, 49, 83, 0.1), 0 8px 10px -6px rgba(24, 49, 83, 0.05)',
        'glow': '0 0 25px -5px rgba(52, 120, 201, 0.3)',
      }
    },
  },
  plugins: [],
}
