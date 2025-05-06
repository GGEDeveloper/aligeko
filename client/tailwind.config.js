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
          DEFAULT: '#1A1A1A', // Preto principal
          50: '#f2f2f2',
          100: '#e6e6e6',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1A1A1A',
        },
        brand: {
          DEFAULT: '#FFCC00', // Amarelo/Dourado
          50: '#fff9e6',
          100: '#fff4cc',
          200: '#ffea99',
          300: '#ffe066',
          400: '#ffd633',
          500: '#FFCC00',
          600: '#cca300',
          700: '#997a00',
          800: '#665200',
          900: '#332900',
        },
        neutral: {
          100: '#FFFFFF',
          200: '#F9FAFB',
          300: '#F3F4F6',
          400: '#E5E7EB',
          500: '#D1D5DB',
          600: '#9CA3AF',
          700: '#6B7280',
          800: '#4B5563',
          900: '#1F2937',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
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