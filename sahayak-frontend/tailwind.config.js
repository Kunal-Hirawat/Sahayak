/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sahayak-blue': '#2E7D9A',
        'sahayak-green': '#4A9B4E',
        'sahayak-orange': '#E67E22',

        // Flattened gray shades
        'sahayak-gray-50': '#F8F9FA',
        'sahayak-gray-100': '#E9ECEF',
        'sahayak-gray-200': '#DEE2E6',
        'sahayak-gray-300': '#CED4DA',
        'sahayak-gray-400': '#ADB5BD',
        'sahayak-gray-500': '#6C757D',
        'sahayak-gray-600': '#495057',
        'sahayak-gray-700': '#343A40',
        'sahayak-gray-800': '#212529',
        'sahayak-gray-900': '#1A1E21',
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      maxWidth: {
        'mobile': '428px',
      },
    },
  },
  plugins: [],
}
