/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1fc',
          100: '#ccdffa',
          200: '#99bef5',
          300: '#669df0',
          400: '#337deb',
          500: '#005ce6',  // Primary brand color
          600: '#004ab8',
          700: '#00378a',
          800: '#00255c',
          900: '#00122e',
        },
        secondary: {
          50: '#fef3e6',
          100: '#fde7cc',
          200: '#fbcf99',
          300: '#f9b866',
          400: '#f7a033',
          500: '#f58800',  // Secondary brand color
          600: '#c46d00',
          700: '#935100',
          800: '#623600',
          900: '#311b00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
} 