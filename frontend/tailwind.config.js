/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add any other paths that will contain Tailwind classes
  ],
  theme: {
    extend: {
      fontFamily: {
        arial: ['Arial', 'Helvetica', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      },
      colors: {
        zinc: {
          750: '#363636',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

