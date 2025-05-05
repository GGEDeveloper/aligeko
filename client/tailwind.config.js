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
          50: '#e6ebf7',
          100: '#ccd7ef',
          200: '#99afdf',
          300: '#6687cf',
          400: '#335fbf',
          500: '#1E3A8A',  // Updated primary brand color
          600: '#182e6e',
          700: '#122353',
          800: '#0c1738',
          900: '#060c1c',
        },
        secondary: {
          50: '#fef4ee',
          100: '#fde9dd',
          200: '#fbd3ba',
          300: '#f9bd98',
          400: '#f7a775',
          500: '#F97316',  // Updated secondary brand color
          600: '#c75c12',
          700: '#95450d',
          800: '#642e09',
          900: '#321704',
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
        }
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