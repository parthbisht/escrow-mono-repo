/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcfe',
          300: '#8fc2ff',
          400: '#56a1ff',
          500: '#2d81ff',
          600: '#165fe8',
          700: '#134dcb',
          800: '#1742a4',
          900: '#19397f'
        }
      },
      boxShadow: {
        glow: '0 30px 80px rgba(15, 23, 42, 0.45)'
      }
    }
  },
  plugins: []
};
