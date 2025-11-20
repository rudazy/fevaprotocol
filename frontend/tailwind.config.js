/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#000000',
        'secondary-black': '#0a0a0a',
        'card-black': '#111111',
        'primary-red': '#FF0000',
        'accent-red': '#CC0000',
        'primary-blue': '#0066FF',
        'accent-blue': '#0052CC',
        'off-white': '#F5F5F5',
        'light-gray': '#CCCCCC',
        'dark-gray': '#333333',
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(255, 0, 0, 0.3)',
        'blue-glow': '0 0 20px rgba(0, 102, 255, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideDown': 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
